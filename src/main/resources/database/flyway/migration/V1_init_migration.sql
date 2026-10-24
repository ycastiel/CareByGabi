-- Plataforma Clínica Gabriela — Migração inicial (rascunho para revisão)
-- PostgreSQL 15+ | Flyway V1 | Dados fictícios em desenvolvimento.
-- Versões de migrations já aplicadas NÃO devem ser editadas. Ajustes posteriores: V2, V3...
-- Tipos e status são controlados por CHECKs nesta primeira versão;
-- em Java, mapear para enums. Evitar dados clínicos em logs.

-- 1. Autenticação: a aplicação terá inicialmente uma única profissional.
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(180) NOT NULL,
    email VARCHAR(320) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_usuarios_email_normalizado ON usuarios (LOWER(email));

-- 2. Identidade comum a pacientes clínicos e avaliados externos.
CREATE TABLE pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(180) NOT NULL,
    data_nascimento DATE,
    telefone VARCHAR(30),
    email VARCHAR(320),
    cpf VARCHAR(11),
    vinculo VARCHAR(24) NOT NULL DEFAULT 'PACIENTE'
        CHECK (vinculo IN ('PACIENTE', 'AVALIADO_EXTERNO', 'AMBOS', 'RESPONSAVEL')),
    situacao VARCHAR(12) NOT NULL DEFAULT 'ATIVO'
        CHECK (situacao IN ('ATIVO', 'INATIVO')),
    convenio VARCHAR(120),
    responsavel_principal_id UUID REFERENCES pessoas(id) ON DELETE RESTRICT,
    observacoes_administrativas TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_pessoa_responsavel_diferente CHECK (responsavel_principal_id IS NULL OR responsavel_principal_id <> id)
);
CREATE INDEX idx_pessoas_nome ON pessoas (nome);

-- 3. Catálogo de serviços e valores de referência.
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(160) NOT NULL,
    categoria VARCHAR(20) NOT NULL DEFAULT 'CLINICO'
        CHECK (categoria IN ('CLINICO', 'ORGANIZACIONAL', 'OUTRO')),
    descricao TEXT,
    duracao_minutos INTEGER NOT NULL DEFAULT 50 CHECK (duracao_minutos > 0),
    valor_padrao NUMERIC(12,2) CHECK (valor_padrao IS NULL OR valor_padrao >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Somente pessoas com acompanhamento clínico terão prontuário.
CREATE TABLE prontuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL UNIQUE REFERENCES pessoas(id) ON DELETE RESTRICT,
    aberto_em DATE NOT NULL DEFAULT CURRENT_DATE,
    encerrado_em DATE,
    situacao VARCHAR(12) NOT NULL DEFAULT 'ABERTO'
        CHECK (situacao IN ('ABERTO', 'ENCERRADO')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_prontuario_datas CHECK (encerrado_em IS NULL OR encerrado_em >= aberto_em)
);

-- 5. Agenda: uma marcação não significa que o atendimento aconteceu.
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    inicio_em TIMESTAMPTZ NOT NULL,
    fim_em TIMESTAMPTZ NOT NULL,
    modalidade VARCHAR(12) NOT NULL CHECK (modalidade IN ('PRESENCIAL', 'ONLINE')),
    situacao VARCHAR(20) NOT NULL DEFAULT 'AGENDADO'
        CHECK (situacao IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO', 'NAO_COMPARECEU')),
    link_reuniao TEXT,
    observacao_administrativa TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_agendamento_periodo CHECK (fim_em > inicio_em)
);
CREATE INDEX idx_agendamentos_inicio ON agendamentos (inicio_em);
CREATE INDEX idx_agendamentos_pessoa_inicio ON agendamentos (pessoa_id, inicio_em);

-- 6. Evento efetivamente realizado (pode existir sem agendamento prévio).
CREATE TABLE atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    agendamento_id UUID UNIQUE REFERENCES agendamentos(id) ON DELETE RESTRICT,
    servico_id UUID REFERENCES servicos(id) ON DELETE RESTRICT,
    iniciado_em TIMESTAMPTZ NOT NULL,
    encerrado_em TIMESTAMPTZ,
    modalidade VARCHAR(12) NOT NULL CHECK (modalidade IN ('PRESENCIAL', 'ONLINE')),
    situacao VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO'
        CHECK (situacao IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_atendimento_periodo CHECK (encerrado_em IS NULL OR encerrado_em >= iniciado_em)
);
CREATE INDEX idx_atendimentos_pessoa_data ON atendimentos (pessoa_id, iniciado_em DESC);

-- 7. Registros clínicos e retificações append-only de versões finalizadas.
CREATE TABLE registros_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prontuario_id UUID NOT NULL REFERENCES prontuarios(id) ON DELETE RESTRICT,
    atendimento_id UUID REFERENCES atendimentos(id) ON DELETE RESTRICT,
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    retifica_registro_id UUID REFERENCES registros_clinicos(id) ON DELETE RESTRICT,
    categoria VARCHAR(24) NOT NULL DEFAULT 'EVOLUCAO'
        CHECK (categoria IN ('ANAMNESE', 'EVOLUCAO', 'NOTA_RESTRITA', 'OUTRO')),
    conteudo TEXT NOT NULL,
    situacao VARCHAR(14) NOT NULL DEFAULT 'RASCUNHO'
        CHECK (situacao IN ('RASCUNHO', 'FINALIZADO')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalizado_em TIMESTAMPTZ
);
CREATE INDEX idx_registros_prontuario_data ON registros_clinicos (prontuario_id, criado_em DESC);

-- 8. Avaliações clínicas OU organizacionais; critérios capturados como snapshot JSONB.
-- Ex.: dados_criterios = [{"modulo":"Comunicação","criterio":"Clareza", "nivel":3,"evidencia":"..."}]
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    atendimento_id UUID REFERENCES atendimentos(id) ON DELETE RESTRICT,
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'ENTREVISTA_SELECAO', 'ATENDIMENTO_CLINICO', 'AVALIACAO_PSICOLOGICA',
        'ACOMPANHAMENTO_ORGANIZACIONAL', 'OUTRA')),
    titulo VARCHAR(200) NOT NULL,
    contexto TEXT,
    objetivo TEXT,
    modelo_codigo VARCHAR(80),
    modelo_versao INTEGER NOT NULL DEFAULT 1 CHECK (modelo_versao > 0),
    dados_criterios JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(dados_criterios) = 'array'),
    sintese_rascunho TEXT,
    situacao VARCHAR(14) NOT NULL DEFAULT 'RASCUNHO'
        CHECK (situacao IN ('RASCUNHO', 'REVISADA')),
    realizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_avaliacoes_pessoa_data ON avaliacoes (pessoa_id, realizado_em DESC);

