-- CareByGabi V2: proteção transacional contra horários sobrepostos.
-- V1 JÁ FOI APLICADA. Não editar a V1 para realizar esta mudança.
-- Enquanto houver uma única profissional, a agenda é global.
-- Períodos [inicio, fim): consultas adjacentes são permitidas.
ALTER TABLE agendamentos
    ADD CONSTRAINT ex_agendamentos_sem_sobreposicao
    EXCLUDE USING gist (
        tstzrange(inicio_em, fim_em, '[)') WITH &&
    ) WHERE (
        situacao IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO')
    );
