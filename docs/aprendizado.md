# Diário de aprendizado — Corrida App

Uma entrada por sessão com o mentor (`claude --agent mentor`).
O `/fechar` gera a entrada; cole aqui embaixo, **a mais recente no topo**.

Formato:

```
## AAAA-MM-DD — tema
O que refatoramos/decidimos:
Conceito que aprendi (em uma frase):
Nome de mercado:
Débitos que ficaram:
Onde parei / próximo passo:
```

---


## 2026-10-18 — tipagem de verificarAdmin, teto do DECIMAL(5,2) e contrato de resposta {message}/{data}

O que refatoramos/decidimos:
Três débitos da fila, em ordem. (1) usuarioModel.ts: verificarAdmin usava RowDataPacket puro (index
signature [coluna: string]: any), então resultado[0]?.admin tipava como any e não dava erro de build se a
coluna fosse renomeada numa migration futura - criada interface Admin extends RowDataPacket { admin: number },
passada como generic em pool.query<Admin[]>, mantendo o ?? 0 (fail-closed) que já tinha sido decisão
consciente numa sessão anterior (11/10), mesmo sabendo que hoje o único chamador (autorizacaoAdmin, via
if(!verificar)) trataria undefined e 0 como equivalentes - contrato explícito > comportamento que só funciona
por coincidência de falsy. (2) Teto do DECIMAL(5,2) em corrida.kms_rodados: confirmado que o MySQL (sql_mode
com STRICT_TRANS_TABLES, engine InnoDB) rejeita com erro em vez de truncar silenciosamente valores fora de
precisão - elimina o risco de corrupção de dado. Decisão de negócio: manter o teto (999,99 km é folgado pra
uma "corrida" no domínio atual, mesmo em cenário de registro acumulado), só adicionando validação zod
.max(999.99) com mensagem clara, em vez de deixar o erro cru do MySQL estourar como 500 pro cliente - decisão
documentada pra não precisar ser revisitada à toa. (3) Contrato de resposta inconsistente entre os 13
endpoints de controller: convenção adotada - {message} pra sucesso sem retorno útil, {data} pra leitura
(lista ou item), {message, data} só quando o frontend de fato consome o dado extra. Mudança tocou todo
backend/controllers e os pages do frontend que leem via apiFetch. No processo, achamos uma assimetria real:
postMoto devolvia data: {id: insertId} mas o frontend (Motos.tsx) nunca capturava esse retorno, só
recarregava a lista inteira via buscarMotos() - dado devolvido especulativamente, sem consumidor, removido.
Limpeza complementar: resultado descartado sem uso em postPeca/postUsuario (variável atribuída e nunca lida).

Ponto crítico da sessão, não é refactor: essa mudança de contrato (a mais arquiteturalmente relevante do dia)
foi gerada por uma IA externa a pedido do Cauã, cobrindo os 13 endpoints de uma vez, antes de eu revisar. Isso
vai contra o objetivo que ele declarou no início ("entender as decisões e o porquê delas"). Na revisão, ele
não conseguiu reconstituir de cabeça o antes/depois de um endpoint específico sem abrir o arquivo - sinal de
que a revisão tinha sido superficial. Testou manualmente clicando em cada fluxo no navegador antes do commit,
o que cobre comportamento, mas não substitui o aprendizado de ter escrito a decisão linha por linha.

Conceito que aprendi (em uma frase):
Tipo honesto (interface explícita) > any escondido atrás de index signature, porque o segundo não erra no
build quando o schema muda - ele só quebra em produção, silenciosamente.

Nome de mercado:
Tipo que mente (RowDataPacket com index signature [coluna: string]: any), fail-closed explícito vs
comportamento que só funciona por coincidência de falsy, sql_mode STRICT_TRANS_TABLES (precisão de DECIMAL
rejeitada vs truncada silenciosamente), leaky abstraction (erro de banco vazando como 500), dado especulativo
sem consumidor (variação do YAGNI aplicada a contrato de API em vez de feature), envelope de resposta /
response envelope pattern, dead/unused variable.

Débitos que ficaram:
#4 (storage.ts sem CREATE TABLE IF NOT EXISTS pra tabela migrations), #5 (confirmar se proxy-addr 2.0.8 ainda
é vulnerável / fechar npm audit do frontend) e #6 (tabelas do Corrida App em defaultdb vs database dedicado
corrida-app) continuam na fila, não tocados hoje. ADR da decisão de contrato de resposta ({message}/{data})
ainda não escrito - sugerido, não feito, por falta de tempo na sessão. Confirmar se tsconfig do backend tem
noUnusedLocals ligado (o build não acusou os resultado sem uso em postPeca/postUsuario antes da limpeza
manual - se a flag existisse e estivesse ativa, teria pego sozinho). Reflexão em aberto, não resolvida: até
que ponto delegar a escrita de uma decisão de arquitetura pra uma IA externa é aceitável nesse projeto de
aprendizado - vale retomar explicitamente numa sessão futura, não só como nota de rodapé.

Onde parei / próximo passo:
Seguir a fila na ordem: #4 (storage.ts / Umzug bootstrap), #5 (proxy-addr e npm audit), #6 (defaultdb vs
corrida-app). Escrever o ADR do contrato de resposta enquanto o contexto ainda está fresco. Revisitar com o
Cauã o uso de IA externa pra gerar código de decisões arquiteturais antes da próxima mudança grande.

## 2026-10-15 — ADR-002 escrito (RBAC + migration tooling)

O que refatoramos/decidimos:
Escrevemos o ADR-002, pauta mais atrasada do projeto (as decisões de RBAC e Umzug já estavam implementadas
desde 08/10 e 11/10, só sem registro formal). Documentamos as duas decisões juntas, porque nasceram da mesma
sessão e são causalmente ligadas: RBAC precisou da coluna `admin`, que precisou de um jeito versionado de
aplicar `ALTER TABLE` nos dois bancos reais (local e Aiven). Conferimos no código atual que as duas decisões
continuam de pé como documentadas (checagem fresca de admin no banco via `verificarAdmin`, resposta 403,
migration via Umzug rodada manualmente) antes de redigir o texto. `docs/adr/002-rbac-migration-tooling.md`.

Conceito que aprendi (em uma frase):
Um ADR não precisa ser escrito no instante da decisão — registrar depois, revisitando o código real pra
confirmar que a decisão ainda é a que está implementada, também vale, e evita que o contexto se perca.

