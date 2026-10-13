# Design system — Lucrei

Registro do sistema visual do app. Tokens em `frontend/src/index.css` (`@theme`), componentes de apresentação em `frontend/src/components/ui/`. Este arquivo documenta o quê e o porquê; o código manda no valor exato.

## Identidade

Nome do produto: **Lucrei**. Tagline de loja: "Lucrei: Ganho Real". Dentro do app, só "Lucrei" (navbar, título da aba, login) — nome curto lê melhor numa tela pequena.

## Cores semânticas

| Token | Hex | Uso | Por quê |
|---|---|---|---|
| `--color-marca` | `#6d28d9` | botão primário, foco, destaque | Violeta em vez do blue-600 genérico de SaaS — remete a app financeiro no imaginário BR (Nubank), e fica livre pra não disputar significado com o verde de lucro |
| `--color-marca-hover` | `#5b21b6` | hover do botão primário | — |
| `--color-marca-active` | `#4c1d95` | active/pressed do botão primário | — |
| `--color-superficie` | `#ffffff` | fundo de card | Precisa destacar do fundo da página pra dar hierarquia visual |
| `--color-fundo` | `#eceef3` | fundo da página (fora da faixa) | Cinza frio em vez de branco puro — separa o "chão" da tela dos cards brancos por cima dele |
| `--color-texto` | `#0f172a` | números, títulos, texto principal | Contraste máximo — é o que precisa ser lido de relance, no sol |
| `--color-texto-secundario` | `#475569` | legenda, label, data | ~8:1 de contraste — mais escuro que o slate-500 usado antes, resiste melhor à luz forte |
| `--color-borda` | `#cbd5e1` | divisor, contorno de card/input | Borda visível é a diferença entre "sumiu no sol" e "lê numa olhada" |
| `--color-lucro` | `#166534` | valor de lucro positivo | Escurecido de `#15803d` pra continuar AA (4.5:1) como texto corrido agora que o fundo da página é `--color-fundo` (cinza), não mais branco puro |
| `--color-prejuizo` | `#b91c1c` | valor de lucro negativo | Sem mudança — já passava AA |
| `--color-sucesso` | `#15803d` | toast de confirmação | Fica no valor antigo de propósito: toast é texto branco sobre fundo verde solid, não depende do fundo da página pra ter contraste |
| `--color-erro` | `#b91c1c` | toast de erro, mensagem de validação | Mesmo vermelho do prejuízo |
| `--color-erro-hover` / `--color-erro-active` | `#991b1b` / `#7f1d1d` | estados do `.btn-danger` / `Button variant="danger"` | — |
| `--color-aviso` | `#92400e` | alerta (ainda sem tela usando) | Reservado — faltava no sistema anterior |

**Regra pro lucro/prejuízo:** nunca só a cor. Sempre com sinal (`+R$ 42,00` / `−R$ 18,50`) e ícone (`IconTrendUp`/`IconTrendDown`) quando couber. Cor sozinha falha pra quem tem deficiência de cor e falha no sol com reflexo na tela.

### Faixa (navbar + cabeçalho + herói)

| Token | Hex | Uso |
|---|---|---|
| `--color-faixa` | `#3b0f8c` | fundo da `Navbar` e do componente `Faixa` |
| `--color-faixa-texto` | `#ffffff` | texto/valor principal dentro da faixa |
| `--color-faixa-texto-secundario` | `#d8cdf5` | label/legenda dentro da faixa |
| `--color-faixa-borda` | `#8f74d9` | divisor e contorno de chip dentro da faixa |
| `--color-lucro-selo-bg` / `--color-lucro-selo-texto` | `#dcfce7` / `#166534` | pílula "No positivo" dentro do `HeroMetric` |
| `--color-prejuizo-selo-bg` / `--color-prejuizo-selo-texto` | `#fee2e2` / `#991b1b` | pílula "No negativo" dentro do `HeroMetric` |

**Regra da faixa:** só `Navbar` + `PageHeader` + `HeroMetric` moram dentro dela. Nada de `.card` dentro da faixa — card é sempre branco sobre `--color-fundo`; misturar os dois (card sobre fundo violeta) quebra a hierarquia de "a faixa é o cabeçalho, o cinza é o conteúdo". Dentro da faixa, o valor do número (`HeroMetric`) é sempre branco — o sinal positivo/negativo vem do **selo**, nunca da cor do número em si, porque verde/vermelho em cima de violeta escuro tem contraste ruim.

## Tipografia

Família: Inter (carregada via Google Fonts no `index.html`). Escala curta, poucos tamanhos:

| Papel | Tamanho | Peso |
|---|---|---|
| Número-herói (`HeroMetric`) | 36px (`text-4xl`) | 700 |
| Número-chave em card (`StatCard`) | 20px (`text-xl`) | 700 |
| Título de página (`PageHeader` h1) | 24px (`text-2xl`) | 700 |
| Subtítulo de card (h2) | 16px (`text-base`) | 600 |
| Corpo / input | 16px (`text-base`) | 400–500 |
| Legenda / label | 13–14px (`text-xs`/`text-sm`) | 500 |

16px é o piso pra input — menos que isso o Android/iOS dá zoom automático no foco.

`tabular-nums` (utilitário nativo do Tailwind) em toda coluna numérica — R$, km, data — pra alinhar dígito com dígito numa lista. Não é um token custom, é o utility do Tailwind mesmo.

## Raios — só 3

| Token | Valor | Uso |
|---|---|---|
| `--radius-controle` | 8px (`rounded-controle`) | botão, input, select, badge pequeno |
| `--radius-card` | 16px (`rounded-card`) | card de conteúdo |
| `--radius-sheet` | 24px (`rounded-sheet`) | topo do bottom sheet (`Modal` no mobile) |

