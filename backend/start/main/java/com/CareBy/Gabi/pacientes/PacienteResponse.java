package com.CareBy.Gabi.pacientes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PacienteResponse(
        UUID id, String nome, LocalDate dataNascimento, String telefone,
        String email, String cpf, VinculoPaciente vinculo, SituacaoPaciente situacao,
        String convenio, UUID responsavelPrincipalId, String responsavelPrincipalNome,
        String observacoesAdministrativas, Instant criadoEm, Instant atualizadoEm) {
    public static PacienteResponse de(Paciente p) {
        Paciente responsavel = p.getResponsavelPrincipal();
        return new PacienteResponse(
                p.getId(), p.getNome(), p.getDataNascimento(), p.getTelefone(),
                p.getEmail(), p.getCpf(), p.getVinculo(), p.getSituacao(),
                p.getConvenio(), responsavel != null ? responsavel.getId() : null,
                responsavel != null ? responsavel.getNome() : null,
                p.getObservacoesAdministrativas(), p.getCriadoEm(), p.getAtualizadoEm());
    }
}
