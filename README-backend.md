# Calculadora de Lucro Real — API

Motoristas de aplicativo costumam confundir **faturamento bruto** com **lucro real**: descontam a gasolina, mas ignoram o desgaste que cada corrida causa nas peças da moto. Esta API calcula o lucro real de cada corrida — o motorista cadastra as peças (custo e vida útil em km) e, junto com o preço da gasolina, o sistema dilui o desgaste por quilômetro rodado e revela quanto de fato sobrou.

O diferencial em relação a apps existentes: eles calculam apenas `receita − gasolina`. Aqui o cálculo inclui o **desgaste diluído de cada peça** (`custo da peça ÷ intervalo de troca × km rodados`), dando o lucro real que o motorista raramente enxerga.

## Stack

- **Runtime / Linguagem:** Node.js + TypeScript
- **Framework:** Express
- **Banco de dados:** MySQL (driver `mysql2`, prepared statements)
- **Autenticação:** JWT (`jsonwebtoken`) + `bcrypt` para hash de senha
- **Outros:** CORS

## Funcionalidades

- Autenticação (cadastro / login) com JWT e isolamento de dados por usuário
- Cadastro de motos e das peças de cada moto, com custo diluído por quilômetro
- Registro de corridas em qualquer data (para lançar ao fim do dia)
- Cálculo automático de receita bruta e lucro real por corrida
- Listagem de corridas com filtro por período e por moto
- Total de lucro consolidado do período selecionado

## Decisões de arquitetura

**Snapshot histórico dos custos**
Cada corrida congela o custo das peças e o preço da gasolina do momento em que foi registrada, em vez de referenciar os valores atuais. Uma corrida é um fato do passado: se o preço de uma peça ou da gasolina muda hoje, o lucro das corridas antigas permanece intacto. Isso mantém o histórico fiel e permite que o app sirva de diagnóstico ao longo do tempo.

**Multi-tenant com isolamento por usuário**
Cada usuário só acessa os próprios dados. O `usuario_id` vem sempre do token JWT verificado, nunca do corpo da requisição — que o cliente poderia forjar. Um middleware valida o token e injeta o `usuario_id` na requisição (autenticação); antes de qualquer escrita, o sistema confere se o recurso pertence ao usuário logado (autorização), respondendo `403` para acesso a dados de terceiros. As próprias queries filtram por `usuario_id`, isolando os dados na camada de dados, não apenas na rota.

**Registro de corrida em transação atômica**
Registrar uma corrida grava em duas tabelas: a corrida em si e um snapshot de cada peça da moto. Essas operações estão envolvidas em uma transação (com rollback em caso de falha) para que gravem todas ou nenhuma. Sem isso, uma falha no meio do loop de peças deixaria uma corrida sem seus snapshots — um registro incompleto que corromperia os cálculos de lucro. A conexão é liberada no `finally`, evitando vazamento mesmo em caso de erro.

**DECIMAL para valores monetários**
Todos os campos de dinheiro (custos, receita, gasolina) usam DECIMAL, não FLOAT. FLOAT representa decimais em binário e acumula erros de arredondamento — inaceitável quando o resultado são centavos que precisam bater. DECIMAL armazena o valor exato, garantindo cálculos de lucro confiáveis.

**Arquitetura em camadas**
O código é separado em rotas → controllers → models. As rotas apenas direcionam; os controllers tratam requisição/resposta e status HTTP; os models concentram o acesso ao banco. Cada camada tem uma responsabilidade única, o que facilita testar e evoluir cada parte isoladamente.

**Tratamento de erros com status HTTP**
Uma classe `AppError` (que estende `Error` com um campo `status`) permite que os models sinalizem o código HTTP correto (400, 403, 404), e o controller o traduz na resposta. Erros inesperados caem em um `500` genérico. Isso centraliza o tratamento em vez de espalhar `res.status` por toda parte.

## Modelo de dados

- **usuario** — dados de login (senha armazenada como hash)
- **moto** — motos do usuário
- **peca** — catálogo global de peças (óleo, relação, etc.)
- **moto_peca** — vínculo entre moto e peça, com custo e intervalo de troca em km (configuração "viva", editável)
- **corrida** — cada corrida registrada, com receita, km e o preço da gasolina congelado
- **corrida_peca** — snapshot do custo por km de cada peça no momento da corrida (histórico imutável)

## Como rodar localmente

Pré-requisitos: Node.js e um servidor MySQL.

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# 2. Instale as dependências
npm install

# 3. Crie o banco e as tabelas
# importe o arquivo de schema no seu MySQL (ex: "app corrida schema.sql")

# 4. Configure as variáveis de ambiente
# copie o .env.example para .env e preencha os valores
cp .env.example .env

# 5. Rode em modo de desenvolvimento
npm run dev
```

### Variáveis de ambiente (`.env`)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=app_corrida
DB_PORT=3306
PORT=3000
JWT_SECRET=
```

## Principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/usuario/cadastrar` | Cria um usuário |
| POST | `/usuario/login` | Autentica e retorna o token JWT |
| GET | `/motos` | Lista as motos do usuário |
| POST | `/motos` | Cadastra uma moto |
| GET | `/motos/:motoId/pecas` | Lista as peças de uma moto |
| POST | `/motos/:motoId/pecas` | Vincula uma peça à moto |
| GET | `/corridas` | Lista corridas (aceita `?inicio=&fim=`) |
| POST | `/motos/:motoId/corridas` | Registra uma corrida |
| GET | `/corridas/:id` | Detalhe de uma corrida com breakdown por peça |

> Todas as rotas de dados exigem o header `Authorization: Bearer <token>`.