Nome de mercado:
ADR escrito a posteriori (vs no momento da decisão), auditoria de decisão documentada contra código vivo.

Débitos que ficaram (levantamento, não resolvidos agora):
`verificarAdmin` (`usuarioModel.ts:31-37`) ainda retorna `resultado[0]?.admin` como `any` (RowDataPacket sem
generic de coluna). `storage.ts` ainda não tem `CREATE TABLE IF NOT EXISTS` pra tabela de controle
`migrations` — bootstrap continua manual em banco novo. Migration da coluna `admin` rodada só local; decisão
consciente de esperar um deploy maior pra rodar no Aiven, ainda não confirmada se já rodou. Tabelas do Corrida
App continuam em `defaultdb` no Aiven, não no database dedicado `corrida-app` (vazio) — desorganização antiga,
não bug, nunca resolvida. Contrato de resposta entre endpoints continua inconsistente (decisão de design de
API, não faxina mecânica). `proxy-addr` (crítico, IP spoofing via trust proxy) continua sem confirmação se a
versão instalada está fora da faixa vulnerável; audit do frontend nunca foi revisado por completo. Soft delete
+ upsert em `moto_peca` (14/10) e decisão 200 vs 201 em `postMotoPeca`: ver débitos da sessão abaixo
(2026-10-15 — fechando pendência de commits), ainda abertos.

Onde parei / próximo passo:
Confirmar via `git log`/Aiven se a migration do `admin` já rodou em produção. Rodar `npm audit` de novo no
backend e no frontend pra fechar o débito do `proxy-addr`. Decidir se o soft delete + upsert de `moto_peca`
vira ADR-003 ou extensão do ADR-001 (seguir o débito já registrado na sessão abaixo).


## 2026-10-15 — fechando pendência de commits (soft delete em moto_peca)

O que refatoramos/decidimos:
Retomamos o débito da sessão de 14/10: migration+schema de moto_peca.ativo já tinham sido commitados antes
dessa sessão. Faltava separar o resto do git status (motoPecaModel.ts, corridaModel.ts, motoPecaController.ts,
motoRoutes.ts, MotoPecas.tsx, Motos.tsx, design-system.md) em commits coerentes. Cauã propôs inicialmente
juntar tudo num "ciclo completo" pra não quebrar o app; questionamos a diferença entre "quebra o build" (critério
objetivo, inegociável) e "fica sem sentido sozinho" (sensação subjetiva, não é motivo pra juntar commit). A partir
disso ele percebeu sozinho que model builda isolado e que controller+rota é a camada que consome o model, logo
são dois commits em sequência, não um só. Segunda decisão: corridaModel.ts (que só lê moto_peca via SELECT com
filtro ativo=TRUE pro snapshot de corrida) e motoPecaModel.ts (que escreve - upsert, listagem, desativar) viviam
em pastas/features diferentes, mas Cauã decidiu agrupá-los no mesmo commit porque mudam pela mesma razão: a
invariante nova (ativo=TRUE em todo WHERE que lê moto_peca). Commits finais: 1) motoPecaModel.ts + corridaModel.ts
juntos; 2) motoPecaController.ts + motoRoutes.ts juntos. MotoPecas.tsx/Motos.tsx/design-system.md ficaram de fora
de propósito - Cauã confirmou que são puramente visuais (não lógica nova) e preferiu não commitar um estado de
design pela metade, já que esse trabalho ainda está em andamento na branch Design.

Conceito que aprendi (em uma frase):
Agrupar commits pela "razão de mudar" (reason to change) é o mesmo critério do Single Responsibility Principle,
só que aplicado à granularidade de commit em vez de classe/função - importa mais a decisão que motivou a mudança
do que a pasta ou feature onde o arquivo mora.

Nome de mercado:
Cohesion by reason to change, Single Responsibility Principle aplicado a commit, build limpo em cada commit como
critério objetivo de "sistema funcionando" vs "faz sentido sozinho" como critério subjetivo que não deve decidir
granularidade.

Débitos que ficaram:
Commit de MotoPecas.tsx/Motos.tsx/design-system.md ainda pendente, aguardando o trabalho de design na branch
Design terminar. Decisão 200 vs 201 em postMotoPeca (quando criarMotoPeca cai no branch de reativação via upsert
em vez de criar linha nova) ainda não resolvida. ADR da decisão de soft delete + upsert em moto_peca ainda não
escrito. Débitos antigos continuam na fila: ADR-002 (RBAC + migration tooling), confirmação de proxy-addr/npm
audit do frontend (sessão de 13/10).

Onde parei / próximo passo:
Terminar o trabalho de design do frontend (branch Design) e só então commitar MotoPecas.tsx/Motos.tsx/
design-system.md juntos. Decidir 200 vs 201 no upsert de postMotoPeca. Escrever o ADR da decisão de soft delete
+ upsert em moto_peca, estendendo ou não o ADR-001. Voltar aos débitos antigos (ADR-002, npm audit) numa sessão
futura.

## 2026-10-14 — soft delete em moto_peca + upsert (ON DUPLICATE KEY UPDATE)

O que refatoramos/decidimos:
Partimos de uma rota de deletar moto_peca que o Cauã tinha rascunhado com dois bugs reais: WHERE
usuario_id = ? numa tabela que não tem essa coluna (moto_peca não tem usuario_id direto, posse é só
via JOIN com moto) e um parâmetro moto_id recebido e nunca usado na query. Antes de corrigir o código,
voltamos pra decisão de arquitetura: o DELETE físico já era bloqueado pela FK corrida_peca.moto_peca_id
(ON DELETE RESTRICT, documentado no ADR-001) sempre que a peça tinha histórico de corrida - comportamento
esperado, não bug. Decidimos soft delete via coluna moto_peca.ativo (BOOLEAN DEFAULT TRUE), com o filtro
AND ativo = TRUE replicado em todo WHERE que lê moto_peca pra decisão de negócio: listarMotoPecas,
editarMotoPecas (edição direta de peça inativa agora dá 404) e a query de criarCorrida que busca peças
pra montar o snapshot. Identificamos que soft delete colide com o UNIQUE(moto_id, peca_id): reativar uma
peça removida via INSERT simples bateria em ER_DUP_ENTRY, então criarMotoPeca virou upsert (INSERT ...
ON DUPLICATE KEY UPDATE custo=VALUES(custo), intervalo_km=VALUES(intervalo_km), ativo=TRUE) numa única
instrução atômica, em vez de duas queries (catch do erro + update separado), evitando uma race condition
real entre dois requests concorrentes tentando reativar a mesma peça. Decidimos manter o verbo HTTP DELETE
na rota mesmo com UPDATE por dentro (o verbo descreve intenção do cliente, não implementação interna) e
200 (não 201) na resposta, porque nenhum recurso novo é criado. Na revisão do diff, achamos e o Cauã
corrigiu sozinho: (1) desativarMotoPecas recebia moto_id mas não usava no WHERE, permitindo desativar uma
peça de outra moto do mesmo usuário via URL inconsistente - corrigido adicionando moto.id = ? na condição;
(2) no meio da correção, introduziu um mismatch real entre 3 valores no array de params e só 2 placeholders
na query - também achado e corrigido sozinho depois de uma pergunta direta. Testado manualmente no Insomnia
(decisão consciente de não montar infra de teste de integração pra isso agora - custo vs benefício, projeto
nunca testou model com banco real). schema.sql foi atualizado com a coluna ativo, fechando o loop de schema
drift que já tinha mordido o projeto antes. Decisão explícita: trabalho de design/frontend (classes de botão
em Motos.tsx/MotoPecas.tsx, docs/design-system.md) que apareceu misturado no mesmo working directory vai
pra commits separados, não entra junto com essa feature.

