package com.CareBy.Gabi.prontuarios;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("demo") // Rotas clínicas disponíveis SOMENTE no perfil local de demonstração.
@RequestMapping("/api/prontuarios")
public class ProntuarioController {
    private final ProntuarioService service;
    public ProntuarioController(ProntuarioService service) { this.service = service; }

    @GetMapping public List<ProntuarioResponse> listar() { return service.listar(); }

    @PostMapping
    public ResponseEntity<ProntuarioResponse> abrir(@Valid @RequestBody AberturaProntuarioRequest entrada) {
        ProntuarioResponse resposta = service.abrir(entrada);
        return ResponseEntity.created(URI.create("/api/prontuarios/" + resposta.id())).body(resposta);
    }

    @GetMapping("/{id}/registros")
    public List<RegistroResponse> listarRegistros(@PathVariable UUID id) {
        return service.listarRegistros(id);
    }

    @PostMapping("/{id}/registros")
    public ResponseEntity<RegistroResponse> criar(@PathVariable UUID id,
            @Valid @RequestBody RegistroRequest dados) {
        RegistroResponse resposta = service.criarRegistro(id, dados);
        return ResponseEntity.created(URI.create("/api/prontuarios/" + id + "/registros/" + resposta.id()))
            .body(resposta);
    }

    @PutMapping("/{id}/registros/{registroId}")
    public RegistroResponse atualizar(@PathVariable UUID id, @PathVariable UUID registroId,
            @Valid @RequestBody RegistroRequest dados) {
        return service.atualizarRascunho(id, registroId, dados);
    }

    @PostMapping("/{id}/registros/{registroId}/finalizar")
    public RegistroResponse finalizar(@PathVariable UUID id, @PathVariable UUID registroId) {
        return service.finalizar(id, registroId);
    }

    @PostMapping("/{id}/encerrar")
    public ProntuarioResponse encerrar(@PathVariable UUID id) { return service.encerrar(id); }
}
