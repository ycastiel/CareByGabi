package com.CareBy.Gabi.financeiro;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

/** Financeiro do MVP local. Nenhuma cobrança ou pagamento é criado automaticamente pela agenda. */
@Service
@Profile("demo")
public class FinanceiroService {
    private final JdbcTemplate jdbc;
    public FinanceiroService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private static final String CONSULTA_COBRANCAS = """
        SELECT c.id, c.paciente_id, p.nome AS paciente_nome,
               c.servico_id, s.nome AS servico_nome, c.descricao,
               c.valor, c.vencimento_em, c.situacao, c.criado_em,
               COALESCE((SELECT SUM(pg.valor) FROM pagamentos pg
                         WHERE pg.cobranca_id = c.id), 0) AS valor_recebido
        FROM cobrancas c
        JOIN pacientes p ON p.id = c.paciente_id
        LEFT JOIN servicos s ON s.id = c.servico_id
        """;

    @Transactional(readOnly = true)
    public List<CobrancaResponse> listarCobrancas() {
        return jdbc.query(CONSULTA_COBRANCAS + " ORDER BY c.vencimento_em DESC, c.criado_em DESC", this::mapearCobranca);
    }

    @Transactional
    public CobrancaResponse criarCobranca(CobrancaRequest dados) {
        validarRelacionamentos(dados);
        UUID id = UUID.randomUUID();
        jdbc.update("""
            INSERT INTO cobrancas (id, paciente_id, servico_id, descricao, valor, vencimento_em, situacao)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDENTE')
            """, id, dados.pacienteId(), dados.servicoId(), dados.descricao().trim(),
            dinheiro(dados.valor()), dados.vencimentoEm());
        return obterCobranca(id);
    }

    @Transactional
    public CobrancaResponse editarCobranca(UUID id, CobrancaRequest dados) {
        CobrancaResponse atual = bloquearCobranca(id);
        exigirSemPagamentos(atual);
        validarRelacionamentos(dados);
        jdbc.update("""
            UPDATE cobrancas SET paciente_id = ?, servico_id = ?, descricao = ?, valor = ?, vencimento_em = ?
            WHERE id = ?
            """, dados.pacienteId(), dados.servicoId(), dados.descricao().trim(),
            dinheiro(dados.valor()), dados.vencimentoEm(), id);
        return obterCobranca(id);
    }

