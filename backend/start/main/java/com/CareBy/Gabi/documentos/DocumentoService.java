package com.CareBy.Gabi.documentos;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import com.CareBy.Gabi.prontuarios.AutorDemo;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Documentos fictícios em TEXTO. Não gera laudo oficial, PDF assinado ou atestado clínico. */
@Service
@Profile("demo")
public class DocumentoService {
    private final JdbcTemplate jdbc;
    private final AutorDemo autor;
    public DocumentoService(JdbcTemplate jdbc, AutorDemo autor) { this.jdbc = jdbc; this.autor = autor; }

    private static final String COLUNAS = """
        SELECT d.id, d.paciente_id, p.nome AS paciente_nome, d.tipo, d.modelo, d.modelo_versao,
               d.titulo, d.conteudo, d.situacao, d.emitido_em, d.criado_em, d.atualizado_em
        FROM documentos d JOIN pacientes p ON p.id = d.paciente_id
        """;

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listar() {
        return jdbc.query(COLUNAS + " ORDER BY d.criado_em DESC, d.id DESC", this::mapear);
    }

    @Transactional
    public DocumentoResponse criar(DocumentoRequest dados) {
        verificarPaciente(dados.pacienteId());
        UUID id = UUID.randomUUID();
        jdbc.update("""
            INSERT INTO documentos (id, paciente_id, autor_id, tipo, titulo, conteudo,
                modelo, modelo_versao, situacao)
            VALUES (?, ?, ?, ?, ?, ?, 'PADRAO', 1, 'RASCUNHO')
            """, id, dados.pacienteId(), autor.garantirAutor(), dados.tipo().name(),
            dados.titulo().trim(), dados.conteudo().trim());
        return obter(id);
    }

    @Transactional
    public DocumentoResponse editar(UUID id, DocumentoRequest dados) {
        DocumentoResponse atual = obterBloqueando(id);
        exigirRascunho(atual);
        if (!atual.pacienteId().equals(dados.pacienteId())) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Não é permitido transferir o documento para outro paciente.");
        }
        jdbc.update("""
            UPDATE documentos SET tipo = ?, titulo = ?, conteudo = ?, atualizado_em = NOW() WHERE id = ?
            """, dados.tipo().name(), dados.titulo().trim(), dados.conteudo().trim(), id);
        return obter(id);
    }

    @Transactional
    public DocumentoResponse emitir(UUID id) {
        exigirRascunho(obterBloqueando(id));
        jdbc.update("UPDATE documentos SET situacao='EMITIDO', emitido_em=NOW(), atualizado_em=NOW() WHERE id=?", id);
        return obter(id);
    }

    @Transactional
    public DocumentoResponse cancelar(UUID id) {
        DocumentoResponse atual = obterBloqueando(id);
        if (atual.situacao() == SituacaoDocumento.CANCELADO) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Documento já cancelado.");
        }
        // Mantém conteúdo e emitido_em para preservar o histórico demonstrativo.
        jdbc.update("UPDATE documentos SET situacao='CANCELADO', atualizado_em=NOW() WHERE id=?", id);
        return obter(id);
    }

    @Transactional(readOnly = true)
    public boolean pertenceAoPaciente(UUID documentoId, UUID pacienteId) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM documentos WHERE id=? AND paciente_id=?",
            Integer.class, documentoId, pacienteId);
        return total != null && total > 0;
    }

    private void verificarPaciente(UUID id) {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM pacientes WHERE id=?", Integer.class, id);
        if (total == null || total == 0) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado.");
    }
    private void exigirRascunho(DocumentoResponse d) {
        if (d.situacao() != SituacaoDocumento.RASCUNHO) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Documento emitido ou cancelado não pode ser editado.");
        }
    }
    private DocumentoResponse obterBloqueando(UUID id) {
        List<DocumentoResponse> lista = jdbc.query(COLUNAS + " WHERE d.id=? FOR UPDATE OF d", this::mapear, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Documento não encontrado.");
        return lista.get(0);
    }
    private DocumentoResponse obter(UUID id) {
        List<DocumentoResponse> lista = jdbc.query(COLUNAS + " WHERE d.id=?", this::mapear, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Documento não encontrado.");
        return lista.get(0);
    }
    private DocumentoResponse mapear(ResultSet rs, int i) throws SQLException {
        OffsetDateTime emitido = rs.getObject("emitido_em", OffsetDateTime.class);
        return new DocumentoResponse(rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class),
            rs.getString("paciente_nome"), TipoDocumento.valueOf(rs.getString("tipo")),
            rs.getString("modelo"), rs.getInt("modelo_versao"), rs.getString("titulo"), rs.getString("conteudo"),
            SituacaoDocumento.valueOf(rs.getString("situacao")), emitido == null ? null : emitido.toInstant(),
            rs.getObject("criado_em", OffsetDateTime.class).toInstant(),
            rs.getObject("atualizado_em", OffsetDateTime.class).toInstant());
    }
}
