package com.CareBy.Gabi.financeiro;

import java.time.Instant;
import java.util.UUID;

public record PagamentoResponse(
    UUID id, UUID cobrancaId, String valor,
    MetodoPagamento metodo, Instant recebidoEm,
    String referencia, String observacaoAdministrativa
) {}