    @Transactional
    public CobrancaResponse cancelarCobranca(UUID id) {
        CobrancaResponse atual = bloquearCobranca(id);
        exigirSemPagamentos(atual);
        jdbc.update("UPDATE cobrancas SET situacao = 'CANCELADA' WHERE id = ?", id);
        return obterCobranca(id);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponse> listarPagamentos(UUID cobrancaId) {
        obterCobranca(cobrancaId); // retorna 404, não expõe coleções órfãs
        return jdbc.query("""
            SELECT id, cobranca_id, valor, metodo, recebido_em, referencia, observacao_administrativa
            FROM pagamentos WHERE cobranca_id = ? ORDER BY recebido_em DESC, id DESC
            """, this::mapearPagamento, cobrancaId);
    }

    @Transactional
    public PagamentoResponse registrarPagamento(UUID cobrancaId, PagamentoRequest dados) {
        // Serializa pagamentos concorrentes sobre a mesma cobrança, antes de calcular o saldo.
        CobrancaResponse cobranca = bloquearCobranca(cobrancaId);
        if (cobranca.situacao() == SituacaoCobranca.CANCELADA) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Não é possível pagar cobrança cancelada.");
        }
        if (cobranca.situacao() == SituacaoCobranca.PAGA) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Esta cobrança já foi quitada.");
        }
        BigDecimal valor = dinheiro(dados.valor());
        BigDecimal saldo = new BigDecimal(cobranca.saldoAberto());
        if (valor.compareTo(saldo) > 0) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "O pagamento ultrapassa o saldo aberto da cobrança.");
        }
        UUID id = UUID.randomUUID();
        jdbc.update("""
            INSERT INTO pagamentos (id, cobranca_id, valor, metodo, referencia, observacao_administrativa)
            VALUES (?, ?, ?, ?, ?, ?)
            """, id, cobrancaId, valor, dados.metodo().name(),
            opcional(dados.referencia()), opcional(dados.observacaoAdministrativa()));
        BigDecimal restante = saldo.subtract(valor);
        String situacao = restante.signum() == 0 ? "PAGA" : "PARCIAL";
        jdbc.update("UPDATE cobrancas SET situacao = ? WHERE id = ?", situacao, cobrancaId);
        return obterPagamento(id);
    }

    private void validarRelacionamentos(CobrancaRequest dados) {
        List<String> vinculos = jdbc.query("SELECT vinculo FROM pacientes WHERE id = ?",
            (rs, i) -> rs.getString("vinculo"), dados.pacienteId());
        if (vinculos.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado.");
        if ("RESPONSAVEL".equals(vinculos.get(0))) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Selecione um paciente ou avaliado, não um responsável isolado.");
        }
        if (dados.servicoId() != null) {
            Integer existe = jdbc.queryForObject("SELECT COUNT(*) FROM servicos WHERE id = ?", Integer.class, dados.servicoId());
            if (existe == null || existe == 0) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Serviço não encontrado.");
        }
    }

    private void exigirSemPagamentos(CobrancaResponse atual) {
        if (atual.situacao() == SituacaoCobranca.CANCELADA) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Cobrança cancelada não pode ser alterada.");
        }
        if (new BigDecimal(atual.valorRecebido()).signum() > 0) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT,
                "Cobrança com pagamentos não pode ser editada ou cancelada. Será necessário um fluxo de estorno.");
        }
    }

    private CobrancaResponse bloquearCobranca(UUID id) {
        // Bloqueia primeiro. A consulta de somatório DEVE ser outra instrução SQL:
        // em READ COMMITTED, ela terá snapshot novo após aguardar eventual lock concorrente.
        List<UUID> ids = jdbc.query("SELECT id FROM cobrancas WHERE id = ? FOR UPDATE",
            (rs, i) -> rs.getObject("id", UUID.class), id);
        if (ids.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Cobrança não encontrada.");
        return obterCobranca(id);
    }
    private CobrancaResponse obterCobranca(UUID id) {
        List<CobrancaResponse> lista = jdbc.query(CONSULTA_COBRANCAS + " WHERE c.id = ?", this::mapearCobranca, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Cobrança não encontrada.");
        return lista.get(0);
    }
    private PagamentoResponse obterPagamento(UUID id) {
        List<PagamentoResponse> lista = jdbc.query("""
            SELECT id, cobranca_id, valor, metodo, recebido_em, referencia, observacao_administrativa
            FROM pagamentos WHERE id = ?
            """, this::mapearPagamento, id);
        if (lista.isEmpty()) throw new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Pagamento não encontrado.");
        return lista.get(0);
    }
    private CobrancaResponse mapearCobranca(ResultSet rs, int i) throws SQLException {
        BigDecimal valor = rs.getBigDecimal("valor");
        BigDecimal recebido = rs.getBigDecimal("valor_recebido");
        return new CobrancaResponse(
            rs.getObject("id", UUID.class), rs.getObject("paciente_id", UUID.class), rs.getString("paciente_nome"),
            rs.getObject("servico_id", UUID.class), rs.getString("servico_nome"), rs.getString("descricao"),
            decimal(valor), decimal(recebido), decimal(valor.subtract(recebido)),
            rs.getObject("vencimento_em", java.time.LocalDate.class),
            SituacaoCobranca.valueOf(rs.getString("situacao")),
            rs.getObject("criado_em", OffsetDateTime.class).toInstant());
    }
    private PagamentoResponse mapearPagamento(ResultSet rs, int i) throws SQLException {
        return new PagamentoResponse(
            rs.getObject("id", UUID.class), rs.getObject("cobranca_id", UUID.class), decimal(rs.getBigDecimal("valor")),
            MetodoPagamento.valueOf(rs.getString("metodo")),
            rs.getObject("recebido_em", OffsetDateTime.class).toInstant(),
            rs.getString("referencia"), rs.getString("observacao_administrativa"));
    }
    private static String decimal(BigDecimal valor) { return valor.setScale(2, RoundingMode.UNNECESSARY).toPlainString(); }
    private static BigDecimal dinheiro(BigDecimal valor) { return valor.setScale(2, RoundingMode.UNNECESSARY); }
    private static String opcional(String texto) { return texto == null || texto.isBlank() ? null : texto.trim(); }
}
