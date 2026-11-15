package com.CareBy.Gabi.arquivos;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Profile("demo")
@RequestMapping("/api/arquivos")
public class ArquivoController {
    private final ArquivoService service;
    public ArquivoController(ArquivoService service) { this.service = service; }

    @GetMapping
    public List<ArquivoResponse> listar(@RequestParam UUID pacienteId) { return service.listar(pacienteId); }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArquivoResponse> enviar(@RequestParam UUID pacienteId,
        @RequestParam(required = false) UUID documentoId, @RequestPart("arquivo") MultipartFile arquivo) {
        ArquivoResponse resposta = service.enviar(pacienteId, documentoId, arquivo);
        return ResponseEntity.created(URI.create("/api/arquivos/" + resposta.id())).body(resposta);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> baixar(@PathVariable UUID id) {
        ArquivoArmazenado dado = service.obterArquivo(id);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .contentLength(dado.metadados().tamanhoBytes())
            .cacheControl(CacheControl.noStore())
            .header("X-Content-Type-Options", "nosniff")
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                .filename(dado.metadados().nomeOriginal(), StandardCharsets.UTF_8).build().toString())
            .body(new FileSystemResource(dado.caminho()));
    }
}
