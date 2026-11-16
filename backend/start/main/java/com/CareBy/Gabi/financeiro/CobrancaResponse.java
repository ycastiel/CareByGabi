package com.CareBy.Gabi.financeiro;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Montantes monetários são enviados como strings decimais para evitar perda de precisão no JavaScript. */
public record CobrancaResponse(
    UUID id, UUID pacienteId, String pacienteNome,
    UUID servicoId, String servicoNome,
    String descricao, String valor, String valorRecebido, String saldoAberto,
    LocalDate vencimentoEm, SituacaoCobranca situacao,
    Instant criadoEm
) {}
