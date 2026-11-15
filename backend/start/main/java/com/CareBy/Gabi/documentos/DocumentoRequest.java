package com.CareBy.Gabi.documentos;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record DocumentoRequest(
    @NotNull UUID pacienteId,
    @NotNull TipoDocumento tipo,
    @NotBlank @Size(max = 220) String titulo,
    @NotBlank @Size(max = 30000) String conteudo
) {}
