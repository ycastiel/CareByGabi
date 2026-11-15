package com.CareBy.Gabi.agendamentos;

import com.CareBy.Gabi.compartilhado.ExcecaoNegocio;
import com.CareBy.Gabi.pacientes.Paciente;
import com.CareBy.Gabi.pacientes.PacienteRepository;
import com.CareBy.Gabi.pacientes.SituacaoPaciente;
import com.CareBy.Gabi.servicos.Servico;
import com.CareBy.Gabi.servicos.ServicoRepository;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {
    private final AgendamentoRepository repository;
    private final PacienteRepository pacientes;
    private final ServicoRepository servicos;

    public AgendamentoService(AgendamentoRepository repository, PacienteRepository pacientes, ServicoRepository servicos) {
        this.repository = repository;
        this.pacientes = pacientes;
        this.servicos = servicos;
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listar() {
        return repository.findAllByOrderByInicioEmDesc().stream().map(AgendamentoResponse::de).toList();
    }

    @Transactional
    public AgendamentoResponse criar(AgendamentoRequest dados) {
        Agendamento a = Agendamento.novo();
        preencher(a, dados);
        return AgendamentoResponse.de(repository.saveAndFlush(a));
    }

    @Transactional
    public AgendamentoResponse atualizar(UUID id, AgendamentoRequest dados) {
        Agendamento a = repository.findById(id).orElseThrow(() ->
            new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Agendamento não encontrado."));
        preencher(a, dados);
        repository.flush();
        return AgendamentoResponse.de(a);
    }

    private void preencher(Agendamento a, AgendamentoRequest d) {
        if (!d.fimEm().isAfter(d.inicioEm())) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "O término deve ser posterior ao início.");
        }
        long duracao = Duration.between(d.inicioEm(), d.fimEm()).toMinutes();
        if (duracao < 15 || duracao > 480) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "A duração deve ter entre 15 e 480 minutos.");
        }
        if (d.situacao() == SituacaoAgendamento.REALIZADO) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST,
                "O atendimento realizado será registrado no módulo de atendimentos, em etapa posterior.");
        }
        Paciente paciente = pacientes.findById(d.pacienteId()).orElseThrow(() ->
            new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado."));
        Servico servico = servicos.findById(d.servicoId()).orElseThrow(() ->
            new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Serviço não encontrado."));
        boolean estaAtivo = d.situacao() == SituacaoAgendamento.AGENDADO || d.situacao() == SituacaoAgendamento.CONFIRMADO;
        if (estaAtivo && paciente.getSituacao() != SituacaoPaciente.ATIVO) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Não é possível agendar para paciente inativo.");
        }
        if (estaAtivo && !servico.getAtivo()) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Não é possível agendar serviço inativo.");
        }
        if (estaAtivo) {
            List<SituacaoAgendamento> ocupados = List.of(
                SituacaoAgendamento.AGENDADO, SituacaoAgendamento.CONFIRMADO, SituacaoAgendamento.REALIZADO);
            boolean conflito = a.getId() == null ? repository.existeConflitoNovo(d.inicioEm(), d.fimEm(), ocupados)
                : repository.existeConflitoEdicao(a.getId(), d.inicioEm(), d.fimEm(), ocupados);
            if (conflito) throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Horário indisponível: já existe uma consulta nesse período.");
        }
        a.setPaciente(paciente);
        a.setServico(servico);
        a.setInicioEm(d.inicioEm());
        a.setFimEm(d.fimEm());
        a.setModalidade(d.modalidade());
        a.setSituacao(d.situacao());
        a.setLinkReuniao(d.linkReuniao() == null || d.linkReuniao().isBlank() ? null : d.linkReuniao().trim());
        a.setObservacaoAdministrativa(d.observacaoAdministrativa() == null || d.observacaoAdministrativa().isBlank()
            ? null : d.observacaoAdministrativa().trim());
    }
}
