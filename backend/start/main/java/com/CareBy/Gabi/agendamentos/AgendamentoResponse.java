package com.CareBy.Gabi.agendamentos;

import java.time.Instant;
import java.util.UUID;

public record AgendamentoResponse(
    UUID id, UUID pacienteId, String pacienteNome, UUID servicoId,
    String servicoNome, Instant inicioEm, Instant fimEm,
    ModalidadeAgendamento modalidade, SituacaoAgendamento situacao,
    String linkReuniao, String observacaoAdministrativa,
    Instant criadoEm, Instant atualizadoEm
) {
    public static AgendamentoResponse de(Agendamento a) {
        return new AgendamentoResponse(a.getId(), a.getPaciente().getId(), a.getPaciente().getNome(),
            a.getServico().getId(), a.getServico().getNome(), a.getInicioEm(), a.getFimEm(),
            a.getModalidade(), a.getSituacao(), a.getLinkReuniao(), a.getObservacaoAdministrativa(),
            a.getCriadoEm(), a.getAtualizadoEm());
    }
}
