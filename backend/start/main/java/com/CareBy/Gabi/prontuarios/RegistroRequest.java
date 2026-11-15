package com.CareBy.Gabi.prontuarios;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
    @NotNull CategoriaRegistro categoria,
    @NotBlank @Size(max = 12000) String conteudo
) {}