## Movimento

- `--animate-fade-in` / `--animate-slide-up` / `--animate-scale-in` no `@theme` — entrada de modal/toast/tela, nunca decoração gratuita.
- Sempre atrás de `motion-safe:` (ou `motion-reduce:` pro estado oposto) — quem pede menos movimento no sistema não recebe nenhum.
- `transition` só em `transform`/`opacity`/`background-color`, nunca `transition: all`.
- Toque dá feedback com `active:scale-95`/`active:scale-[0.98]` — hover não existe no celular.

## Ícones

`frontend/src/components/ui/icons.tsx` — SVG inline desenhados à mão (traço 2px, cantos arredondados, viewBox 24), sem lib externa. Adicionar um ícone novo é escrever uma função `IconX` nesse arquivo, não instalar pacote.

## Componentes de apresentação (`frontend/src/components/ui/`)

| Componente | Pra quê |
|---|---|
| `Button` | 4 variantes (primary/secondary/danger/ghost), `min-h-12`, `active:scale`, `focus-visible`, estado `loading`. Substitui as antigas `.btn-primary`/`.btn-secondary`/`.btn-danger` do CSS. |
| `Faixa` | faixa cheia (violeta), cola na `Navbar` sem emenda via margem negativa. Envolve `PageHeader`/`HeroMetric` quando a tela tem um número-chave. |
| `PageHeader` | título + ação na mesma linha, descrição opcional abaixo. Prop `tom`: `"escuro"` (padrão, sobre `--color-fundo`) ou `"claro"` (dentro da `Faixa`). |
| `HeroMetric` | número grande (36px), sempre branco. Prop `selo` opcional: pílula com ícone + "No positivo"/"No negativo" + total — o sinal mora no selo, não na cor do número. |
| `StatCard` | card pequeno com ícone + label + valor, pra números secundários fora da faixa. Sem uso ativo hoje. |
| `EmptyState` | ícone + título + descrição + convite de ação, pra lista vazia. |
| `Modal` | bottom sheet no mobile (sobe do rodapé, topo arredondado), modal centrado no desktop. Fecha com Esc/clique fora. Usado tanto pra **criar** (aberto pelo `Fab`) quanto pra **editar** registro existente. |
| `Fab` | botão circular fixo, abre o `Modal` de criar. Fica acima da `BottomNav` no mobile. |
| `components/corridas/GrupoDoDia` | específico de Corridas — cabeçalho do dia com subtotal de lucro + linhas daquele dia num card. |

As classes `.card`, `.input-field`, `.select-field` continuam em `index.css` (usadas dentro dos componentes acima e em campos soltos). `.btn-primary`/`.btn-secondary`/`.btn-danger` ficam só como fallback — prefira `Button`.

## Padrão de tela — lista + criar

Esqueleto usado em Corridas, Motos e MotoPecas (telas autenticadas, com `Layout` → `Navbar`/`BottomNav`):

```
<Faixa largura="max-w-5xl | max-w-4xl">        ← fundo violeta, cola na Navbar
  [Link "← Voltar", só em sub-página — DENTRO da Faixa, em faixa-texto-secundario]
  PageHeader tom="claro" (título + ação opcional, ex: chip de filtro)
  [HeroMetric + stats inline — só se a tela tiver um número-chave]
</Faixa>
Conteúdo sobre --color-fundo: skeleton (carregando) → EmptyState (lista vazia) → lista
Fab → Modal (criar)
Modal (editar, quando a lista permite editar item)
```

**Por que o "← Voltar" mora dentro da `Faixa`, não antes dela:** a `Faixa` usa margem negativa (`-mt-8`) pra furar o padding do `<main>` e tocar as bordas da tela. Se algo ficasse acima dela dentro do fluxo normal, a margem negativa subiria a faixa por cima desse algo. Então tudo que precisa ficar "no topo da tela" entra dentro da `Faixa` — inclusive navegação, não só título.

Status por tela: **Corridas**, **Motos** e **MotoPecas** já usam `Faixa`. Login não usa (tela de auth isolada).

Regras do padrão:
- **Nunca form sempre aberto na tela.** Criar é uma ação (`Fab`), não um bloco que compete por espaço com a lista. Depois de cadastrar com sucesso, o sheet **não fecha** — os campos limpam e ficam prontos pro próximo registro (motoboy loga várias corridas/motos em sequência sem reabrir o sheet a cada vez).
- **Sem heading redundante tipo "X cadastradas".** O `PageHeader` já diz o que a tela é; a lista vem direto depois.
- **Mesma largura de conteúdo:** `max-w-5xl mx-auto` (Corridas, Motos) ou `max-w-4xl mx-auto` (MotoPecas, tela mais estreita). `max-w-sm` só no Login (tela de auth isolada, não usa esse esqueleto).
- **Mesmo ritmo vertical:** `flex flex-col gap-6` no container da página.
- **Hero é exceção, não regra.** Só existe quando a tela tem um número que é a razão dela existir (lucro, em Corridas). Motos/MotoPecas não têm — forçar um hero ali seria decoração, não hierarquia.

Login foge desse esqueleto de propósito: é tela pública de autenticação (sem lista, sem `Fab`), com sua própria composição (hero de marca + abas Entrar/Criar conta).

## Pendências conhecidas

- Favicon aponta pra `midia\logo ca.PNG` (path com barra invertida, fora de `public/`, extensão em maiúscula) — quebra em build Linux (Vercel) e ainda mostra a arte antiga "CA". Fica para o `/loja`.
- `--color-aviso` reservado, nenhuma tela usa ainda.
- `StatCard` ficou sem uso depois do redesenho de Corridas (hero + stats inline substituíram os 3 cards) — continua disponível pra outra tela que precisar de números secundários em card.
