package com.CareBy.Gabi.pacientes;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {
    private final PacienteRepository repository;

    public PacienteService(PacienteRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<PacienteResponse> listar() {
        return repository.findAllByOrderByNomeAsc().stream().map(PacienteResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponse buscar(UUID id) { return PacienteResponse.de(obter(id)); }

    @Transactional
    public PacienteResponse criar(PacienteRequest dados) {
        Paciente paciente = Paciente.novo();
        preencher(paciente, dados);
        return PacienteResponse.de(repository.saveAndFlush(paciente));
    }

    @Transactional
    public PacienteResponse atualizar(UUID id, PacienteRequest dados) {
        Paciente paciente = obter(id);
        preencher(paciente, dados);
        repository.flush();
        return PacienteResponse.de(paciente);
    }

    public Paciente obter(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Paciente não encontrado."));
    }

    private void preencher(Paciente p, PacienteRequest d) {
        p.setNome(d.nome().trim());
        p.setDataNascimento(d.dataNascimento());
        p.setTelefone(limparVazio(d.telefone()));
        p.setEmail(limparVazio(d.email()));
        p.setConvenio(limparVazio(d.convenio()));
        p.setObservacoesAdministrativas(limparVazio(d.observacoesAdministrativas()));
        p.setVinculo(d.vinculo());
        p.setSituacao(d.situacao());

        String cpf = limparVazio(d.cpf());
        if (cpf != null) {
            cpf = cpf.replaceAll("[^0-9]", "");
            if (!cpfValido(cpf)) {
                throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "CPF inválido.");
            }
            boolean duplicado = p.getId() == null ? repository.existsByCpf(cpf)
                : repository.existsByCpfAndIdNot(cpf, p.getId());
            if (duplicado) throw new ExcecaoNegocio(HttpStatus.CONFLICT, "CPF já cadastrado.");
        }
        p.setCpf(cpf);

        if (d.responsavelPrincipalId() == null) {
            p.setResponsavelPrincipal(null);
        } else {
            if (Objects.equals(p.getId(), d.responsavelPrincipalId())) {
                throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Paciente não pode ser seu próprio responsável.");
            }
            Paciente responsavel = obter(d.responsavelPrincipalId());
            Paciente cursor = responsavel;
            // Impede ciclos diretos e indiretos na cadeia de responsáveis.
            while (cursor != null) {
                if (Objects.equals(cursor.getId(), p.getId())) {
                    throw new ExcecaoNegocio(HttpStatus.BAD_REQUEST, "Relacionamento de responsáveis criaria um ciclo.");
                }
                cursor = cursor.getResponsavelPrincipal();
            }
            p.setResponsavelPrincipal(responsavel);
        }
    }

    private static String limparVazio(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static boolean cpfValido(String cpf) {
        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) return false;
        for (int digito = 9; digito <= 10; digito++) {
            int soma = 0;
            for (int i = 0; i < digito; i++) soma += Character.digit(cpf.charAt(i), 10) * (digito + 1 - i);
            int resto = (soma * 10) % 11;
            if (resto == 10) resto = 0;
            if (resto != Character.digit(cpf.charAt(digito), 10)) return false;
        }
        return true;
    }
}
