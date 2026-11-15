package com.CareBy.Gabi.arquivos;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import com.CareBy.Gabi.documentos.DocumentoService;
import com.CareBy.Gabi.prontuarios.AutorDemo;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Arquivos exclusivamente de demonstração: fora do public e nunca servidos por URL estática. */
@Service
@Profile("demo")
public class ArquivoService {
    private static final int MAX_BYTES = 8 * 1024 * 1024;
    private final JdbcTemplate jdbc;
    private final AutorDemo autor;
    private final DocumentoService documentos;
    private final String pastaConfigurada;

    public ArquivoService(JdbcTemplate jdbc, AutorDemo autor, DocumentoService documentos,
        @Value("${CAREBYGABI_STORAGE_DIR:}") String pastaConfigurada) {
        this.jdbc = jdbc;
        this.autor = autor;
        this.documentos = documentos;
        this.pastaConfigurada = pastaConfigurada;
    }

    private static final String COLUNAS = """
        SELECT id, paciente_id, documento_id, nome_original, mime_type, tamanho_bytes,
               checksum_sha256, chave_armazenamento, criado_em FROM arquivos
        """;

    @Transactional(readOnly = true)
    public List<ArquivoResponse> listar(UUID pacienteId) {
        return jdbc.query(COLUNAS + " WHERE paciente_id=? AND finalidade='ANEXO' ORDER BY criado_em DESC",
            (rs, i) -> mapear(rs), pacienteId);
    }

