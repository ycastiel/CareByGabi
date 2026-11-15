package com.CareBy.Gabi.agendamentos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record AgendamentoRequest(
    @NotNull UUID pacienteId,
    @NotNull UUID servicoId,
    @NotNull Instant inicioEm,
    @NotNull Instant fimEm,
    @NotNull ModalidadeAgendamento modalidade,
    @NotNull SituacaoAgendamento situacao,
    @Size(max = 2048) String linkReuniao,
    String observacaoAdministrativa
) {}
