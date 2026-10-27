# ADR-001: Snapshot histórico de corrida

Status: Aceito
Data: 2026-10-12

## Contexto
O app permite editar o custo de cada peça e o custo por litro de gasolina. Sem alguma forma de
preservar esses valores no momento do cálculo, o lucro calculado de uma corrida já registrada mudaria
silenciosamente quando o usuário editasse peça/gasolina depois — mesmo sem o usuário ter feito nada
naquela corrida específica.

## Opções consideradas
- A: calcular o custo por km de cada peça no backend e gravar só esse valor agregado na corrida.
- B: não gravar nada extra, calcular o lucro na hora via JOIN com os valores atuais de moto_peca.
- C: gravar uma linha por peça em corrida_peca (FK pra corrida e pra moto_peca), congelando o
  custo/km individual de cada peça usada naquela corrida.

## Decisão
Opção C.

## Por quê
Preserva o valor de cada peça individualmente, não só o total agregado, permitindo auditar o cálculo
peça por peça depois de qualquer edição em moto_peca. A opção B quebraria o lucro histórico real; a
opção A perderia o detalhe por peça.

## Consequências
Ganha: lucro histórico real e auditável por peça. Reforçado pelo próprio banco — a FK em
corrida_peca.moto_peca_id usa ON DELETE RESTRICT por padrão, então o MySQL impede apagar uma
moto_peca referenciada por alguma corrida, reforçando a regra de "sem hard delete" do projeto.
Perde: mais complexidade de escrita (um INSERT por peça da moto, dentro de uma transação pra garantir
atomicidade).

## Revisar se
O modelo de registro mudar de "corrida com lista de peças" pra algo mais simples, como hodômetro
(km de saída/chegada), onde talvez não exista mais a mesma granularidade de "peças usadas naquela
corrida" pra congelar.