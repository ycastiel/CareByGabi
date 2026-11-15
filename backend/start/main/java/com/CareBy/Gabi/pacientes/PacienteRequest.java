package com.CareBy.Gabi.pacientes;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record PacienteRequest(
    @NotBlank @Size(max = 180) String nome,
    @PastOrPresent LocalDate dataNascimento,
    @Size(max = 30) String telefone,
    @Email @Size(max = 320) String email,
    @Size(max = 20) String cpf,
    @NotNull VinculoPaciente vinculo,
    @NotNull SituacaoPaciente situacao,
    @Size(max = 120) String convenio,
    UUID responsavelPrincipalId,
    String observacoesAdministrativas
) {}
