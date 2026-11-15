# CareByGabi — Caderno de aprendizagem

**Arquivo:** `docs/Questionario-pt1.MD`  
**Parte:** 01 — Fundação técnica e primeiro MVP  
**Estado:** Preparado para aplicação após a primeira demonstração do MVP  
**Versão:** 0.1

> Este caderno registra conceitos demonstrados na construção do CareByGabi. Não é uma prova de memorização: o objetivo é compreender, explicar e aplicar decisões técnicas. Não responder antes da primeira demonstração do MVP.

## 1. Nosso combinado: construir e aprender

Para cada funcionalidade entregue:

1. **Entrega:** receber somente os arquivos criados ou alterados, com o conteúdo **completo** de cada arquivo e seus caminhos exatos, sem sobrescrever áreas não envolvidas.
2. **Explicação:** entender o que a funcionalidade faz, por que existe, o fluxo entre frontend, API e banco, e os principais pontos de segurança.
3. **Validação:** executar build, testes ou passos manuais observáveis e registrar o resultado real (sem presumir sucesso).
4. **Caderno:** registrar conceitos novos, perguntas, erros comuns e referências aos arquivos correspondentes.
5. **Avaliação:** após uma demonstração funcional, responder ao questionário em etapas, preferencialmente uma pergunta por vez, sem consultar o gabarito.
6. **Revisão:** retomar somente os conceitos que não ficaram claros, usando explicações e pequenos exercícios práticos.

### Critérios de avaliação

- **1 ponto:** resposta correta e justificada.
- **0,5 ponto:** ideia central correta, mas com lacunas ou imprecisões.
- **0 ponto:** resposta ausente, incorreta ou incompatível com a regra estudada.
- **Abaixo de 50%:** pausa para revisão orientada dos fundamentos e nova tentativa.
- **De 50% a 69%:** revisão focalizada dos temas errados e perguntas de recuperação.
- **70% ou mais:** progresso liberado; manter revisão dos temas frágeis.
- **Segurança e privacidade:** erros críticos nessa área exigem revisão independentemente da nota total.

O objetivo não é penalizar um erro isolado: é tornar visíveis os conhecimentos que precisam de reforço. As questões podem ser atualizadas quando uma funcionalidade mudar.

## 2. Escopo da primeira demonstração

**Referência visual:** protótipo HTML fornecido para o CareByGabi, com identidade visual verde-sálvia, navegação lateral, painel inicial e áreas como pacientes, agenda, prontuários, avaliações, financeiro, serviços, documentos e confirmações.

**Sequência sugerida de entregas:**

- [ ] **MVP visual:** estrutura React com layout, navegação e painel inicial próximos do protótipo, usando somente dados fictícios.
- [ ] **Pacientes:** consulta e cadastro básicos; API Java, JPA, PostgreSQL e validação.
- [ ] **Agenda:** visualização e agendamentos demonstrativos.
- [ ] **Prontuários e demais módulos:** construir por etapas, respeitando regras clínicas e acesso.
- [ ] **Segurança antes de dados reais:** autenticação, autorização, proteção de dados, políticas de retenção, tratamento de erros e auditoria.

**Importante:** uma demonstração visual não equivale a uma aplicação clínica pronta para produção. Não usar dados pessoais, prontuários ou gravações reais durante a fase de protótipo.

## 3. Questionário — Parte 1

**Aplicação:** depois que o primeiro MVP for demonstrado.  
**Pontuação máxima inicial:** 16 pontos.  
**Como responder:** explicar com as próprias palavras; quando solicitado, escrever uma pequena declaração ou trecho de código.

### Módulo A — Java e JPA (6 pontos)

**Q01.** Qual é a diferença entre um atributo Java de tipo `boolean` e um atributo de tipo `Boolean`? Em qual situação cada um seria adequado?

Resposta:

**Q02.** O que acontece quando um `Boolean` com valor `null` é usado diretamente em `if (variavel)`? Como podemos fazer uma comparação segura com `true`?

Resposta:

