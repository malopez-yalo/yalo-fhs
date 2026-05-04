# Yalo KPI Hub

Enterprise dashboard for monitoring AI agent health across Yalo's portfolio. Tracks **Flow Health Score (FHS)** for ~95 launched AI agents using real-time BigQuery data from multiple sources.

## What it does

Yalo KPI Hub gives CS and product teams a single view of how every AI agent is performing in production:

- **FHS (Flow Health Score)**: A composite 0-100 score combining 5 components — Flow Effectiveness, UX Quality, Stability, Recovery, and Safety
- **Portfolio view**: All bots at a glance with status indicators, trends, and key module badges
- **Bot drill-down**: Detailed breakdown per bot with radar charts, error diagnostics, data source transparency, and module complexity context
- **Data Gaps detection**: Automatically identifies bots missing expected data sources
- **Trilingual**: Full ES / EN / PT support

### Data sources

| Source | What it provides | BigQuery table |
|--------|-----------------|----------------|
| **ORIS** | 9 LangSmith evaluators (intent, frustration, errors, safety...) | `DWH2_STAGE.st_genai_langsmith_feedbacks` |
| **CIE** | 6 conversational intelligence metrics (closure, resolution, efficiency...) | `conversational_insights.v_cross_metric_scorecard` |
| **Flowbuilder** | Session-level ops metrics (latency, error-free, recovery, fallback) | `DWH_STAGE.Flowbuilder_healthy_metrics` |
| **Flowbuilder Errors** | Per-bot error inventory with classification and severity | `DWH_STAGE.fhs_flowbuilder_errors` |
| **Custom Agents** | 9 CA-specific evaluators from LangSmith `Custom Agents` workspace | Same LangSmith tables, filtered by workspace |
| **Account Features** | 34 boolean module flags per bot (complexity, capabilities) | `DWH_STAGE.fhs_account_features` |

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Wouter |
| Backend | Node.js, Express 5, TypeScript (ESM) |
| Database | PostgreSQL (Drizzle ORM) |
| Data warehouse | Google BigQuery |
| Auth | Google OAuth 2.0 (restricted to `@yalo.com` / `@yalocontractor.com`) |
| Deployment | Replit Deployments |

## Project structure

```
client/src/
  App.tsx              # Full frontend: dashboard, drill-down, portfolio table
  bot-context.ts       # Bot knowledge base (95 bots, all batches)
  i18n.ts              # Translations ES/EN/PT
  components/          # Reusable UI components (shadcn/ui)
  hooks/               # Custom React hooks
  pages/               # Route pages
  lib/                 # Utilities, query client

server/
  index.ts             # Server entry point
  routes.ts            # API route handlers
  bigquery.ts          # All BigQuery queries, FHS calculation, CA blending
  storage.ts           # Database operations (IStorage interface)
  db.ts                # Database connection
  replit_integrations/
    auth/              # Google OAuth configuration

shared/
  schema.ts            # Drizzle database schema (projects, tasks, users)
  routes.ts            # API contract definitions with Zod validation
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session signing secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `SERVICE_ACCOUNT_MAURY` | Yes | Google Cloud service account JSON for BigQuery |

## Local development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start dev server (Express + Vite HMR)
npm run dev
```

The app runs on port 5000 with Vite proxying the frontend through Express.

## FHS formula

```
FHS = 0.30 x A + 0.30 x B + 0.20 x C + 0.15 x D + 0.05 x E
```

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| **A** - Flow Effectiveness | 30% | Closure rate + Resolution rate |
| **B** - UX & Flow Quality | 30% | Efficiency, Clarity, Fallback quality, Friction |
| **C** - Stability & Reliability | 20% | Error-free rate, Latency, Error load (dynamic weights) |
| **D** - Recovery & Resilience | 15% | Fallback quality, Recovery success, Loop prevention |
| **E** - Safety | 5% | Domain safety, Toxicity detection |

**Thresholds**: >= 80 Healthy | 65-79 At Risk | < 65 Critical

## Security

- Google OAuth restricted to `@yalo.com` and `@yalocontractor.com` domains
- All `/api/*` endpoints require authentication
- Helmet security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting: 60 req/min general, 10 req/min for BigQuery endpoints
- Bot ID input validation (`/^[a-zA-Z0-9_-]+$/`, max 100 chars)
- Secure session cookies (`httpOnly`, `secure`, `sameSite: lax`)
- 1MB body size limit
- No internal error details exposed in 5xx responses

## License

MIT
