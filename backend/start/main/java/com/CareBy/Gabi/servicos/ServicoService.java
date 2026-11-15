package com.CareBy.Gabi.servicos;

import com.CareBy.Gabi.helpers.ExcecaoNegocio;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicoService {
    private final ServicoRepository repository;
    public ServicoService(ServicoRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listar() {
        return repository.findAllByOrderByNomeAsc().stream().map(ServicoResponse::de).toList();
    }

    @Transactional
    public ServicoResponse criar(ServicoRequest dados) {
        Servico s = Servico.novo();
        preencher(s, dados);
        return ServicoResponse.de(repository.saveAndFlush(s));
    }

    @Transactional
    public ServicoResponse atualizar(UUID id, ServicoRequest dados) {
        Servico s = obter(id);
        preencher(s, dados);
        repository.flush();
        return ServicoResponse.de(s);
    }

    public Servico obter(UUID id) {
        return repository.findById(id).orElseThrow(() ->
            new ExcecaoNegocio(HttpStatus.NOT_FOUND, "Serviço não encontrado."));
    }

    private void preencher(Servico s, ServicoRequest d) {
        s.setNome(d.nome().trim());
        s.setCategoria(d.categoria());
        s.setDescricao(d.descricao() == null || d.descricao().isBlank() ? null : d.descricao().trim());
        s.setDuracaoMinutos(d.duracaoMinutos());
        s.setValorPadrao(d.valorPadrao());
        s.setAtivo(d.ativo());
    }
}
