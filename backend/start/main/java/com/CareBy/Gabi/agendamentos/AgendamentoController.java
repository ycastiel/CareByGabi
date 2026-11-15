package com.CareBy.Gabi.agendamentos;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final AgendamentoService service;
    public AgendamentoController(AgendamentoService service) { this.service = service; }

    @GetMapping
    public List<AgendamentoResponse> listar() { return service.listar(); }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(@Valid @RequestBody AgendamentoRequest dados) {
        AgendamentoResponse resposta = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/agendamentos/" + resposta.id())).body(resposta);
    }

    @PutMapping("/{id}")
    public AgendamentoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody AgendamentoRequest dados) {
        return service.atualizar(id, dados);
    }
}
