# CareByGabi — Caderno de aprendizagem

**Arquivo:** `docs/Questionario-pt1.MD`  
**Parte:** 01 — Fundação técnica e primeiro MVP  
**Estado:** Preparado para aplicação após a primeira demonstração do MVP  
**Versão:** 0.2 — atualização para MVP com persistência e agenda

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
- [ ] **Pacientes:** consulta, cadastro, edição e situação ativa/inativa; API Java, JPA, PostgreSQL e validação.
- [ ] **Agenda:** cadastro, confirmação, remarcação, cancelamento, detecção de conflitos e persistência PostgreSQL.
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


## 7. Extensão do questionário — MVP 1 a 3 (10 pontos)

**Aplicação:** após a demonstração funcional das três entregas. A pontuação total passa a ser de **26 pontos** (16 iniciais + 10 novos).

**Q17.** O que é um **DTO**? Por que os controllers devolvem `PacienteResponse` em vez de uma entidade `Paciente` diretamente? (1 ponto)

Resposta:

**Q18.** Descreva o fluxo completo de `POST /api/pacientes`, desde o formulário React até o registro no PostgreSQL. Em que etapa ocorre a validação Bean Validation? (1 ponto)

Resposta:

**Q19.** Qual a diferença entre HTTP **400**, **401**, **404** e **409**? Dê um exemplo real de cada um em nosso MVP. (1 ponto)

Resposta:

**Q20.** Por que usamos `@Transactional` no Service? O que pode dar errado se atualizarmos vários registros sem uma transação? (1 ponto)

Resposta:

**Q21.** Por que o navegador converte `datetime-local` para ISO com fuso antes de enviar a API? Como isso se relaciona a `Instant` e `TIMESTAMPTZ`? (1 ponto)

Resposta:

**Q22.** Imagine que duas requisições tentem reservar exatamente o mesmo horário simultaneamente. Por que um `existsConflito(...)` no Java **não basta**? Como a migration V2 resolve o problema? (1 ponto)

Resposta:

**Q23.** Como o Vite encaminha chamadas `/api` para o Spring Boot em desenvolvimento? Por que isso não é o mesmo que expor o PostgreSQL ao frontend? (1 ponto)

Resposta:

**Q24.** Compare **inativar um paciente** e **excluí-lo fisicamente**. Que problemas a exclusão pode causar em um sistema clínico com agendamentos e prontuários? (1 ponto)

Resposta:

**Q25.** Por que usamos credenciais de demonstração apenas no perfil `demo`, e por que **HTTP Basic em localhost** não autoriza colocar o sistema em produção? (1 ponto)

Resposta:

**Q26.** O sistema apresenta no dashboard a soma dos preços de referência dos futuros agendamentos. Por que esse valor não é uma receita efetivamente recebida? (1 ponto)

Resposta:

### Registro complementar (entregas 1–3)

| Campo | Preenchimento |
|---|---|
| Data da demonstração | — |
| Resultados do build Java / React | — |
| Persistência confirmada após reinício | — |
| Teste de conflito HTTP 409 | — |
| Pontuação Parte 1 (Q01–Q16) | — / 16 |
| Pontuação extensão (Q17–Q26) | — / 10 |
| **Total** | **— / 26** |
| Revisão obrigatória de segurança | — |
| Próximos conceitos a revisar | — |

As questões devem ser aplicadas preferencialmente uma por vez, depois do MVP observado em funcionamento. **Não preencher o gabarito antecipadamente.**

## 8. Extensão — Frutiger Aero e design system (5 pontos)

**Aplicação:** depois de validar visualmente o patch e o formulário persistente em ambiente local. **Total acumulado: 31 pontos.**

**Q27.** Qual a vantagem de centralizar cores, sombras, raios e tempos de transição em `frontend/css/global.css`, usando variáveis `--aero-*`? (1 ponto)

Resposta:

**Q28.** Por que o import de `frutiger-aero.css` ocorre **depois** de `App.css` em `Main.tsx`? O que aconteceria se invertermos essa ordem? (1 ponto)

Resposta:

