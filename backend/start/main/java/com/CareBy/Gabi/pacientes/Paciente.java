package com.CareBy.Gabi.pacientes;

import jakarta.persistence.*;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", length = 180, nullable = false)
    private String nome;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "telefone", length = 30)
    private String telefone;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "cpf", length = 11)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(name = "vinculo", length = 24, nullable = false)
    private VinculoPaciente vinculo = VinculoPaciente.PACIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", length = 12, nullable = false)
    private SituacaoPaciente situacao = SituacaoPaciente.ATIVO;

    @Column(name = "convenio", length = 120)
    private String convenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_principal_id")
    private Paciente responsavelPrincipal;

    @Column(name = "observacoes_administrativas", columnDefinition = "TEXT")
    private String observacoesAdministrativas;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Paciente() {}

    public static Paciente novo() { return new Paciente(); }

    @PrePersist
    void antesDeInserir() {
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    @PreUpdate
    void antesDeAtualizar() {
        this.atualizadoEm = Instant.now();
    }

    public UUID getId() { return id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public VinculoPaciente getVinculo() { return vinculo; }
    public void setVinculo(VinculoPaciente vinculo) { this.vinculo = vinculo; }

    public SituacaoPaciente getSituacao() { return situacao; }
    public void setSituacao(SituacaoPaciente situacao) { this.situacao = situacao; }

    public String getConvenio() { return convenio; }
    public void setConvenio(String convenio) { this.convenio = convenio; }

    public Paciente getResponsavelPrincipal() { return responsavelPrincipal; }
    public void setResponsavelPrincipal(Paciente responsavelPrincipal) { this.responsavelPrincipal = responsavelPrincipal; }

    public String getObservacoesAdministrativas() { return observacoesAdministrativas; }
    public void setObservacoesAdministrativas(String observacoesAdministrativas) { this.observacoesAdministrativas = observacoesAdministrativas; }

    public Instant getCriadoEm() { return criadoEm; }

    public Instant getAtualizadoEm() { return atualizadoEm; }
}
