package com.CareBy.Gabi.avaliacoes;

import jakarta.validation.constraints.*;

/** Cópia estruturada do critério no momento da avaliação (snapshot JSONB). */
public record CriterioAvaliacao(
    @NotBlank @Size(max = 100) String modulo,
    @NotBlank @Size(max = 160) String criterio,
    @NotNull @Min(1) @Max(5) Integer nivel,
    @Size(max = 1000) String evidencia
) {}
