package com.CareBy.Gabi.helpers;

import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorErros {
    @ExceptionHandler(ExcecaoNegocio.class)
    public ResponseEntity<ErroApi> negocio(ExcecaoNegocio ex) {
        return ResponseEntity.status(ex.getStatus()).body(ErroApi.de(ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroApi> validacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
            erros.putIfAbsent(e.getField(), e.getDefaultMessage() == null ? "Valor inválido" : e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ErroApi.de("Verifique os campos informados.", erros));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, ConstraintViolationException.class})
    public ResponseEntity<ErroApi> corpoInvalido(Exception ex) {
        return ResponseEntity.badRequest().body(ErroApi.de("Requisição inválida. Verifique datas e campos.", Map.of()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroApi> conflitoIntegridade(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErroApi.de("Conflito de dados: horário ocupado ou registro vinculado.", Map.of()));
    }
}
