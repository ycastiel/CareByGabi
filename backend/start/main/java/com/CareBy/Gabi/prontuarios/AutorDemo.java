package com.CareBy.Gabi.prontuarios;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Identificador técnico SEM login para ligar registros fictícios ao autor no perfil demo.
 * Não usar em produção ou para prontuários reais.
 */
@Component
@Profile("demo")
public class AutorDemo {
    private static final UUID ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
    private final JdbcTemplate jdbc;

    public AutorDemo(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public UUID garantirAutor() {
        jdbc.update("""
            INSERT INTO usuarios (id, nome, email, senha_hash, ativo)
            VALUES (?, 'Profissional fictício (DEMO)', 'profissional-demo@carebygabi.invalid',
                    'CONTA_TECNICA_DEMO_SEM_LOGIN', FALSE)
            ON CONFLICT (id) DO NOTHING
            """, ID);
        return ID;
    }
}