-- 9. Documentos: tipo + modelo no próprio registro; conteúdo preservado como snapshot.
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    atendimento_id UUID REFERENCES atendimentos(id) ON DELETE RESTRICT,
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'DECLARACAO', 'ATESTADO_PSICOLOGICO', 'RELATORIO_PSICOLOGICO',
        'LAUDO_PSICOLOGICO', 'PARECER_PSICOLOGICO', 'ENCAMINHAMENTO',
        'RECIBO', 'TERMO_CONSENTIMENTO', 'OUTRO')),
    modelo VARCHAR(80) NOT NULL DEFAULT 'PADRAO',
    modelo_versao INTEGER NOT NULL DEFAULT 1 CHECK (modelo_versao > 0),
    titulo VARCHAR(220) NOT NULL,
    conteudo TEXT NOT NULL,
    situacao VARCHAR(14) NOT NULL DEFAULT 'RASCUNHO'
        CHECK (situacao IN ('RASCUNHO', 'EMITIDO', 'CANCELADO')),
    emitido_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_documento_emissao CHECK (situacao <> 'EMITIDO' OR emitido_em IS NOT NULL)
);
CREATE INDEX idx_documentos_pessoa_data ON documentos (pessoa_id, criado_em DESC);

-- 10. Referências de anexos, versões exportadas e gravações em storage privado.
-- O áudio NÃO é gravado como BYTEA no banco.
CREATE TABLE arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID REFERENCES pessoas(id) ON DELETE RESTRICT,
    atendimento_id UUID REFERENCES atendimentos(id) ON DELETE RESTRICT,
    documento_id UUID REFERENCES documentos(id) ON DELETE RESTRICT,
    enviado_por_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    finalidade VARCHAR(16) NOT NULL DEFAULT 'ANEXO'
        CHECK (finalidade IN ('ANEXO', 'GRAVACAO', 'DOCUMENTO', 'OUTRO')),
    nome_original VARCHAR(255) NOT NULL,
    mime_type VARCHAR(160) NOT NULL,
    tamanho_bytes BIGINT NOT NULL CHECK (tamanho_bytes >= 0),
    chave_armazenamento TEXT NOT NULL UNIQUE,
    checksum_sha256 VARCHAR(64),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_arquivos_atendimento ON arquivos (atendimento_id);