    @Transactional
    public ArquivoResponse enviar(UUID pacienteId, UUID documentoId, MultipartFile arquivo) {
        validarRelacionamento(pacienteId, documentoId);
        if (arquivo == null || arquivo.isEmpty() || arquivo.getSize() > MAX_BYTES) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Escolha um anexo de até 8 MiB.");
        }
        String nome = limparNome(arquivo.getOriginalFilename());
        byte[] bytes;
        try { bytes = arquivo.getBytes(); }
        catch (IOException e) { throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Não foi possível ler o anexo."); }
        String mime = verificarAssinatura(bytes, nome);
        String hash = sha256(bytes);
        UUID id = UUID.randomUUID();
        String chave = id + ".bin"; // Identificador interno não revela nome do paciente
        Path pasta = pastaPrivada();
        Path destino = pasta.resolve(chave);
        Path temporario = null;
        try {
            temporario = Files.createTempFile(pasta, "entrada-", ".tmp");
            Files.write(temporario, bytes, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
            try { Files.move(temporario, destino, StandardCopyOption.ATOMIC_MOVE); }
            catch (AtomicMoveNotSupportedException e) { Files.move(temporario, destino); }
            jdbc.update("""
                INSERT INTO arquivos (id, paciente_id, documento_id, enviado_por_id, finalidade,
                    nome_original, mime_type, tamanho_bytes, chave_armazenamento, checksum_sha256)
                VALUES (?, ?, ?, ?, 'ANEXO', ?, ?, ?, ?, ?)
                """, id, pacienteId, documentoId, autor.garantirAutor(), nome, mime, bytes.length, chave, hash);
            return new ArquivoResponse(id, pacienteId, documentoId, nome, mime, bytes.length, hash,
                obterData(id));
        } catch (Exception e) {
            try { Files.deleteIfExists(destino); } catch (IOException ignored) { /* conferir órfãos no backup */ }
            if (e instanceof ExcecaoNegocio negocio) throw negocio;
            if (e instanceof org.springframework.dao.DataAccessException erroBanco) throw erroBanco;
            throw new ExcecaoNegocio(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao armazenar o anexo.");
        } finally {
            if (temporario != null) try { Files.deleteIfExists(temporario); } catch (IOException ignored) { }
        }
    }

    @Transactional(readOnly = true)
    public ArquivoArmazenado obterArquivo(UUID id) {
        List<ArquivoArmazenado> lista = jdbc.query(COLUNAS + " WHERE id=? AND finalidade='ANEXO'",
            (rs, i) -> {
                ArquivoResponse meta = mapear(rs);
                String chave = rs.getString("chave_armazenamento");
                Path raiz = pastaPrivada();
                Path caminho = raiz.resolve(chave).normalize();
                if (!caminho.startsWith(raiz) || !chave.matches("[0-9a-f-]{36}\\.bin")) {
                    throw new ExcecaoNegocio(HttpStatus.INTERNAL_SERVER_ERROR, "Referência inválida de anexo.");
                }
                return new ArquivoArmazenado(meta, caminho);
            }, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Anexo não encontrado.");
        ArquivoArmazenado dado = lista.get(0);
        if (!Files.isRegularFile(dado.caminho(), LinkOption.NOFOLLOW_LINKS)) {
            throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Arquivo privado indisponível.");
        }
        return dado;
    }

    private void validarRelacionamento(UUID pacienteId, UUID documentoId) {
        Integer existe = jdbc.queryForObject("SELECT COUNT(*) FROM pacientes WHERE id=?", Integer.class, pacienteId);
        if (existe == null || existe == 0) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado.");
        if (documentoId != null && !documentos.pertenceAoPaciente(documentoId, pacienteId)) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Documento não pertence ao paciente selecionado.");
        }
    }
    private Path pastaPrivada() {
        if (pastaConfigurada == null || pastaConfigurada.isBlank()) {
            throw new ExcecaoNegocio(HttpStatus.SERVICE_UNAVAILABLE,
                "Configure CAREBYGABI_STORAGE_DIR apontando para uma pasta privada absoluta.");
        }
        Path pasta = Path.of(pastaConfigurada).normalize();
        if (!pasta.isAbsolute() || Files.isSymbolicLink(pasta)) {
            throw new ExcecaoNegocio(HttpStatus.SERVICE_UNAVAILABLE,
                "A pasta de armazenamento deve ser absoluta e não pode ser um link simbólico.");
        }
        Path cwd = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path projeto = cwd.getFileName() != null && cwd.getFileName().toString().equalsIgnoreCase("backend")
            ? cwd.getParent() : cwd;
        if (pasta.startsWith(projeto)) {
            throw new ExcecaoNegocio(HttpStatus.SERVICE_UNAVAILABLE,
                "Armazenamento privado deve ficar fora do repositório e do diretório público do frontend.");
        }
        try { Files.createDirectories(pasta); }
        catch (IOException e) { throw new ExcecaoNegocio(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível criar a pasta privada."); }
        return pasta;
    }
    private static String limparNome(String original) {
        String nome = original == null ? "anexo" : original.replace('\\', '/');
        nome = nome.substring(nome.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
        if (nome.isBlank() || nome.length() > 255) throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Nome de arquivo inválido.");
        return nome;
    }
    private static String verificarAssinatura(byte[] dados, String nome) {
        if (dados.length == 0 || dados.length > MAX_BYTES) throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Arquivo inválido.");
        String ext = nome.contains(".") ? nome.substring(nome.lastIndexOf('.') + 1).toLowerCase(java.util.Locale.ROOT) : "";
        boolean pdf = dados.length > 4 && dados[0] == '%' && dados[1] == 'P' && dados[2] == 'D' && dados[3] == 'F' && dados[4] == '-';
        boolean png = dados.length > 7 && dados[0] == (byte)0x89 && dados[1] == 'P' && dados[2] == 'N' && dados[3] == 'G' && dados[4] == 13 && dados[5] == 10 && dados[6] == 26 && dados[7] == 10;
        boolean jpg = dados.length > 2 && dados[0] == (byte)0xff && dados[1] == (byte)0xd8 && dados[2] == (byte)0xff;
        boolean webp = dados.length > 11 && dados[0] == 'R' && dados[1] == 'I' && dados[2] == 'F' && dados[3] == 'F' && dados[8] == 'W' && dados[9] == 'E' && dados[10] == 'B' && dados[11] == 'P';
        return switch (ext) {
            case "pdf" -> pdf ? "application/pdf" : assinaturaInvalida();
            case "png" -> png ? "image/png" : assinaturaInvalida();
            case "jpg", "jpeg" -> jpg ? "image/jpeg" : assinaturaInvalida();
            case "webp" -> webp ? "image/webp" : assinaturaInvalida();
            default -> throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Envie apenas PDF, PNG, JPG ou WEBP.");
        };
    }
    private static String assinaturaInvalida() {
        throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Extensão e assinatura do arquivo não correspondem.");
    }
    private static String sha256(byte[] dados) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(dados)); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 indisponível", e); }
    }
    private java.time.Instant obterData(UUID id) {
        return jdbc.queryForObject("SELECT criado_em FROM arquivos WHERE id=?",
            (rs, i) -> rs.getObject(1, OffsetDateTime.class).toInstant(), id);
    }
    private static ArquivoResponse mapear(ResultSet rs) throws SQLException {
        return new ArquivoResponse(rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class),
            rs.getObject("documento_id", UUID.class), rs.getString("nome_original"), rs.getString("mime_type"),
            rs.getLong("tamanho_bytes"), rs.getString("checksum_sha256"),
            rs.getObject("criado_em", OffsetDateTime.class).toInstant());
    }
}
