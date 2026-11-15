package com.CareBy.Gabi.arquivos;

import java.time.Instant;
import java.util.UUID;

public record ArquivoResponse(UUID id, UUID pacienteId, UUID documentoId, String nomeOriginal,
                              String mimeType, long tamanhoBytes, String checksumSha256, Instant criadoEm) {}
