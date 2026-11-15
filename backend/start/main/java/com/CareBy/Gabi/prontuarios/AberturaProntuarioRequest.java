package com.CareBy.Gabi.prontuarios;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AberturaProntuarioRequest(@NotNull UUID pacienteId) {}
