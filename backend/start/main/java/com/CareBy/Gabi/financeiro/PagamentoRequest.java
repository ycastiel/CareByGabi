package com.CareBy.Gabi.financeiro;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PagamentoRequest(
    @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal valor,
    @NotNull MetodoPagamento metodo,
    @Size(max = 160) String referencia,
    @Size(max = 3000) String observacaoAdministrativa
) {}
