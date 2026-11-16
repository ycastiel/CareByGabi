package com.CareBy.Gabi.financeiro;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Endpoints exclusivamente demonstrativos; nunca publicar com Basic Auth de um único usuário. */
@RestController
@Profile("demo")
@RequestMapping("/api/financeiro")
public class FinanceiroController {
    private final FinanceiroService service;
    public FinanceiroController(FinanceiroService service) { this.service = service; }

    @GetMapping("/cobrancas")
    public List<CobrancaResponse> listar() { return service.listarCobrancas(); }

    @PostMapping("/cobrancas")
    public ResponseEntity<CobrancaResponse> criar(@Valid @RequestBody CobrancaRequest dados) {
        CobrancaResponse nova = service.criarCobranca(dados);
        return ResponseEntity.created(URI.create("/api/financeiro/cobrancas/" + nova.id())).body(nova);
    }

    @PutMapping("/cobrancas/{id}")
    public CobrancaResponse editar(@PathVariable UUID id, @Valid @RequestBody CobrancaRequest dados) {
        return service.editarCobranca(id, dados);
    }

    @PostMapping("/cobrancas/{id}/cancelar")
    public CobrancaResponse cancelar(@PathVariable UUID id) { return service.cancelarCobranca(id); }

    @GetMapping("/cobrancas/{id}/pagamentos")
    public List<PagamentoResponse> listarPagamentos(@PathVariable UUID id) {
        return service.listarPagamentos(id);
    }

    @PostMapping("/cobrancas/{id}/pagamentos")
    public ResponseEntity<PagamentoResponse> registrarPagamento(
        @PathVariable UUID id, @Valid @RequestBody PagamentoRequest dados) {
        PagamentoResponse novo = service.registrarPagamento(id, dados);
        return ResponseEntity.created(URI.create("/api/financeiro/cobrancas/" + id + "/pagamentos/" + novo.id())).body(novo);
    }
}
