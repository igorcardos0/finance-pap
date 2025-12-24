# Estrutura de Pastas do Projeto

Este projeto segue as melhores práticas de organização de código React, baseadas nas recomendações da Rocketseat.

## 📁 Estrutura Principal

```
dev-finance/
├── app/                          # Next.js App Router (páginas e rotas)
│   ├── dashboard/               # Rotas do dashboard
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial
│   └── globals.css              # Estilos globais (movido para src/styles)
│
├── src/                          # Código-fonte principal
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ui/                  # Componentes UI genéricos (shadcn/ui)
│   │   └── common/              # Componentes comuns reutilizáveis
│   │       ├── app-shell/       # Shell principal da aplicação
│   │       ├── command-palette/ # Paleta de comandos
│   │       ├── notifications-panel/ # Painel de notificações
│   │       └── theme-provider/  # Provedor de tema
│   │
│   ├── features/                # Funcionalidades específicas (Feature-based)
│   │   ├── auth/                # Autenticação
│   │   │   └── components/
│   │   │       └── login-page/
│   │   │
│   │   ├── dashboard/           # Dashboard principal
│   │   │   └── components/
│   │   │       └── dashboard-view/
│   │   │
│   │   ├── transactions/        # Transações
│   │   │   └── components/
│   │   │       ├── transactions-view/
│   │   │       └── add-transaction-dialog/
│   │   │
│   │   ├── credit-cards/        # Cartões de crédito
│   │   │   └── components/
│   │   │       ├── credit-cards-view/
│   │   │       └── add-credit-card-dialog/
│   │   │
│   │   ├── debts/               # Dívidas
│   │   │   └── components/
│   │   │       ├── debts-view/
│   │   │       └── add-debt-dialog/
│   │   │
│   │   ├── planning/            # Planejamento financeiro
│   │   │   └── components/
│   │   │       ├── planning-view/
│   │   │       ├── add-goal-dialog/
│   │   │       └── emergency-fund-dialog/
│   │   │
│   │   ├── reports/              # Relatórios
│   │   │   └── components/
│   │   │       └── reports-view/
│   │   │
│   │   ├── settings/             # Configurações
│   │   │   └── components/
│   │   │       ├── settings-view/
│   │   │       ├── categories-settings/
│   │   │       └── budgets-settings/
│   │   │
│   │   └── summary/              # Resumo financeiro
│   │       └── components/
│   │           └── summary-view/
│   │
│   ├── hooks/                    # Hooks customizados
│   │   ├── use-auto-backup.ts
│   │   ├── use-budgets.ts
│   │   ├── use-categories.ts
│   │   ├── use-finance-data.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-mobile.ts
│   │   ├── use-notifications.ts
│   │   ├── use-theme.ts
│   │   ├── use-toast.ts
│   │   └── index.ts             # Exportações centralizadas
│   │
│   ├── lib/                      # Utilitários e funções auxiliares
│   │   ├── financial-forecast.ts
│   │   ├── formatters.ts
│   │   ├── i18n.ts
│   │   ├── import-utils.ts
│   │   ├── pdf-export.ts
│   │   ├── toast.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── index.ts             # Exportações centralizadas
│   │
│   └── styles/                   # Estilos globais
│       └── globals.css
│
├── public/                       # Arquivos estáticos
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Princípios de Organização

### 1. **Feature-Based Structure**
Cada funcionalidade tem sua própria pasta em `features/`, contendo:
- Componentes específicos da feature
- Lógica relacionada
- Hooks específicos (se necessário)
- Utilitários específicos (se necessário)

### 2. **Componentes Reutilizáveis**
- `components/ui/`: Componentes UI genéricos (shadcn/ui)
- `components/common/`: Componentes comuns reutilizáveis em toda a aplicação

### 3. **Hooks Globais**
Todos os hooks customizados ficam em `hooks/` e são exportados via `index.ts` para facilitar importações.

### 4. **Utilitários**
Funções auxiliares e utilitários ficam em `lib/` e são exportados via `index.ts`.

### 5. **Arquivos Index.ts**
Cada pasta de componente/feature tem um `index.ts` que exporta os elementos principais, facilitando importações:

```typescript
// Antes
import { TransactionsView } from "@/features/transactions/components/transactions-view/transactions-view"

// Depois (usando index.ts)
import { TransactionsView } from "@/features/transactions/components/transactions-view"
```

## 📝 Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `TransactionsView.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useFinanceData.ts`)
- **Utilitários**: camelCase (ex: `formatters.ts`)
- **Pastas**: kebab-case (ex: `credit-cards/`)

## 🔗 Importações

O projeto usa caminhos absolutos configurados no `tsconfig.json`:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Exemplos de Importações:

```typescript
// Componentes UI
import { Button } from "@/components/ui/button"

// Componentes comuns
import { AppShell } from "@/components/common/app-shell"

// Features
import { TransactionsView } from "@/features/transactions/components/transactions-view"

// Hooks
import { useFinanceData } from "@/hooks/use-finance-data"
// ou usando index.ts
import { useFinanceData } from "@/hooks"

// Utilitários
import { formatCurrency } from "@/lib/formatters"
// ou usando index.ts
import { formatCurrency } from "@/lib"
```

## 🚀 Benefícios desta Estrutura

1. **Escalabilidade**: Fácil adicionar novas features sem bagunçar o código existente
2. **Manutenibilidade**: Cada feature é auto-contida e fácil de encontrar
3. **Reutilização**: Componentes comuns e hooks são facilmente acessíveis
4. **Colaboração**: Múltiplos desenvolvedores podem trabalhar em features diferentes sem conflitos
5. **Testabilidade**: Cada feature pode ser testada isoladamente

## 📚 Referências

Esta estrutura é baseada nas melhores práticas recomendadas pela Rocketseat:
- [Organização de pastas no React](https://www.rocketseat.com.br/blog/organizacao-de-pastas-no-react)

