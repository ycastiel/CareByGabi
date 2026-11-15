package com.CareBy.Gabi.prontuarios;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "registros_clinicos")
public class RegistroClinico {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prontuario_id", nullable = false)
    private Prontuario prontuario;

    @Column(name = "autor_id", nullable = false, updatable = false)
    private UUID autorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 24)
    private CategoriaRegistro categoria;

    @Column(name = "conteudo", columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", nullable = false, length = 14)
    private SituacaoRegistro situacao = SituacaoRegistro.RASCUNHO;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Column(name = "finalizado_em")
    private Instant finalizadoEm;

    protected RegistroClinico() {}

    public static RegistroClinico rascunho(Prontuario prontuario, UUID autorId,
                                           CategoriaRegistro categoria, String conteudo) {
        RegistroClinico r = new RegistroClinico();
        r.prontuario = prontuario;
        r.autorId = autorId;
        r.categoria = categoria;
        r.conteudo = conteudo;
        return r;
    }

    @PrePersist void antesDeInserir() { criadoEm = Instant.now(); atualizadoEm = criadoEm; }
    @PreUpdate void antesDeAtualizar() { atualizadoEm = Instant.now(); }

    public void revisar(CategoriaRegistro categoria, String conteudo) {
        this.categoria = categoria;
        this.conteudo = conteudo;
    }
    public void finalizar() {
        this.situacao = SituacaoRegistro.FINALIZADO;
        this.finalizadoEm = Instant.now();
    }

    public UUID getId() { return id; }
    public Prontuario getProntuario() { return prontuario; }
    public UUID getAutorId() { return autorId; }
    public CategoriaRegistro getCategoria() { return categoria; }
    public String getConteudo() { return conteudo; }
    public SituacaoRegistro getSituacao() { return situacao; }
    public Instant getCriadoEm() { return criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public Instant getFinalizadoEm() { return finalizadoEm; }
}
