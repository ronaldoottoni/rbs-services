# RBS Services

Management system for an **agricultural drone service company**: clients, rural properties, field areas, service projects, executed services and the full financial cycle (accounts receivable and payable).

> 🚧 **Work in progress.** The REST API and the database layer are functional. The web front-end is the next step.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## The problem

Drone spraying companies usually track jobs, hectares and payments in spreadsheets and WhatsApp. RBS Services models the real workflow of the business:

1. A **client** owns one or more **properties** (farms), each split into **areas** (crop fields, pasture, reserves) with size in hectares and optional GeoJSON boundaries.
2. A **project** is opened for a client and property, based on a **service catalog** item (drone spraying, irrigation, consulting…) priced per hectare, hour, day or project.
3. Each **executed service** records the date, the area actually covered, the product and dose applied, and the value.
4. Executed services generate **accounts receivable**; supplier costs (fuel, inputs, maintenance) go to **accounts payable**, optionally linked to the project for profitability tracking.

## Features

- **Registry:** people (clients, suppliers, employees, carriers, banks), properties, areas, service catalog
- **Operations:** projects with status lifecycle (planning → in progress → paused → completed / cancelled), areas per project, executed services
- **Accounts receivable:** partial and full receipts, interest, fines and discounts, filters by client, project, status and due date
- **Accounts payable:** same model, with expense categories
- **Reversals:** a receipt or payment can be reversed with a mandatory reason; balances and status are recalculated inside a **database transaction**
- **Business rules:** e.g. a receivable that already has receipts cannot be cancelled
- **Summaries:** project summary and financial dashboard (open, received, overdue amounts and counts)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Route Handlers) |
| Language | TypeScript |
| ORM | Prisma 7 with the `pg` driver adapter |
| Database | PostgreSQL 16 (local via Docker, or Supabase) |
| UI (planned) | React 19 + Tailwind CSS 4 |

## Data model

```
Pessoa (client/supplier) ──< Propriedade (farm) ──< AreaPropriedade (field)
   │                              │                        │
   │                              └──< Projeto >───────────┤ (via ProjetoArea)
   │                                     │                 │
   │                                     │          ServicoExecutado
   │                                     │                 │
   ├──< ContaReceber >───────────────────┴─────────────────┘
   │        └──< Recebimento (receipts, reversible)
   │
   └──< ContaPagar (supplier) ──< Pagamento (payments, reversible)
```

Monetary values use `Decimal(15,2)`. The full schema is in [`prisma/schema.prisma`](prisma/schema.prisma).

## API endpoints

All routes are under `/api`. `[id]` routes support `GET`, `PUT` and `DELETE`; collection routes support `GET` (with filters) and `POST`.

| Resource | Routes | Filters (query string) |
|---|---|---|
| People | `/pessoas`, `/pessoas/[id]` | |
| Properties | `/propriedades`, `/propriedades/[id]` | `pessoaId` |
| Areas | `/areas`, `/areas/[id]` | `propriedadeId` |
| Service catalog | `/servicos`, `/servicos/[id]` | |
| Projects | `/projetos`, `/projetos/[id]`, `GET /projetos/[id]/resumo` | `pessoaId` |
| Project areas | `/projetoAreas`, `/projetoAreas/[id]` | `projetoId` |
| Executed services | `/servicoExecutado`, `/servicoExecutado/[id]` | `projetoAreaId` |
| Accounts receivable | `/contasReceber`, `/contasReceber/[id]` | `clienteId`, `projetoId`, `status`, `vencimentoIni`, `vencimentoFin`, `flagCancelados` |
| Receipts | `GET/POST /contasReceber/[id]/recebimentos`, `POST /contasReceber/[id]/recebimentos/[recebimentoId]` (reversal) | |
| Accounts payable | `/contasPagar`, `/contasPagar/[id]` | `fornecedorId`, `projetoId`, `status`, `vencimentoIni`, `vencimentoFin`, `flagCancelados` |
| Payments | `GET/POST /contasPagar/[id]/pagamentos`, `POST /contasPagar/[id]/pagamentos/[pagamentoId]` (reversal) | |
| Financial summary | `GET /financeiro/resumo` | |

Example: register a partial receipt

```bash
curl -X POST http://localhost:3000/api/contasReceber/<id>/recebimentos \
  -H "Content-Type: application/json" \
  -d '{
        "dataRecebimento": "2026-11-09",
        "valorRecebido": 1500.00,
        "formaRecebimento": "PIX"
      }'
```

## Running locally

**Requirements:** Node.js 20+, Docker

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure the connection
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drone_agricola"' > .env

# 4. Apply migrations and generate the Prisma client
npx prisma migrate dev
npx prisma generate

# 5. Start the dev server
npm run dev
```

The API will be available at `http://localhost:3000/api`.

## Roadmap

- [x] Database schema and migrations
- [x] REST API for registry, projects and executed services
- [x] Accounts receivable / payable with receipts, payments and reversals
- [x] Project and financial summaries
- [ ] Web front-end (React + Tailwind)
- [ ] Authentication and user roles
- [ ] Input validation with Zod
- [ ] Automated tests
- [ ] Map view of areas using the stored GeoJSON

## Author

**Ronaldo Ottoni**, software developer with 20+ years of experience in business systems (COBOL, PHP, TypeScript) and API integrations.
[GitHub](https://github.com/ronaldoottoni)