Conceito que aprendi (em uma frase):
Soft delete não é só troca DELETE->UPDATE numa função isolada - é uma invariante que precisa ser repetida em
todo WHERE que lê a tabela (listagem, edição, criação de corrida), e a UNIQUE constraint que protegia contra
duplicata passa a empurrar pra um upsert, porque uma linha "removida" ainda ocupa o lugar da chave única.

Nome de mercado:
soft delete, upsert / INSERT ... ON DUPLICATE KEY UPDATE, atomicidade evitando race condition (TOCTOU) sem
precisar de duas queries separadas, ownership check via JOIN vs coluna direta inexistente, HTTP verb como
contrato de intenção do cliente (não implementação interna) - DELETE continua DELETE mesmo com UPDATE por
dentro, 200 vs 201 vs 204, schema drift, mismatch de placeholder/params count no mysql2 (bind parameters).

Débitos que ficaram:
Decisão pendente: postMotoPeca sempre devolve 201, mesmo quando criarMotoPeca cai no branch de reativação
via ON DUPLICATE KEY UPDATE (upsert) em vez de criar linha nova - avaliar se vale diferenciar 200/201 via
resultado.affectedRows ou se é precisão que ninguém usa (YAGNI), ainda não decidido. Confirmar se a coluna
ativo foi aplicada via arquivo de migration rastreado (Umzug) ou via ALTER manual de novo - checar git
status. Commits ainda não separados/feitos: pelo menos migration+schema, models, controller+rota, e
design-system aparte. ADR não escrito pra essa decisão (soft delete + upsert em moto_peca) - candidato a
estender o ADR-001 ou abrir um novo. Débitos antigos ainda na fila: ADR-002 (RBAC + migration tooling),
confirmação de proxy-addr/npm audit do frontend (sessão de 13/10).

Onde parei / próximo passo:
Rodar git status pra confirmar migration rastreada. Separar e fazer os commits (migration/schema primeiro,
depois models, depois controller+rota, design-system num commit isolado). Decidir 200 vs 201 no upsert.
Escrever o ADR dessa decisão (soft delete + upsert) antes de esquecer o contexto fresco. Voltar aos débitos
antigos (ADR-002, npm audit) numa sessão futura.


## 2026-10-13 — timing attack no login + triagem de npm audit

O que refatoramos/decidimos:
Corrigimos um bug de segurança real em postLogin (usuarioController.ts): quando o email não existia,
a função retornava 401 sem rodar bcrypt.compare, enquanto o caso de senha errada rodava o bcrypt completo
antes do 401 - diferença de tempo de resposta mensurável, permitindo enumerar emails cadastrados por
timing. Corrigido comparando sempre contra um hash bcrypt fixo (dummy hash) quando o usuário não existe,
garantindo custo computacional igual nos dois caminhos. No meio do processo, achamos e evitamos um bug novo
que a própria correção quase introduziu: se o hash fake fosse de uma senha "chutável" (ex. "123456"), um
atacante que mandasse essa senha pra um email inexistente faria confere=true e o código tentaria assinar
um JWT com usuario.id undefined (usuario era um objeto fake sem id). Resolvido com um guard explícito
(usuario === undefined) na mesma condição do 401, em vez de depender da ausência acidental do campo id -
e esse guard explícito também resolveu de brinde um erro de tipo do TypeScript (narrowing de
RowDataPacket | undefined pra RowDataPacket depois do throw). Verificamos empiricamente no Insomnia que
os tempos de resposta ficaram equivalentes (110-150ms) nos dois casos depois do fix. Separamos em 2 commits
(timing fix; scripts de migrate que já estavam pendentes de outra sessão), com o terceiro assunto (import
morto de autenticar em server.ts) ainda não commitado. Segunda parte da sessão: rodamos npm audit no
backend e investigamos as vulnerabilidades reportadas em vez de reagir ao rótulo de severidade isolado -
braces (high, via chokidar/nodemon) e sprintf-js (moderate, via argparse/js-yaml/istanbul/jest) são
devDependencies, não alcançáveis por input de atacante (processam nomes de arquivo do próprio projeto, não
dado de request) - baixa prioridade real. proxy-addr (critical, IP spoofing via trust proxy) é dependência
direta de produção do express, mas a investigação não fechou: versão instalada (2.0.8) parece estar fora
da faixa vulnerável reportada (1.1.0-2.0.7) e ainda não confirmamos se o backend usa req.ip ou configura
trust proxy em algum lugar - fica pendente.

Conceito que aprendi (em uma frase):
Um guard de segurança deve existir por intenção explícita no código (testar a condição real), não por
acidente de forma de um dado (tipo um campo que "por coincidência" não existe) - o segundo é frágil contra
qualquer refactor futuro que não saiba que carregava essa responsabilidade escondida.

Nome de mercado:
Timing attack / user enumeration via timing side-channel, constant-time comparison (aplicado ao fluxo
inteiro, não só à comparação de bytes), dummy hash comparison (técnica usada pelo Django), fail-safe
explícito vs guard acidental, control-flow narrowing do TypeScript, supply chain security, npm audit,
severidade de CVE isolada vs exploitability/reachability (quem controla o input que chega até o código
vulnerável), dependencies vs devDependencies como fronteira de superfície de ataque em produção.

