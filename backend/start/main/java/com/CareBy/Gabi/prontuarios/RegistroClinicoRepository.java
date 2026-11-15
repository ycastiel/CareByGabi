package com.CareBy.Gabi.prontuarios;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistroClinicoRepository extends JpaRepository<RegistroClinico, UUID> {
    List<RegistroClinico> findByProntuario_IdOrderByCriadoEmDesc(UUID prontuarioId);
    boolean existsByProntuario_IdAndSituacao(UUID prontuarioId, SituacaoRegistro situacao);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from RegistroClinico r where r.id = :id and r.prontuario.id = :prontuarioId")
    Optional<RegistroClinico> buscarBloqueando(@Param("id") UUID id,
                                                 @Param("prontuarioId") UUID prontuarioId);
}
