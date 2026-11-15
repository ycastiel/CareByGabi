package com.CareBy.Gabi.prontuarios;

import java.time.Instant;
import java.util.UUID;

public record RegistroResponse(
    UUID id,
    UUID prontuarioId,
    CategoriaRegistro categoria,
    String conteudo,
    SituacaoRegistro situacao,
    Instant criadoEm,
    Instant atualizadoEm,
    Instant finalizadoEm
) {
    public static RegistroResponse de(RegistroClinico r) {
        return new RegistroResponse(r.getId(), r.getProntuario().getId(), r.getCategoria(),
            r.getConteudo(), r.getSituacao(), r.getCriadoEm(), r.getAtualizadoEm(), r.getFinalizadoEm());
    }
}
