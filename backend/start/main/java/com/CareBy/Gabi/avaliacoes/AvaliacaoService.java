package com.CareBy.Gabi.avaliacoes;

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
import tools.jackson.databind.json.JsonMapper;

/** Avaliações fictícias: snapshots JSONB, sem scoring automatizado e sem diagnóstico por IA. */
@Service
@Profile("demo")
public class AvaliacaoService {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;
    private final AutorDemo autor;

    public AvaliacaoService(JdbcTemplate jdbc, JsonMapper json, AutorDemo autor) {
        this.jdbc = jdbc;
        this.json = json;
        this.autor = autor;
    }

    private static final String COLUNAS = """
        SELECT a.id, a.paciente_id, p.nome AS paciente_nome, a.tipo, a.titulo,
               a.contexto, a.objetivo, a.modelo_codigo, a.modelo_versao,
               a.dados_criterios::text AS dados_criterios, a.sintese_rascunho,
               a.situacao, a.realizado_em, a.criado_em
        FROM avaliacoes a JOIN pacientes p ON p.id = a.paciente_id
        """;

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listar() {
        return jdbc.query(COLUNAS + " ORDER BY a.realizado_em DESC, a.id DESC", this::mapear);
    }

    @Transactional
    public AvaliacaoResponse criar(AvaliacaoRequest req) {
        validarPaciente(req.pacienteId());
        UUID id = UUID.randomUUID();
        jdbc.update("""
            INSERT INTO avaliacoes (id, paciente_id, autor_id, tipo, titulo,
                contexto, objetivo, modelo_codigo, modelo_versao, dados_criterios,
                sintese_rascunho, situacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, CAST(? AS jsonb), ?, 'RASCUNHO')
            """, id, req.pacienteId(), autor.garantirAutor(), req.tipo().name(),
            req.titulo().trim(), opcional(req.contexto()), opcional(req.objetivo()),
            json.writeValueAsString(req.criterios()), opcional(req.sinteseRascunho()));
        return obter(id);
    }

    @Transactional
    public AvaliacaoResponse editar(UUID id, AvaliacaoRequest req) {
        AvaliacaoResponse atual = bloquear(id);
        exigirRascunho(atual);
        if (!atual.pacienteId().equals(req.pacienteId())) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Não é permitido transferir uma avaliação para outro paciente.");
        }
        jdbc.update("""
            UPDATE avaliacoes SET tipo = ?, titulo = ?, contexto = ?, objetivo = ?,
                dados_criterios = CAST(? AS jsonb), sintese_rascunho = ? WHERE id = ?
            """, req.tipo().name(), req.titulo().trim(), opcional(req.contexto()),
            opcional(req.objetivo()), json.writeValueAsString(req.criterios()),
            opcional(req.sinteseRascunho()), id);
        return obter(id);
    }

    @Transactional
    public AvaliacaoResponse revisar(UUID id) {
        exigirRascunho(bloquear(id));
        jdbc.update("UPDATE avaliacoes SET situacao = 'REVISADA' WHERE id = ?", id);
        return obter(id);
    }

    private void validarPaciente(UUID id) {
        List<String> vinculos = jdbc.query("SELECT vinculo FROM pacientes WHERE id = ?", (rs, i) -> rs.getString(1), id);
        if (vinculos.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado.");
        if ("RESPONSAVEL".equals(vinculos.get(0))) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Selecione um paciente ou avaliado, não um responsável isolado.");
        }
    }

    private void exigirRascunho(AvaliacaoResponse atual) {
        if (atual.situacao() != SituacaoAvaliacao.RASCUNHO) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Avaliação revisada não pode ser alterada.");
        }
    }

    private AvaliacaoResponse bloquear(UUID id) {
        List<AvaliacaoResponse> lista = jdbc.query(COLUNAS + " WHERE a.id = ? FOR UPDATE OF a", this::mapear, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Avaliação não encontrada.");
        return lista.get(0);
    }
    private AvaliacaoResponse obter(UUID id) {
        List<AvaliacaoResponse> lista = jdbc.query(COLUNAS + " WHERE a.id = ?", this::mapear, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Avaliação não encontrada.");
        return lista.get(0);
    }
    private AvaliacaoResponse mapear(ResultSet rs, int indice) throws SQLException {
        CriterioAvaliacao[] criterios = json.readValue(rs.getString("dados_criterios"), CriterioAvaliacao[].class);
        return new AvaliacaoResponse(
            rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class),
            rs.getString("paciente_nome"), TipoAvaliacao.valueOf(rs.getString("tipo")),
            rs.getString("titulo"), rs.getString("contexto"), rs.getString("objetivo"),
            rs.getString("modelo_codigo"), rs.getInt("modelo_versao"), List.of(criterios),
            rs.getString("sintese_rascunho"), SituacaoAvaliacao.valueOf(rs.getString("situacao")),
            rs.getObject("realizado_em", OffsetDateTime.class).toInstant(),
            rs.getObject("criado_em", OffsetDateTime.class).toInstant());
    }
    private static String opcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
