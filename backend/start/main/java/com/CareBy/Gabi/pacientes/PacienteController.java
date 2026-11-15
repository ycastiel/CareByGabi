package com.CareBy.Gabi.pacientes;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {
    private final PacienteService service;
    public PacienteController(PacienteService service) { this.service = service; }

    @GetMapping
    public List<PacienteResponse> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public PacienteResponse buscar(@PathVariable UUID id) { return service.buscar(id); }

    @PostMapping
    public ResponseEntity<PacienteResponse> criar(@Valid @RequestBody PacienteRequest dados) {
        PacienteResponse resposta = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/pacientes/" + resposta.id())).body(resposta);
    }

    @PutMapping("/{id}")
    public PacienteResponse atualizar(@PathVariable UUID id, @Valid @RequestBody PacienteRequest dados) {
        return service.atualizar(id, dados);
    }
}
