# Calculadora de Lucro Real de Corridas de Moto

Aplicação full-stack que calcula o **lucro real** de motoristas de aplicativo — não apenas `receita − gasolina`, mas o lucro que sobra depois de contabilizar o **desgaste diluído das peças** que cada corrida consome.

## O problema

Motoristas de aplicativo costumam confundir **faturamento bruto** com **lucro real**. Descontam a gasolina, mas ignoram algo que corrói a margem silenciosamente: cada quilômetro rodado desgasta óleo, relação, pneus e freios. Uma corrida que parece lucrativa pode, no fim, dar pouco ou nenhum lucro depois desse desgaste — e nenhum app existente mostra isso.

## A solução

O motorista cadastra suas motos e, para cada moto, as peças com seu custo e vida útil em quilômetros. Ao registrar uma corrida (com a quilometragem, a receita e o preço da gasolina), o sistema:

1. Dilui o custo de cada peça por km (`custo ÷ intervalo de troca`)
2. Soma esse desgaste ao custo do combustível
3. Revela o **lucro real** daquela corrida — e o total consolidado por período

O resultado é um diagnóstico que o motorista raramente tem: quanto ele *de fato* ganha, e qual peça mais corrói sua margem.

## Stack

**Backend**
- Node.js + TypeScript
- Express
- MySQL (`mysql2`, prepared statements)
- JWT + bcrypt (autenticação)

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## Funcionalidades

- Autenticação com JWT e dados isolados por usuário
- Cadastro de motos e das peças de cada moto (custo + vida útil em km)
- Registro de corridas em qualquer data
- Cálculo automático de receita bruta e lucro real por corrida
- Filtro de corridas por período e por moto
- Total de lucro consolidado do período selecionado

## Destaques técnicos

- **Snapshot histórico:** cada corrida congela os custos do momento em que aconteceu — mudar o preço de uma peça hoje não altera o lucro de corridas passadas.
- **Multi-tenant:** isolamento de dados por usuário, com `usuario_id` sempre derivado do token JWT (nunca do corpo da requisição) e verificação de posse antes de cada operação.
- **Transação atômica:** o registro de corrida grava a corrida e os snapshots das peças de forma tudo-ou-nada, com rollback em caso de falha.
- **DECIMAL para dinheiro:** evita os erros de arredondamento do FLOAT em valores monetários.

## Repositórios

- **Backend:** https://github.com/Americanoooo/Corrida-App/tree/main/backend
- **Frontend:** https://github.com/Americanoooo/Corrida-App/tree/main/frontend

## Autor

Desenvolvido por Cauã — projeto nascido de uma dor real vivida dirigindo por aplicativo.
