package com.CareBy.Gabi.prontuarios;

import com.CareBy.Gabi.pacientes.Paciente;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "prontuarios")
public class Prontuario {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false, unique = true)
    private Paciente paciente;

    @Column(name = "aberto_em", nullable = false)
    private LocalDate abertoEm;

    @Column(name = "encerrado_em")
    private LocalDate encerradoEm;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", nullable = false, length = 12)
    private SituacaoProntuario situacao = SituacaoProntuario.ABERTO;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Prontuario() {}

    public static Prontuario abrir(Paciente paciente) {
        Prontuario p = new Prontuario();
        p.paciente = paciente;
        p.abertoEm = LocalDate.now();
        return p;
    }

    @PrePersist void antesDeInserir() { criadoEm = Instant.now(); }

    public UUID getId() { return id; }
    public Paciente getPaciente() { return paciente; }
    public LocalDate getAbertoEm() { return abertoEm; }
    public LocalDate getEncerradoEm() { return encerradoEm; }
    public SituacaoProntuario getSituacao() { return situacao; }
    public void encerrar() { situacao = SituacaoProntuario.ENCERRADO; encerradoEm = LocalDate.now(); }
}
