package com.CareBy.Gabi.agendamentos;

import java.time.Instant;
import java.util.List;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID> {
    List<Agendamento> findAllByOrderByInicioEmDesc();

    @Query("""
        select (count(a) > 0) from Agendamento a
        where a.situacao in :situacoes
          and a.inicioEm < :fim and a.fimEm > :inicio
        """)
    boolean existeConflitoNovo(@Param("inicio") Instant inicio, @Param("fim") Instant fim,
        @Param("situacoes") Collection<SituacaoAgendamento> situacoes);

    @Query("""
        select (count(a) > 0) from Agendamento a
        where a.id <> :id
          and a.situacao in :situacoes
          and a.inicioEm < :fim and a.fimEm > :inicio
        """)
    boolean existeConflitoEdicao(@Param("id") UUID id, @Param("inicio") Instant inicio, @Param("fim") Instant fim,
        @Param("situacoes") Collection<SituacaoAgendamento> situacoes);
}