**Q03.** Para uma coluna PostgreSQL `nome VARCHAR(180) NOT NULL`, escreva o atributo Java e a anotação `@Column` correspondente.

Resposta:

**Q04.** Por que `LocalDate` combina com `data_nascimento DATE`, enquanto `Instant` é apropriado para um registro de criação do tipo `TIMESTAMPTZ`?

Resposta:

**Q05.** Por que preferimos `@Enumerated(EnumType.STRING)` para os estados `ATIVO` e `INATIVO`, em vez de `ORDINAL`?

Resposta:

**Q06.** Dois pacientes menores de idade podem ter a mesma responsável. Que tipo de relacionamento JPA representa o campo `responsavelPrincipal` e qual a função de `@JoinColumn`?

Resposta:

### Módulo B — Banco, migrations e integridade (4 pontos)

**Q07.** Qual é a diferença entre o papel do Flyway e o do Hibernate/JPA no CareByGabi?

Resposta:

**Q08.** Por que não devemos editar uma migration V1 que já consta como aplicada em `flyway_schema_history`? O que fazer quando precisamos alterar uma tabela?

Resposta:

**Q09.** Qual a diferença entre `DEFAULT 'PACIENTE'` no PostgreSQL e inicializar o atributo Java com `VinculoPaciente.PACIENTE`?

Resposta:

**Q10.** Por que um telefone repetido não deve necessariamente ser bloqueado por `UNIQUE`, enquanto um CPF informado pode exigir uma política de unicidade?

Resposta:

### Módulo C — Monorepo e frontend (3 pontos)

**Q11.** Explique a responsabilidade de cada área: `application/`, `frontend/` e `backend/` no Método Raiz.

Resposta:

**Q12.** Qual é a diferença entre `npm run build` (Vite/TypeScript) e `mvn clean package` (Maven)? Onde ficam os artefatos gerados?

Resposta:

**Q13.** Por que mantivemos um `tsconfig.json` mínimo na raiz, mesmo com as configurações principais centralizadas em `application/config/`?

Resposta:

### Módulo D — Aplicação e segurança (3 pontos)

**Q14.** Uma tela React de cadastro recebe o nome de um paciente. Quais camadas participam do fluxo até salvar no PostgreSQL? Descreva a sequência.

Resposta:

**Q15.** Por que dados de teste fictícios são obrigatórios enquanto a autenticação, autorização e proteção de dados clínicos não estiverem prontas?

Resposta:

**Q16.** Qual é a diferença entre um agendamento marcado e um atendimento efetivamente realizado? Por que o banco possui tabelas separadas?

Resposta:

## 4. Registro da primeira avaliação

| Campo | Preenchimento |
|---|---|
| Data | — |
| MVP demonstrado | — |
| Pontos obtidos / 16 | — |
| Percentual | — |
| Conceitos bem assimilados | — |
| Conceitos a revisar | — |
| Exercício de recuperação | — |
| Resultado da segunda tentativa | — |

## 5. Histórico incremental de aprendizagem

| Data | Funcionalidade entregue | Arquivos alterados | Novos conceitos | Validação | Questões adicionadas |
|---|---|---|---|---|---|
| — | Fundação do projeto | Maven, Vite, npm workspaces, Flyway | Monorepo; compilação; entidades; relacionamentos | Builds e V1 aplicados em ambiente local | Q01–Q16 |

## 6. Próximos capítulos (a preencher durante o desenvolvimento)

- **Parte 2 — Pacientes:** DTOs, Bean Validation, Repository, Service, Controller, erros HTTP, CRUD e testes.
- **Parte 3 — Agenda:** datas, fusos, conflitos, transações, filtros e UI.
- **Parte 4 — Prontuários:** controle de acesso, integridade, auditabilidade e proteção de dados sensíveis.
- **Parte 5 — Avaliações e documentos:** modelos, versões, geração de arquivos e revisão profissional.

A numeração e os assuntos poderão ser ajustados à implementação real. Nunca registrar senhas, tokens ou dados clínicos de pacientes neste arquivo.
