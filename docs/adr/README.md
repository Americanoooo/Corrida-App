# Architecture Decision Records (ADRs)

Cada arquivo aqui registra **uma** decisão de arquitetura do Corrida App: o problema, as opções consideradas, o que foi escolhido e o que aceitamos perder. O objetivo é que qualquer pessoa, inclusive eu daqui a seis meses, entenda o *porquê* do código, não só o *o quê*.

- Nome do arquivo: `NNN-titulo-curto.md` (ex.: `001-snapshot-historico.md`).
- Um ADR aceito não é apagado. Se a decisão mudar, escreva um novo ADR e marque o antigo como "Substituído por ADR-NNN".

## Formato

```
# ADR-NNN: título curto da decisão

Status: Aceito | Substituído por ADR-NNN
Data: AAAA-MM-DD

## Contexto
Qual problema, quais restrições.

## Opções consideradas
- A: ...
- B: ...

## Decisão
O que escolhemos.

## Por quê
O argumento principal.

## Consequências
O que ganhamos e o que aceitamos perder.

## Revisar se
O gatilho que tornaria essa decisão errada.
```