**Q29.** Qual a função do componente `CampoIcone`? Por que ele recebe um `<input>` como `children`, em vez de gerenciar o estado e o `onChange` do cadastro? (1 ponto)

Resposta:

**Q30.** Qual a diferença entre `:hover`, `:focus-visible` e `:focus-within`? Dê um exemplo real da interface. (1 ponto)

Resposta:

**Q31.** Por que elementos decorativos usam `aria-hidden="true"` e por que desativamos animações quando `prefers-reduced-motion` está ativo? (1 ponto)

Resposta:

### Registro de revisão visual

| Campo | Valor |
|---|---|
| Login e dashboard em desktop | — |
| Agenda e formulários em tela pequena | — |
| Build Vite/TypeScript | — |
| Persistência preservada após editar | — |
| Questões respondidas | — / 5 |
| Total acumulado (Q01–Q31) | — / 31 |

*Este capítulo registra uma implementação visual; não equivale à confirmação de um MVP pronto para dados clínicos reais.*


## 9. Extensão — Azul Aero, assets e catálogo (3 pontos)

**Aplicação:** após verificar o carregamento do logo e testar o preenchimento sugerido para uma sessão clínica. **Total acumulado: 34 pontos.**

**Q32.** Por que a imagem da Gabriela passou a ser importada pelo componente `LogoGabriela` em vez de acessar diretamente `/logo-gabriela.jpg`? O que o Vite faz com esse asset? (1 ponto)

Resposta:

**Q33.** Diferencie **preencher um formulário usando o botão “Usar exemplo”** de **persistir um serviço via `aoSalvar`**. Em qual das duas ações o PostgreSQL recebe uma gravação? (1 ponto)

Resposta:

**Q34.** Qual a vantagem dos tokens `--aero-celeste-*` e `--aero-borda-celeste` em vez de repetir hexadecimais em diversos seletores? Por que mantemos a cor primária verde? (1 ponto)

Resposta:

### Registro desta revisão

| Verificação | Resultado |
|---|---|
| Logo carregou na barra lateral e no login | — |
| Tokens azuis visíveis sem prejudicar contraste | — |
| Exemplo de sessão preenche campos sem cadastrar automaticamente | — |
| Botão Salvar serviço persiste somente quando acionado | — |
| Q32–Q34 | — / 3 |
| **Total acumulado Q01–Q34** | **— / 34** |


---

## Entrega 4 — Prontuários demonstrativos e Visual 2.2

> Responda **após demonstrar** o novo módulo. Não coloque dados reais, senhas nem textos clínicos no caderno. Critério de revisão permanece o do questionário original: menos de 50% exige retomada, 50–69% requer reforço e 70% ou mais permite avançar, com revisão obrigatória de erros importantes de segurança.

**Q35.** Explique a diferença entre `pacientes`, `prontuarios` e `registros_clinicos`. Por que não armazenamos tudo diretamente em `pacientes`?

**Q36.** O banco já possui `prontuarios` e `registros_clinicos` na V1. Por que não criamos uma nova migration para o módulo nesta entrega?

**Q37.** O relacionamento `prontuarios.paciente_id` é `UNIQUE`. Qual regra de negócio essa restrição representa?

**Q38.** Qual a diferença entre salvar `RASCUNHO` e finalizar como `FINALIZADO`? Qual resposta HTTP esperamos ao tentar editar um registro já finalizado?

**Q39.** Por que o backend exige que não existam rascunhos antes de encerrar um prontuário? Onde esta regra deve ser aplicada?

**Q40.** O que significa `@Profile("demo")` nos endpoints clínicos? Isso, sozinho, permite utilizar prontuários com pacientes reais? Explique.

**Q41.** Por que a V1 exige `autor_id` e por que o `AutorDemo` é um recurso estritamente temporário?

**Q42.** Qual a finalidade do `@Lock(PESSIMISTIC_WRITE)` nas operações de atualização e finalização?

**Q43.** Diferencie a proteção contra edição pela API de uma garantia de imutabilidade diretamente no PostgreSQL.

