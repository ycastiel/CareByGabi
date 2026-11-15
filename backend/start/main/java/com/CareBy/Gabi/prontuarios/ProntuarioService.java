package com.CareBy.Gabi.prontuarios;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import com.CareBy.Gabi.pacientes.Paciente;
import com.CareBy.Gabi.pacientes.PacienteRepository;
import com.CareBy.Gabi.pacientes.VinculoPaciente;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("demo")
public class ProntuarioService {
    private final ProntuarioRepository prontuarios;
    private final RegistroClinicoRepository registros;
    private final PacienteRepository pacientes;
    private final AutorDemo autor;

    public ProntuarioService(ProntuarioRepository prontuarios, RegistroClinicoRepository registros,
                            PacienteRepository pacientes, AutorDemo autor) {
        this.prontuarios = prontuarios;
        this.registros = registros;
        this.pacientes = pacientes;
        this.autor = autor;
    }

    @Transactional(readOnly = true)
    public List<ProntuarioResponse> listar() {
        return prontuarios.findAllByOrderByAbertoEmDesc().stream().map(ProntuarioResponse::de).toList();
    }

    @Transactional
    public ProntuarioResponse abrir(AberturaProntuarioRequest entrada) {
        Paciente p = pacientes.findById(entrada.pacienteId())
            .orElseThrow(() -> new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado."));
        if (p.getVinculo() != VinculoPaciente.PACIENTE && p.getVinculo() != VinculoPaciente.AMBOS) {
            throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST,
                "Somente pacientes em acompanhamento clínico podem ter prontuário nesta etapa.");
        }
        if (prontuarios.findByPaciente_Id(p.getId()).isPresent()) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Este paciente já possui prontuário.");
        }
        return ProntuarioResponse.de(prontuarios.saveAndFlush(Prontuario.abrir(p)));
    }

    @Transactional(readOnly = true)
    public List<RegistroResponse> listarRegistros(UUID prontuarioId) {
        buscar(prontuarioId);
        return registros.findByProntuario_IdOrderByCriadoEmDesc(prontuarioId)
            .stream().map(RegistroResponse::de).toList();
    }

    @Transactional
    public RegistroResponse criarRegistro(UUID prontuarioId, RegistroRequest dados) {
        Prontuario p = buscarBloqueando(prontuarioId);
        exigirAberto(p);
        RegistroClinico r = RegistroClinico.rascunho(p, autor.garantirAutor(),
            dados.categoria(), dados.conteudo().trim());
        return RegistroResponse.de(registros.saveAndFlush(r));
    }

    @Transactional
    public RegistroResponse atualizarRascunho(UUID prontuarioId, UUID registroId, RegistroRequest dados) {
        exigirAberto(buscarBloqueando(prontuarioId));
        RegistroClinico r = obterRegistroBloqueando(prontuarioId, registroId);
        exigirRascunho(r);
        r.revisar(dados.categoria(), dados.conteudo().trim());
        registros.flush();
        return RegistroResponse.de(r);
    }

    @Transactional
    public RegistroResponse finalizar(UUID prontuarioId, UUID registroId) {
        exigirAberto(buscarBloqueando(prontuarioId));
        RegistroClinico r = obterRegistroBloqueando(prontuarioId, registroId);
        exigirRascunho(r);
        r.finalizar();
        registros.flush();
        return RegistroResponse.de(r);
    }

    @Transactional
    public ProntuarioResponse encerrar(UUID prontuarioId) {
        Prontuario p = buscarBloqueando(prontuarioId);
        exigirAberto(p);
        if (registros.existsByProntuario_IdAndSituacao(prontuarioId, SituacaoRegistro.RASCUNHO)) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Finalize os rascunhos antes de encerrar.");
        }
        p.encerrar();
        prontuarios.flush();
        return ProntuarioResponse.de(p);
    }

    private Prontuario buscar(UUID id) {
        return prontuarios.findById(id)
            .orElseThrow(() -> new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Prontuário não encontrado."));
    }
    private Prontuario buscarBloqueando(UUID id) {
        return prontuarios.buscarBloqueando(id)
            .orElseThrow(() -> new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Prontuário não encontrado."));
    }
    private RegistroClinico obterRegistroBloqueando(UUID prontuarioId, UUID registroId) {
        return registros.buscarBloqueando(registroId, prontuarioId)
            .orElseThrow(() -> new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Registro não encontrado neste prontuário."));
    }
    private void exigirAberto(Prontuario p) {
        if (p.getSituacao() != SituacaoProntuario.ABERTO) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Prontuário encerrado; alterações bloqueadas.");
        }
    }
    private void exigirRascunho(RegistroClinico r) {
        if (r.getSituacao() != SituacaoRegistro.RASCUNHO) {
            throw new ExcecaoNegocio(HttpStatus.CONFLICT, "Registro finalizado não pode ser editado.");
        }
    }
}
