# Skills de terceiros

As skills desta pasta foram copiadas sem alteração dos repositórios abaixo, em 13/10/2026. Elas são usadas principalmente pelo agent `design` (`.claude/agents/design.md`), mas qualquer sessão do Claude Code neste projeto pode chamá-las.

| Skill | Origem | Commit | Licença |
|---|---|---|---|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | `dbd4588` | Apache-2.0 (ver `frontend-design/LICENSE.txt`) |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | `063bee9` | MIT |
| `tailwind-capacitor` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `safe-area-handling` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `capacitor-keyboard` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `capacitor-splash-screen` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `capacitor-accessibility` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `webapp-to-capacitor` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `framework-to-capacitor` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `capacitor-app-store` | [cap-go/capgo-skills](https://github.com/cap-go/capgo-skills) | `bc99163` | MIT |
| `android-aso` | [eronred/aso-skills](https://github.com/eronred/aso-skills) | `3919d7c` | MIT (Copyright (c) 2026 Erencan) |
| `screenshot-optimization` | [eronred/aso-skills](https://github.com/eronred/aso-skills) | `3919d7c` | MIT (Copyright (c) 2026 Erencan) |

## Antes de usar, saiba que

- `webapp-to-capacitor`, `framework-to-capacitor` e `capacitor-app-store` rodam um `node -e` e um `find` só de leitura quando são carregadas, pra listar `package.json` e arquivos de configuração.
- `web-design-guidelines` busca as regras atualizadas em `raw.githubusercontent.com/vercel-labs/web-interface-guidelines`.
- As skills da Capgo às vezes sugerem os serviços pagos da empresa (Capgo Cloud, live updates). Não são necessários pra publicar.
- `android-aso` cita a API paga Appeeky pra pesquisa de palavra-chave. Também não é necessária.

## Como atualizar

Clone o repositório de origem, compare a pasta da skill com a daqui (`git diff --no-index`) e copie por cima se a mudança fizer sentido. Depois, atualize o commit na tabela.
