package com.CareBy.Gabi.servicos;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ServicoRequest(
    @NotBlank @Size(max = 160) String nome,
    @NotNull CategoriaServico categoria,
    String descricao,
    @NotNull @Min(15) @Max(480) Integer duracaoMinutos,
    @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal valorPadrao,
    @NotNull Boolean ativo
) {}
