package com.CareBy.Gabi.servicos;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {
    List<Servico> findAllByOrderByNomeAsc();
}
