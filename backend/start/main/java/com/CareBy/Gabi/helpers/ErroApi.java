package com.CareBy.Gabi.helpers;

import java.time.Instant;
import java.util.Map;

public record ErroApi(String mensagem, Map<String, String> campos, Instant instante) {
    public static ErroApi de(String mensagem, Map<String, String> campos) {
        return new ErroApi(mensagem, campos, Instant.now());
    }
}
