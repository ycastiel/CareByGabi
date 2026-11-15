package com.CareBy.Gabi.prontuarios;

import java.time.LocalDate;
import java.util.UUID;

public record ProntuarioResponse(
    UUID id,
    UUID pacienteId,
    String pacienteNome,
    LocalDate abertoEm,
    LocalDate encerradoEm,
    SituacaoProntuario situacao
) {
    public static ProntuarioResponse de(Prontuario p) {
        return new ProntuarioResponse(p.getId(), p.getPaciente().getId(), p.getPaciente().getNome(),
            p.getAbertoEm(), p.getEncerradoEm(), p.getSituacao());
    }
}
