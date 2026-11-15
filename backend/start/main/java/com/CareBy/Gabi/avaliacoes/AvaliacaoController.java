package com.CareBy.Gabi.avaliacoes;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("demo")
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {
    private final AvaliacaoService service;
    public AvaliacaoController(AvaliacaoService service) { this.service = service; }

    @GetMapping public List<AvaliacaoResponse> listar() { return service.listar(); }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> criar(@Valid @RequestBody AvaliacaoRequest dados) {
        AvaliacaoResponse resposta = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/avaliacoes/" + resposta.id())).body(resposta);
    }

    @PutMapping("/{id}")
    public AvaliacaoResponse editar(@PathVariable UUID id, @Valid @RequestBody AvaliacaoRequest dados) {
        return service.editar(id, dados);
    }

    @PostMapping("/{id}/revisar")
    public AvaliacaoResponse revisar(@PathVariable UUID id) { return service.revisar(id); }
}