-- 11. Cobrança preserva o valor contratado, mesmo após mudança no catálogo.
CREATE TABLE cobrancas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    servico_id UUID REFERENCES servicos(id) ON DELETE RESTRICT,
    atendimento_id UUID REFERENCES atendimentos(id) ON DELETE RESTRICT,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
    vencimento_em DATE NOT NULL,
    situacao VARCHAR(12) NOT NULL DEFAULT 'PENDENTE'
        CHECK (situacao IN ('PENDENTE', 'PARCIAL', 'PAGA', 'CANCELADA')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cobrancas_pessoa ON cobrancas (pessoa_id);
CREATE INDEX idx_cobrancas_vencimento ON cobrancas (vencimento_em);

-- 12. Uma cobrança pode receber vários pagamentos parciais.
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cobranca_id UUID NOT NULL REFERENCES cobrancas(id) ON DELETE RESTRICT,
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    metodo VARCHAR(20) NOT NULL
        CHECK (metodo IN ('PIX', 'DINHEIRO', 'CARTAO', 'TRANSFERENCIA', 'OUTRO')),
    recebido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    referencia VARCHAR(160),
    observacao_administrativa TEXT
);
CREATE INDEX idx_pagamentos_cobranca ON pagamentos (cobranca_id);

-- 13. Registro por finalidade; não pressupõe que consentimento seja a base legal universal.
CREATE TABLE consentimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE RESTRICT,
    concedido_por_pessoa_id UUID REFERENCES pessoas(id) ON DELETE RESTRICT,
    registrado_por_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    comprovante_arquivo_id UUID REFERENCES arquivos(id) ON DELETE RESTRICT,
    finalidade VARCHAR(30) NOT NULL CHECK (finalidade IN (
        'GRAVACAO_AUDIO', 'PROCESSAMENTO_IA', 'COMPARTILHAMENTO', 'OUTRA')),
    versao_termo VARCHAR(30) NOT NULL,
    situacao VARCHAR(12) NOT NULL DEFAULT 'CONCEDIDO'
        CHECK (situacao IN ('CONCEDIDO', 'REVOGADO')),
    concedido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revogado_em TIMESTAMPTZ,
    observacao TEXT,
    CONSTRAINT ck_consentimento_revogacao CHECK (
        (situacao = 'REVOGADO' AND revogado_em IS NOT NULL)
        OR (situacao = 'CONCEDIDO' AND revogado_em IS NULL))
);
CREATE INDEX idx_consentimentos_pessoa_finalidade ON consentimentos (pessoa_id, finalidade, concedido_em DESC);

-- 14. Texto e trechos de uma transcrição; resumo fica como rascunho, nunca como evolução automática.
CREATE TABLE transcricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE RESTRICT,
    audio_arquivo_id UUID REFERENCES arquivos(id) ON DELETE RESTRICT,
    texto_integral TEXT,
    segmentos JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(segmentos) = 'array'),
    modelo_utilizado VARCHAR(120),
    resumo_rascunho TEXT,
    situacao VARCHAR(20) NOT NULL DEFAULT 'PROCESSANDO'
        CHECK (situacao IN ('PROCESSANDO', 'RASCUNHO', 'REVISADA', 'FALHOU')),
    revisado_por_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    revisado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transcricoes_atendimento ON transcricoes (atendimento_id);

-- 15. Rastreamento de ações de segurança, SEM conteúdo sensível nos metadados.
CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    acao VARCHAR(80) NOT NULL,
    entidade VARCHAR(100),
    entidade_id UUID,
    sucesso BOOLEAN NOT NULL DEFAULT TRUE,
    metadados JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(metadados) = 'object'),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auditoria_usuario_data ON logs_auditoria (usuario_id, criado_em DESC);
CREATE INDEX idx_auditoria_entidade ON logs_auditoria (entidade, entidade_id);

-- Regras de serviço importantes para implementar no backend:
-- * Validar se agendamento, atendimento, prontuário e avaliação referenciam a mesma pessoa.
-- * Impedir edição destrutiva de registros FINALIZADOS e documentos EMITIDOS;
--   corrigir por novo registro/documento com referência e trilha de auditoria.
-- * Validar conflitos de agenda e somatório de pagamentos no Java (transacionalmente).
-- * Manter arquivos privados, validar permissões e consentimento aplicável antes de gravar.
-- * Atualizar *_em na aplicação (ou mediante triggers específicas futuras).
