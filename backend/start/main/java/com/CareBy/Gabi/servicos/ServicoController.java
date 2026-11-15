package com.CareBy.Gabi.servicos;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {
    private final ServicoService service;
    public ServicoController(ServicoService service) { this.service = service; }

    @GetMapping
    public List<ServicoResponse> listar() { return service.listar(); }

    @PostMapping
    public ResponseEntity<ServicoResponse> criar(@Valid @RequestBody ServicoRequest dados) {
        ServicoResponse resposta = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/servicos/" + resposta.id())).body(resposta);
    }

    @PutMapping("/{id}")
    public ServicoResponse atualizar(@PathVariable UUID id, @Valid @RequestBody ServicoRequest dados) {
        return service.atualizar(id, dados);
    }
}
