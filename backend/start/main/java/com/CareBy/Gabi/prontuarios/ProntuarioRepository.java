package com.CareBy.Gabi.prontuarios;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProntuarioRepository extends JpaRepository<Prontuario, UUID> {
    List<Prontuario> findAllByOrderByAbertoEmDesc();
    Optional<Prontuario> findByPaciente_Id(UUID pacienteId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Prontuario p where p.id = :id")
    Optional<Prontuario> buscarBloqueando(@Param("id") UUID id);
}
