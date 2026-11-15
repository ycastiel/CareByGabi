package com.CareBy.Gabi.documentos;

import java.time.Instant;
import java.util.UUID;

public record DocumentoResponse(
    UUID id, UUID pacienteId, String pacienteNome, TipoDocumento tipo,
    String modelo, int modeloVersao, String titulo, String conteudo,
    SituacaoDocumento situacao, Instant emitidoEm, Instant criadoEm, Instant atualizadoEm
) {}
