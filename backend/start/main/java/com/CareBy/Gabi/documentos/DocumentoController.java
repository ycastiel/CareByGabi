package com.CareBy.Gabi.documentos;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("demo")
@RequestMapping("/api/documentos")
public class DocumentoController {
    private final DocumentoService service;
    public DocumentoController(DocumentoService service) { this.service = service; }

    @GetMapping public List<DocumentoResponse> listar() { return service.listar(); }

    @PostMapping
    public ResponseEntity<DocumentoResponse> criar(@Valid @RequestBody DocumentoRequest dados) {
        DocumentoResponse resposta = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/documentos/" + resposta.id())).body(resposta);
    }

    @PutMapping("/{id}")
    public DocumentoResponse editar(@PathVariable UUID id, @Valid @RequestBody DocumentoRequest dados) {
        return service.editar(id, dados);
    }

    @PostMapping("/{id}/emitir")
    public DocumentoResponse emitir(@PathVariable UUID id) { return service.emitir(id); }

    @PostMapping("/{id}/cancelar")
    public DocumentoResponse cancelar(@PathVariable UUID id) { return service.cancelar(id); }
}