Débitos que ficaram:
Commit do import morto (autenticar em server.ts) ainda não feito. proxy-addr: não confirmamos se a versão
2.0.8 já está fora da faixa vulnerável (rodar npm audit de novo pra confirmar) nem se o backend usa req.ip/
trust proxy - sem isso, não dá pra fechar se é risco real ou não. braces/sprintf-js documentados como
baixa prioridade (dev-only, input não controlado por atacante) mas não atualizados. Lista completa do
npm audit do frontend (proxy-addr/handlebars apareceram cedo na conversa, depois a origem ficou confusa -
nunca confirmamos se eram do front ou do back) não foi revisada por completo.


Onde parei / próximo passo:
Rodar npm audit de novo no backend pra confirmar se proxy-addr ainda aparece com a versão atual. Procurar
por req.ip e app.set('trust proxy', ...) no código antes de decidir se essa vulnerabilidade é risco real.
Rodar npm audit no frontend do zero (a lista anterior ficou sem origem confirmada). Commitar a remoção do
import morto em server.ts. ADR-002 (RBAC + migration tooling) continua sendo a pauta de arquitetura mais
atrasada do projeto.

## 2026-10-12 — primeiro ADR (snapshot histórico) + migrations rodadas em produção (Aiven)

O que refatoramos/decidimos:
Sessão dividida em duas partes. Primeiro, finalmente escrevemos o ADR-001 (snapshot histórico),
pauta mais atrasada do projeto (adiada havia 4+ sessões) — Cauã reconstruiu o contexto sozinho lendo
schema.sql e corridaModel.ts (sem lembrar de cor), identificou as 3 opções reais (agregado só no total,
JOIN sem congelar nada, snapshot granular por peça com FK) e escreveu contexto/decisão/consequências,
inclusive achando sozinho uma consequência que não tinha percebido: a FK corrida_peca.moto_peca_id usa
ON DELETE RESTRICT por padrão, então o banco já impede hard delete de peça usada — reforço estrutural da
regra de "sem hard delete", não só filosófico. Segunda parte: finalmente rodamos no Aiven as 3 migrations
que só existiam local (add_admin_usuario, add_km_litro_not_null, corrida.usuario_id_not_null). No caminho,
resolvemos o problema real de "como apontar prod sem contaminar o .env local" — Cauã propôs a solução
(arquivo .env.production separado) e eu expliquei o porquê técnico de por que isso evita o problema de
ordem de import (dotenv.config() não sobrescreve env var já setada, e dotenv-cli injeta as vars antes do
Node nem iniciar, resolvendo o problema sem precisar reordenar import). Rodamos checklist de operação em
produção antes do gatilho: confirmamos backup habilitado no Aiven, rodamos SELECT COUNT(*) pra garantir
zero linhas violando os NOT NULL antes do ALTER (deu 0 nos dois), e descobrimos que a tabela de controle
`migrations` não se autocria (sem CREATE TABLE IF NOT EXISTS em storage.ts) — precisou ser criada manualmente
no Aiven antes do primeiro `npm run migrate:prod`, e essa tabela foi documentada em schema.sql (gap que
não existia antes). No meio do processo, susto real: Cauã percebeu que os dois projetos pessoais (Corrida
App e app de inglês) compartilham o mesmo serviço Aiven — investigamos se compartilhavam o mesmo database
também (isso seria grave, zero isolamento entre apps não relacionados) e confirmamos que não: databases
diferentes (app_ingles, corrida-app vazio, defaultdb). Descoberta colateral: as tabelas do Corrida App
foram todas criadas dentro do `defaultdb` em vez de um banco dedicado `corrida-app` que existe vazio —
desorganização, não bug, fica como débito.

Conceito que aprendi (em uma frase):
Em MySQL o boundary de isolamento é o database (schema), não o servidor — dois projetos não relacionados
podem compartilhar o mesmo serviço com segurança total desde que usem DB_NAME diferentes, porque tabela é
namespaced por database, não por instância.

Nome de mercado:
ADR (Architecture Decision Record), snapshot pattern, ON DELETE RESTRICT (FK protegendo contra hard
delete estruturalmente, não só por convenção de código), 12-factor app / config via environment,
import hoisting e ordem de execução de módulo (por que dotenv.config() não sobrescreve env var já
setada), schema drift (tabela migrations existindo real mas ausente do schema.sql documentado),
database como boundary de multi-tenancy de infraestrutura (diferente do multi-tenant por usuario_id
que já existia na aplicação).


Débitos que ficaram:
Tabela corrida-app existe vazia no Aiven, dados reais do Corrida App estão em defaultdb — mover/renomear
é operação de dado real futura, com risco, não feita hoje. storage.ts não tem CREATE TABLE IF NOT EXISTS
pra tabela migrations (bootstrap manual, não documentado em código, só na memória de quem já fez uma vez).
Teto do DECIMAL(5,2) (999,99) ainda não verificado contra uso real. Exemplo concreto de inconsistência de
resposta entre endpoints ainda não levantado. Segundo ADR (RBAC + migration tooling Umzug) ainda não
escrito, continua sendo a próxima pauta de arquitetura mais rica em trade-offs já discutida.

Onde parei / próximo passo:
Escrever ADR-002 (RBAC + migration tooling). Decidir se vale mover as tabelas de defaultdb pra corrida-app
(schema.sql já documenta a tabela migrations, mas o nome do database real ainda está desalinhado com a
intenção). Verificar teto do DECIMAL(5,2) contra receita/kms_rodados reais. Considerar adicionar
CREATE TABLE IF NOT EXISTS migrations em storage.ts, pra não depender de bootstrap manual numa terceira
instalação futura (ex.: novo ambiente de staging).


## 2026-10-11 — RBAC: migration real + middleware de autorização admin, 3 bugs reais corrigidos

