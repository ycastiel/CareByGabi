package com.CareBy.Gabi.avaliacoes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AvaliacaoResponse(
    UUID id, UUID pacienteId, String pacienteNome, TipoAvaliacao tipo, String titulo,
    String contexto, String objetivo, String modeloCodigo, int modeloVersao,
    List<CriterioAvaliacao> criterios, String sinteseRascunho,
    SituacaoAvaliacao situacao, Instant realizadoEm, Instant criadoEm
) {}
