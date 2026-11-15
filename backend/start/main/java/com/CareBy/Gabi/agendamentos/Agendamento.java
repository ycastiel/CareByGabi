package com.CareBy.Gabi.agendamentos;

import jakarta.persistence.*;
import java.util.UUID;
import java.time.Instant;
import com.CareBy.Gabi.pacientes.Paciente;
import com.CareBy.Gabi.servicos.Servico;

@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(name = "inicio_em", nullable = false)
    private Instant inicioEm;

    @Column(name = "fim_em", nullable = false)
    private Instant fimEm;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidade", length = 12, nullable = false)
    private ModalidadeAgendamento modalidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "situacao", length = 20, nullable = false)
    private SituacaoAgendamento situacao = SituacaoAgendamento.AGENDADO;

    @Column(name = "link_reuniao", columnDefinition = "TEXT")
    private String linkReuniao;

    @Column(name = "observacao_administrativa", columnDefinition = "TEXT")
    private String observacaoAdministrativa;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Agendamento() {}

    public static Agendamento novo() { return new Agendamento(); }

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

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public Instant getInicioEm() { return inicioEm; }
    public void setInicioEm(Instant inicioEm) { this.inicioEm = inicioEm; }

    public Instant getFimEm() { return fimEm; }
    public void setFimEm(Instant fimEm) { this.fimEm = fimEm; }

    public ModalidadeAgendamento getModalidade() { return modalidade; }
    public void setModalidade(ModalidadeAgendamento modalidade) { this.modalidade = modalidade; }

    public SituacaoAgendamento getSituacao() { return situacao; }
    public void setSituacao(SituacaoAgendamento situacao) { this.situacao = situacao; }

    public String getLinkReuniao() { return linkReuniao; }
    public void setLinkReuniao(String linkReuniao) { this.linkReuniao = linkReuniao; }

    public String getObservacaoAdministrativa() { return observacaoAdministrativa; }
    public void setObservacaoAdministrativa(String observacaoAdministrativa) { this.observacaoAdministrativa = observacaoAdministrativa; }

    public Instant getCriadoEm() { return criadoEm; }

    public Instant getAtualizadoEm() { return atualizadoEm; }
}