O que refatoramos/decidimos:
Resolvemos o débito pendente da sessão anterior. Primeiro, decisão de limpeza: apagamos migration001.ts/
testeMigrations (seguro porque nunca tinha rodado em banco nenhum - sem registro no histórico do Umzug pra
limpar) e adotamos convenção de nome timestamp+descrição pra migrations futuras. Escrevemos e rodamos local
a migration real (ALTER TABLE usuario ADD COLUMN admin BOOLEAN DEFAULT FALSE) e atualizamos schema.sql junto,
pra não reabrir o mesmo schema drift que já tinha mordido o projeto antes. Terminamos autorizacaoAdmin em
autenticar.ts, decidindo conscientemente reaproveitar req.usuario_id já plantado por autenticar (DRY) em vez
de extrair/validar o token de novo - trade-off aceito: menos duplicação, mais acoplamento implícito de ordem
de middleware na rota (autenticar sempre antes). No caminho, caçamos e corrigimos 3 bugs reais, não refactor:
(1) await faltando na chamada de verificarAdmin(usuario_id) - função async sem await sempre retorna uma
Promise, que é truthy, então o guard nunca barrava, não importava o resultado real; (2) mesmo com await,
verificarAdmin devolvia o RowDataPacket inteiro (ex. {admin: 0}), que é objeto e portanto truthy mesmo pra
admin=0 - corrigido pra verificarAdmin retornar resultado[0]?.admin ?? 0, fail-closed se o usuário não existir
mais; (3) regressão de status: o bloqueio de autorizacaoAdmin tinha saído como 401, repetindo o erro que a
sessão de 08/10 já tinha corrigido - 401 dispara logout automático em frontend/src/api.ts, então bloquear
permissão com 401 desloga usuário comum sem motivo. Corrigido pra 403. Por último, em corridaModel.ts,
invertemos a ordem de criarCorrida: validação de "moto sem peças" agora roda antes do INSERT da corrida, não
depois - resultado final no banco era o mesmo (rollback desfazia o INSERT), mas evita uma escrita desnecessária
no caminho de erro e deixa a leitura do código na ordem natural (valida -> grava). Decisão consciente de não
tocar agora no loop de INSERT um-a-um de corrida_peca (N+1 dentro da transação) - YAGNI, poucas peças por moto
hoje, vira prioridade se esse número crescer.

Conceito que aprendi (em uma frase):
Separar autenticação de autorização em dois middlewares é certo (responsabilidades diferentes), mas isso cria
uma dependência de ORDEM na declaração da rota - o TypeScript só sabe que req.usuario_id pode ser undefined
(tipo honesto em express.d.ts), não sabe se autenticar de fato rodou antes; a garantia de ordem é convenção,
não tipo.

Nome de mercado:
missing await / unawaited Promise sempre truthy, guard clause / fail fast, authentication vs authorization
(401 vs 403 - 401 é "não sei quem você é", 403 é "sei quem você é e não deixo"), middleware chaining e
acoplamento implícito por ordem, fail-closed default em checagem de permissão, tipos honestos com optional (?)
vs tipos que mentem, weak typing do RowDataPacket (.admin como any), rule of three / YAGNI aplicado a
otimização de query (N+1 insert).

Débitos que ficaram:
Migration do admin rodada só local - decisão consciente de esperar o próximo deploy maior (que vai incluir
mudanças grandes de frontend) pra rodar em produção/Aiven junto, aceitando o risco de um deploy mais difícil
de debugar se algo quebrar. ADR do RBAC + migration tooling (Umzug vs Flyway vs TypeORM) continua sem ser
escrito, é a pauta mais atrasada do projeto. Loop de INSERT de corrida_peca (N+1) registrado como débito, não
resolvido. Formato de resposta dos endpoints identificado como inconsistente, mas sem exemplo concreto
levantado nem contrato novo desenhado - não é só faxina mecânica, é decisão de contrato de API, não dá pra
delegar pra ferramenta sem decidir o shape primeiro. Teto do DECIMAL(5,2) (999,99) ainda não verificado contra
uso real (receita/kms_rodados). verificarAdmin tipa .admin como any (RowDataPacket sem generic de coluna).

Onde parei / próximo passo:

Verificar se receita ou kms_rodados já bateram perto de 999,99 na prática (decide se o teto do DECIMAL é bug
latente ou não-problema). Levantar exemplo concreto de inconsistência de resposta entre dois endpoints antes
de desenhar o contrato padronizado. Escrever o primeiro ADR (RBAC + migration tooling, mais fresco na cabeça
que o de snapshot histórico). Separado disso: reforma de layout do frontend foi levantada, mas fica como
exercício de arquitetura de componentes (não design visual puro, que está fora do escopo deste mentor) pra
sessão futura.


## 2026-10-08 — autorização por role (admin) + decisão e implementação de migrations com Umzug

