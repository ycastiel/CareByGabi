package com.CareBy.Gabi.helpers;

import org.springframework.http.HttpStatus;

public class ExcecaoNegocio extends RuntimeException {
    private final HttpStatus status;
    public ExcecaoNegocio(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }
    public HttpStatus getStatus() { return status; }
}
