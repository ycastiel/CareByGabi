package com.CareBy.Gabi.avaliacoes;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record AvaliacaoRequest(
    @NotNull UUID pacienteId,
    @NotNull TipoAvaliacao tipo,
    @NotBlank @Size(max = 200) String titulo,
    @Size(max = 5000) String contexto,
    @Size(max = 5000) String objetivo,
    @NotNull @Size(max = 25) List<@NotNull @Valid CriterioAvaliacao> criterios,
    @Size(max = 8000) String sinteseRascunho
) {}