O que refatoramos/decidimos:
Partimos de um buraco real de autorização: POST /pecas (catálogo global, sem usuario_id) só exigia
autenticar, então qualquer usuário logado podia inserir peça pra todo mundo. Decidimos separar autenticar
(identidade) de um novo middleware de autorização (papel/role), com checagem fresca no banco a cada request
(não embutida no JWT, por causa de revogação - demover um admin só vale de verdade se não depender do usuário
deslogar). Resposta de falha decidida como 403 (não 401), depois de rastrear que o 401 em frontend/src/api.ts
desloga qualquer usuário automaticamente - usar 401 aqui deslogaria um usuário comum só por tentar uma rota
que não é dele, confundindo "sessão expirada" com "sem permissão".
Pra existir a coluna admin, abriu a decisão de arquitetura do dia: como versionar e aplicar ALTER de forma
rastreável nos 2 bancos reais (MySQL local instalado direto, e Aiven produção - sem staging, e schema.sql é
documento, não banco). Rodamos o roteiro completo de decisão: Flyway descartado por trazer JVM pro stack
(zero Java hoje no projeto); TypeORM descartado por ser arquitetura prematura (exigiria reescrever todos os
models pra resolver um problema que não precisa de ORM nenhum - decisão separada da adoção futura de ORM pro
redesign mobile). Fechamos em Umzug (Node-nativo, agnóstico de camada de dado, reaproveita o tsx que o
projeto já usa no npm run dev). Decidiu-se rodar a migration manualmente (controle de deploy, não "clean
## 2026-10-08 — autorização por role (admin) + decisão e implementação de migrations com Umzug

O que refatoramos/decidimos:
Partimos de um buraco real de autorização: POST /pecas (catálogo global, sem usuario_id) só exigia
autenticar, então qualquer usuário logado podia inserir peça pra todo mundo. Decidimos separar autenticar
(identidade) de um novo middleware de autorização (papel/role), com checagem fresca no banco a cada request
(não embutida no JWT, por causa de revogação - demover um admin só vale de verdade se não depender do usuário
deslogar). Resposta de falha decidida como 403 (não 401), depois de rastrear que o 401 em frontend/src/api.ts
desloga qualquer usuário automaticamente - usar 401 aqui deslogaria um usuário comum só por tentar uma rota
que não é dele, confundindo "sessão expirada" com "sem permissão".
Pra existir a coluna admin, abriu a decisão de arquitetura do dia: como versionar e aplicar ALTER de forma
rastreável nos 2 bancos reais (MySQL local instalado direto, e Aiven produção - sem staging, e schema.sql é
documento, não banco). Rodamos o roteiro completo de decisão: Flyway descartado por trazer JVM pro stack
(zero Java hoje no projeto); TypeORM descartado por ser arquitetura prematura (exigiria reescrever todos os
models pra resolver um problema que não precisa de ORM nenhum - decisão separada da adoção futura de ORM pro
redesign mobile). Fechamos em Umzug (Node-nativo, agnóstico de camada de dado, reaproveita o tsx que o
projeto já usa no npm run dev). Decidiu-se rodar a migration manualmente (controle de deploy, não "clean
code") - e pegamos no processo uma contradição real: a primeira tentativa de script usava nodemon --exec,
que fica vigiando arquivo e re-executando sozinho, o comportamento automático que a decisão de "manual"
queria evitar.
Construímos a infra do zero: tabela de histórico (migrations, coluna nome UNIQUE NOT NULL - puxando a mesma
lição do UNIQUE/duplicateError de sessões passadas), a storage customizada (UmzugStorage<Pool>, tipada via
mysql2/promise), e uma migration de teste validando a engrenagem ponta a ponta (rodou, criou tabela, registrou
no histórico, não re-executou numa segunda chamada). No caminho corrigimos na prática: PRIMARY KEY sem tipo,
AUTO_INCREMENT mal escrito, contextual typing (UmzugStorage<Pool> e MigrationParams<Pool> resolvendo "any"
implícito sem anotação), generic do mysql2 (RowDataPacket[] vs ResultSetHeader pro shape certo de SELECT vs
INSERT/UPDATE), imports mortos numa migration (Umzug e pool importados sem uso, já que context entrega o
pool pronto), glob com barra invertida/caminho absoluto/sem wildcard, e try/catch sem finally deixando o
pool aberto em caso de falha.

Conceito que aprendi (em uma frase):
Antes de adotar uma ferramenta por "vou precisar no futuro" (TypeORM pro app mobile) ou por "todo mundo usa"
(Flyway), separar o problema de hoje (versionar e aplicar ALTER com controle) do problema de amanhã (talvez
trocar de camada de dado) evita pagar o custo de uma decisão duas vezes.

Nome de mercado:
RBAC vs ownership-based authorization, authentication vs authorization (401 vs 403), arquitetura prematura /
YAGNI aplicado a ferramenta (não só a feature), DDL não-transacional no MySQL (implicit commit em ALTER/CREATE,
diferente de Postgres), contextual typing em TypeScript, dead import, try/catch/finally pra garantir cleanup
em qualquer caminho de saída, idempotência (CREATE TABLE IF NOT EXISTS resolvendo o bootstrap da tabela de
controle).


Débitos que ficaram:
Autorização em si (model de checagem de admin, middleware, wiring em pecaRoutes.ts) ainda não foi feita - só
a infra de migration está pronta e validada. Decisão pendente: deletar ou manter migration001.ts/tabela
testeMigrations (teste descartável) antes do commit. Convenção de nome de arquivo de migration (migration001
não diz nada sobre o conteúdo) ainda não definida pra a migration real do admin. Nenhum ADR escrito ainda - a
decisão de hoje (Flyway vs TypeORM vs Umzug) é a mais fresca e rica em trade-offs já discutida no projeto,
ótima candidata a primeiro ADR, competindo com snapshot histórico e schema drift, que seguem na fila. Nenhum
teste automatizado cobre a autorização nova ainda - vai depender de roteiro manual.

Onde parei / próximo passo:
Decidir limpeza da migration de teste e a convenção de nome, escrever a migration real (ALTER TABLE usuario
ADD COLUMN admin ... - pensando no tipo e no default pros usuários que já existem), rodar local, só depois
decidir quando rodar em Aiven. Depois: escrever o model de checagem de admin, o middleware de autorização
(nome melhor que autenticarAdmin, resposta 403), e plugar em pecaRoutes.ts no POST. Commitar em pelo menos
3 partes separadas (infra Umzug, migration do admin, autorização). Primeiro ADR continua sendo a pauta mais
atrasada do projeto - considerar escrever sobre a decisão de migration tooling de hoje, enquanto está fresca.



## 2026-10-05 — bug de constraint ausente, conceito de migrations, extração de duplicateError (rule of three)

O que refatoramos/decidimos:
Terminamos a migração de pecaController/pecaModel e usuarioController/usuarioModel pro padrão já estabelecido
(zod no controller, AppError subindo sem try/catch local). No caminho, achamos um bug de dado de verdade:
peca.nome não tinha UNIQUE no banco rodando (local e produção), mesmo o schema.sql já declarando essa
constraint — schema drift entre a fonte da verdade declarada e o estado real dos bancos. Corrigido com
ALTER TABLE direto nos dois ambientes (commit 09c2a89), e isso puxou uma discussão sobre o que é uma migration
de verdade (arquivo versionado, rastreado em qual banco já rodou o quê) vs rodar ALTER de memória - ainda não
implementado, só entendido. Extraímos src/Erros/DuplicateError.ts (commit aff6a16): o bloco que traduz
ER_DUP_ENTRY em AppError(409) já existia 3 vezes (motoPecaModel, pecaModel, usuarioModel) - bateu a regra de
"abstrair na terceira repetição". Na construção da função, corrigimos no caminho: async desnecessário
(a função não faz await nenhum) com retorno Promise<never> incoerente -> virou never puro; nome em PascalCase
(convenção de classe/tipo, tipo AppError) numa função -> virou camelCase; e aproveitamos pra alinhar
CriarUsuario -> criarUsuario, consistente com criarPeca/criarMoto. Na revisão, pegamos uma regressão real
antes do commit: postLogin tinha virado 401->404 sem querer, confundindo "login falhou" (autenticação) com a
regra de "404 em vez de 403" que é especificamente para ownership de recurso - revertido pra 401. Confirmamos
a ordem dos 4 commits pelo git log: duplicateError primeiro, schema depois, peça e usuário por último -
cada um bisectável/buildável isoladamente.

Conceito que aprendi (em uma frase):
schema.sql ser "fonte da verdade" não significa que o banco rodando reflete ele - migration é o mecanismo que
fecha essa lacuna (versionado, seu estado de aplicação rastreado por banco), em vez de confiar na memória pra
replicar o mesmo ALTER em cada ambiente.

Nome de mercado:
schema drift, migration (vs ORM - são conceitos independentes, Prisma empacota os dois), rule of three, never
type e control-flow narrowing em TypeScript, race condition / TOCTOU (por que UNIQUE no banco > checar-e-inserir
no código), dead import, PascalCase vs camelCase (classe/tipo vs função).

Débitos que ficaram:
Nenhuma ferramenta/arquivo de migration foi criado ainda - a correção de hoje foi um ALTER manual, não um
processo repetível. duplicateError.ts ainda usa (err as any).code (cast pra any preexistente). Nenhum teste
cobre a constraint UNIQUE nem o helper duplicateError. Decisão Prisma (ORM) vs mysql2 cru mencionada mas não
discutida a fundo - boa pauta pra um /decisao futuro. Primeiro ADR (snapshot histórico) segue pendente, já
adiado por 4 sessões seguidas.

Onde parei / próximo passo:
Escrever o primeiro ADR - dá pra ser o de snapshot histórico (mais antigo na fila) ou, como estudo de caso
mais fresco na cabeça, um ADR sobre a lacuna schema.sql vs banco vivo e por que isso importa. Considerar um
/decisao separado pra "vale introduzir migrations leves (arquivos .sql numerados em git) antes de decidir
sobre Prisma?" antes de misturar as duas coisas numa escolha só.


## 2026-10-01 — validação de query (zod), affectedRows em UPDATE e um bug de regressão pego na revisão

O que refatoramos/decidimos:
Em corridaModel.ts, achamos e corrigimos um bug real em buscarTodasCorridas: um guard copiado de
relatorioPorPeriodo (if linhas[0] === undefined, lançando erro) tratava "usuário sem corridas" como falha,
quando na verdade é resultado válido - diferença entre query agregada (SUM sem GROUP BY sempre devolve 1
linha) e query de lista (zero a N linhas, sem garantia nenhuma). Em corridaController.ts, separamos o schema
de validação de período em dois: Relatorio (inicio/fim obrigatórios, pro relatório) e FiltroCorridas (opcional,
pra listagem), trocamos z.string() por z.iso.date() pra validar formato de data de verdade (não só tipo), e
adicionamos dois .refine() - um pra exigir inicio e fim juntos (XNOR), outro pra garantir inicio <= fim,
comparando as strings ISO direto (sem Date()), aproveitando que AAAA-MM-DD é lexicographically sortable.
Em motoModel.ts, adicionamos a checagem de resultado.affectedRows === 0 em editarMoto, lançando AppError(404)
- o UPDATE com WHERE id=? AND usuario_id=? já fazia a checagem de posse, mas não reagia quando ela falhava
(rodava "com sucesso" sem alterar nada). Em motoController.ts, adicionamos validação zod em postMoto (que
não tinha nenhuma) e, na revisão final, achamos uma regressão de verdade: getMoto tinha passado a ignorar
o resultado de listarMoto e devolver um JSON fixo {message: "lista "} em vez da lista de motos - corrigido.

Conceito que aprendi (em uma frase):
z.coerce.number()/z.coerce.date() são pra quando você QUER aceitar e converter entrada tolerante; mas quando
a única origem da request é o seu próprio front (já corrigido de um bug anterior), validação estrita
(z.number()) funciona como rede de segurança fail-fast contra a regressão desse mesmo bug, em vez de mascará-la.

Nome de mercado:
invariant guard aplicado no lugar errado, lexicographic sortability do ISO 8601, affectedRows / silent no-op
em UPDATE com WHERE de posse, Date() vs new Date() (gotcha clássico do JS), regressão de comportamento
escondida dentro de um refactor (a revisão pegou isso, não o teste automatizado).

Débitos que ficaram:
corridaModel.ts:5 import { error } from "node:console" não usado. motoController.ts: patchMoto tem resultado
atribuído e nunca lido. motoModel.ts: listarMoto sem generic (<RowDataPacket[]>), inconsistente com editarMoto.
Um commit desta sessão misturou bug fix (buscarTodasCorridas) com melhoria de validação (zod) no mesmo commit -
quebra a regra de "um assunto por commit" que as sessões anteriores vinham seguindo. pecaController.ts e
usuarioController.ts continuam com mudanças pendentes desde o início da sessão, não tocados hoje. Nenhum ADR
escrito ainda.

Onde parei / próximo passo:
Migrar pecaController.ts/pecaModel.ts e usuarioController.ts pro mesmo padrão (zod + AppError + affectedRows
onde há update/delete), revisando se têm o mesmo tipo de regressão silenciosa que o getMoto teve. Considerar
rodar um teste manual de ponta a ponta pelo front (não só Insomnia) depois de cada refactor de controller,
já que foi assim que a regressão do getMoto apareceu - rota por rota no Insomnia não pega isso. Primeiro ADR
(snapshot histórico) continua pendente, bom próximo passo pra uma sessão separada, focada em arquitetura.


## 2026-09-30 — migração de corridaController/corridaModel pro padrão sem try/catch + fail-fast em buscas

O que refatoramos/decidimos:
Retomamos os débitos da entrada anterior: unificamos os dois `throw new Error` de existência/posse em
`criarCorrida` (corridaModel.ts) num único `AppError(404, "Moto não encontrada")`, com a mesma mensagem
pros dois casos pra não vazar existência de recurso via diferença de erro (IDOR). Migramos `postCorrida`
e `getCorridaId` pro padrão sem try/catch local, deixando o erro subir pro middleware central. Corrigimos
a validação zod que estava morta (agora checa `corrida.success` e usa o resultado parseado) e troquei
`z.date()` por `z.coerce.date()`, ajustando o parâmetro `data` do model de `number` pra `Date`. Achamos um
erro silencioso em `buscarCorridaPorId` (retornava `undefined` sem lançar nada quando a corrida não existia
ou não era do usuário) e corrigimos pra lançar `AppError(404)`. Discutimos a diferença entre "recurso único
ausente = erro" e "agregado/lista vazio = resultado válido", e usamos isso pra corrigir `relatorioPorPeriodo`:
a primeira tentativa jogava 404 quando o usuário simplesmente não tinha corrida no período (errado - isso é
resultado válido, não erro); a versão final trata `NULL` do SQL como `0` e só lança um `Error` genérico (não
`AppError`) no caso estruturalmente impossível da query não devolver linha nenhuma - sinalizando bug interno,
não "não encontrado".

Conceito que aprendi (em uma frase):
Nem toda ausência de dado é o mesmo tipo de erro - recurso único ausente é regra de negócio (AppError, 404),
mas uma invariante garantida por fora do TypeScript (nesse caso, pelo SQL) que quebra mesmo assim é bug
estrutural e deve cair no 500 genérico, não fingir ser "não encontrado".

Nome de mercado:
fail fast, silent failure / erro engolido, invariant guard, IDOR (mensagem de erro consistente pra não vazar
existência de recurso), noUncheckedIndexedAccess, tipos que mentem sobre o dado real.

Débitos que ficaram:
getRelatorio e getCorridas em corridaController.ts ainda usam o try/catch antigo com err.message cru pro
cliente. pecaController.ts inteiro ainda não migrado (diagnosticado, não tocado). autenticar.ts foi mexido
numa sessão anterior e o porquê ainda não foi explicado. Arquivo sd deletado da raiz, origem/motivo ainda
desconhecido. Jest roda o teste duas vezes (src/calculo.test.ts e dist/calculo.test.js) - falta ignorar dist/
na config do Jest. Nenhum ADR escrito ainda. Commit 8141bc1 juntou fix de segurança + correção de tipo +
refactor de try/catch numa mensagem genérica só, sem separar por assunto.

Onde parei / próximo passo:
Migrar getRelatorio e getCorridas pro mesmo padrão sem try/catch, depois seguir pro pecaController.ts
completo. Ainda pendente: entender o que mudou em autenticar.ts e o motivo do sd deletado. Considerar
começar o primeiro ADR (snapshot histórico) numa sessão focada em arquitetura, não em código.



## 2026-09-29 — validação server-side de MotoPecas com zod + correção de bug de input controlado

O que refatoramos/decidimos:
Terminamos de replicar em getMotoPecas/patchMotoPecas o padrão que tínhamos desenhado na sessão anterior:
sem try/catch local, AppError subindo pro middleware central, e um schema novo (PecaPatch, em zod) validando
custo/intervalo antes de tocar o banco — fechando a brecha de bypass por string que ainda restava na
validação manual antiga (commit 3ca20a1). No caminho, caçamos um bug real (não refactor): os inputs numéricos
de Motos.tsx, MotoPecas.tsx e Corridas.tsx quebravam o cálculo porque `e.target.value` de `<input type="number">`
sempre devolve string, mesmo com o atributo `type="number"` — o componente estava confiando no HTML pra
tipar o dado, e o HTML não tipa nada. Corrigimos a conversão string→number na origem, nos três arquivos
(commit d3a056e). Build e testes limpos nos dois commits.

Conceito que aprendi (em uma frase):
`type="number"` é só uma dica de teclado/validação pro navegador, não um contrato de tipo — `e.target.value`
é sempre string, então "número vindo de input" é primitive obsession disfarçada de tipo certo até você
converter explicitamente.

Nome de mercado:
primitive obsession, tipo que mente sobre o dado real, controlled input, never trust the client (agora do
lado do próprio front confiando no browser).

Débitos que ficaram:
corridaController.ts tem validação zod mas com `safeParseAsync` sem checar o resultado (morta) e usa `z.date()`
que não bate com o formato que chega via JSON; pecaController.ts tem `criarPeca` chamado sem `await` e um
import de AppError que não é mais usado; autenticar.ts foi mexido e ainda não foi explicado por que; o arquivo
`sd` foi deletado da raiz e ainda não sabemos a origem/motivo dele. Decisão de UX em aberto: 404 de "moto não
encontrada" hoje cairia num tratamento genérico tipo o do 401 — a ideia é isso virar um estado local na
página (com botão "voltar pra motos") em vez de redirect centralizado, ainda não implementado.

Onde parei / próximo passo:
Explicar e revisar as duas mudanças pendentes de autenticar.ts e o arquivo `sd` deletado antes de seguir.
Depois, fechar o `await` faltando e o import morto em pecaController.ts, consertar a validação zod de
corridaController.ts (checar o resultado do parse e trocar `z.date()` por algo compatível com JSON), e só
então desenhar o estado local de "moto não encontrada" na página de MotoPecas.

---

## 2026-09-28 — error-handling middleware central + primeiro passo de validação com zod

O que refatoramos/decidimos:
Começamos querendo decidir "zod vs validação manual" pra entrada de dados, mas descobrimos no meio do caminho
que não dava pra fazer isso direito sem um error-handling middleware central (débito que já tínhamos anotado).
Construímos esse middleware do zero em server.ts (ErrorRequestHandler, 4 parâmetros), movemos a tradução do
erro de constraint UNIQUE do mysql (ER_DUP_ENTRY) do controller pro model (motoPecaModel.criarMotoPeca), removemos
o try/catch redundante de postMotoPeca (deixando o erro subir sozinho, aproveitando o auto-forward de Promise
rejeitada do Express 5), e implementamos o primeiro schema real de zod (Peca, em motoPecaController.ts) validando
peca_id/custo/intervalo_km antes de tocar o banco. Também corrigimos a inconsistência de status HTTP entre os
casos de "moto não encontrada" (401 -> 404, alinhado com a regra de nunca vazar existência de recurso).

Conceito que aprendi (em uma frase):
Um error-handling middleware central só funciona se os erros tiverem permissão de "borbulhar" até ele -
try/catch local sempre intercepta primeiro, então centralizar exige remover as duplicações antigas, não só
criar o middleware novo do lado.

Nome de mercado:
error-handling middleware (arity de 4 parâmetros), leaky abstraction (código de erro do mysql vazando pro
controller), swallowed exception / erro engolido em silêncio, never trust the client, fail fast.

Débitos que ficaram:
getMotoPecas e patchMotoPecas ainda usam o try/catch genérico antigo; patchMotoPecas ainda tem a validação
manual (custo<=0) vulnerável a bypass por string; zod ainda não foi desenhado formalmente pros outros
endpoints (postCorrida é o mais urgente, por causa do teto do DECIMAL(5,2) em kms_rodados); nenhum ADR
escrito ainda.

Onde parei / próximo passo:
Replicar o padrão (zod no controller + AppError no model + sem try/catch local) em postCorrida e
pecaController. Considerar escrever o primeiro ADR (snapshot histórico) como próximo exercício de arquitetura.