**Q44.** Na Visual 2.2, quais elementos devem receber cores de superfície e quais situações justificam um indicador de estado mais chamativo?

**Q45.** Como os novos tokens `--aero-superficie-ceu` e `--aero-painel-azul` ajudam a manter consistência e permitir ajustes globais?

**Q46.** Cite três verificações manuais de acessibilidade antes de apresentar o módulo (por exemplo: teclado, contraste, dispositivos móveis).

### Registro da avaliação da Entrega 4

- Data: ___/___/____
- Acertos completos: ___
- Respostas parciais: ___
- Pontuação final: ___ / 12
- Conceitos que precisam de reforço: ____________________
- Data da retomada, se necessária: ___/___/____


---

## Entrega 5 — Avaliações (12 pontos)

**Q47.** Por que `avaliacoes` é uma tabela diferente de `prontuarios` e `registros_clinicos`?

**Q48.** O que significa guardar `dados_criterios` como um *snapshot* JSONB?

**Q49.** Que riscos haveria em transformar uma escala demonstrativa de 1 a 5 em diagnóstico automático?

**Q50.** Qual o papel de `@Valid`, `@NotBlank`, `@Min` e `@Max` nos records de entrada?

**Q51.** Por que `AvaliacaoRequest` e `AvaliacaoResponse` não são a mesma classe?

**Q52.** Por que o Spring Boot 4 usa `tools.jackson.databind.json.JsonMapper` nesta implementação?

**Q53.** Em que pontos usamos `JdbcTemplate` em vez de `JpaRepository` e por quê? Quais são as vantagens e os custos da escolha?

**Q54.** O que significa `CAST(? AS jsonb)` e por que os parâmetros são passados separadamente do SQL?

**Q55.** Qual a diferença entre uma avaliação `RASCUNHO` e uma `REVISADA` na API?

**Q56.** Por que fazemos `SELECT ... FOR UPDATE OF a` ao revisar/editar?

**Q57.** Como verificamos se uma avaliação pertence ao paciente certo sem confiar apenas no React?

**Q58.** Qual é o risco do `AutorDemo` fora de um ambiente fictício?

Respostas: registrar abaixo de cada pergunta depois do teste; não colocar respostas, dados pessoais ou textos clínicos reais no repositório.

**Pontuação Entrega 5:** ___ / 12. **Acumulada:** ___ / 58.


---

## Entrega 6 — Documentos e anexos (12 pontos)

**Q59.** Qual é a diferença entre `documentos.conteudo` e `arquivos.chave_armazenamento`?

**Q60.** Por que um upload utiliza `multipart/form-data` em vez de JSON?

**Q61.** Por que não definimos manualmente `Content-Type: application/json` quando o corpo é `FormData`?

**Q62.** Por que a pasta de anexos deve ficar fora de `frontend/public`, `application/frontend/artefatos` e do repositório?

**Q63.** Por que salvar um arquivo como `<UUID>.bin` é preferível a usar seu nome original como caminho no disco?

**Q64.** O que é verificação de *magic bytes*? Ela elimina a necessidade de antivírus? Explique.

**Q65.** Por que o download usa `Content-Disposition: attachment` e `X-Content-Type-Options: nosniff`?

**Q66.** Que problema de integridade surge se `documento_id` apontar para um documento de outro paciente?

**Q67.** Por que marcar um documento como `EMITIDO` não equivale a assinar ou validar um documento psicológico?

**Q68.** O que acontece se o arquivo for gravado em disco, mas a transação do PostgreSQL falhar ao confirmar?

**Q69.** Por que um `BACKUP` da base PostgreSQL não recupera sozinho os arquivos privados?

**Q70.** Cite quatro barreiras adicionais necessárias antes de aceitar arquivos ou registros clínicos verdadeiros.

**Pontuação Entrega 6:** ___ / 12. **Acumulada:** ___ / 70.

**Critério permanente:** menos de 50% requer revisão orientada, de 50% a 69% reforço focalizado e de 70% para cima avanço. Erros importantes de privacidade/segurança exigem revisão, mesmo com nota alta. Questões podem ser aplicadas individualmente após demonstrar os módulos.
