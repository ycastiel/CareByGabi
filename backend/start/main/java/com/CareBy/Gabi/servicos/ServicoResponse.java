package com.CareBy.Gabi.servicos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ServicoResponse(
    UUID id, String nome, CategoriaServico categoria, String descricao,
    Integer duracaoMinutos, BigDecimal valorPadrao, boolean ativo, Instant criadoEm
) {
    public static ServicoResponse de(Servico s) {
        return new ServicoResponse(s.getId(), s.getNome(), s.getCategoria(), s.getDescricao(),
            s.getDuracaoMinutos(), s.getValorPadrao(), s.getAtivo(), s.getCriadoEm());
    }
}
