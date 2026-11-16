package com.CareBy.Gabi.financeiro;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CobrancaRequest(
    @NotNull UUID pacienteId,
    UUID servicoId,
    @NotBlank @Size(max = 255) String descricao,
    @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal valor,
    @NotNull LocalDate vencimentoEm
) {}
