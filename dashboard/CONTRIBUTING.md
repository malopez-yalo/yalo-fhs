# Contributing

## Getting started

1. Clone the repository
2. Copy the required environment variables (see README.md)
3. Run `npm install`
4. Run `npm run db:push` to sync the database schema
5. Run `npm run dev` to start the development server

## Code conventions

- TypeScript strict mode across frontend and backend
- ESM modules (`"type": "module"` in package.json)
- Shared types between client and server live in `shared/`
- Database schema changes go in `shared/schema.ts` using Drizzle ORM
- API contracts are defined in `shared/routes.ts` with Zod validation
- Frontend uses shadcn/ui components with Tailwind CSS
- No emoji in the UI — use lucide-react icons or text labels

## Branch workflow

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `npm run dev`
4. Run `npm run check` for TypeScript validation
5. Open a pull request against `main`

## Architecture decisions

- **BigQuery queries** are in `server/bigquery.ts`. Each data source (ORIS, CIE, Flowbuilder, CA) has its own fetch function
- **FHS calculation** (`calculateFHS`) is server-side only and uses the official v4 formula with P1-P10 patches
- **Bot knowledge base** (`client/src/bot-context.ts`) is a static lookup of all 95 bots with their metadata
- **Translations** (`client/src/i18n.ts`) must include all three languages (ES, EN, PT) for any new string

## Adding a new data source

1. Add the BigQuery fetch function in `server/bigquery.ts`
2. Wire it into `fetchFHSByBots` or `fetchLangSmithMetrics`
3. Update `calculateFHS` if the new source affects FHS scoring
4. Update the `SubComponent.source` type in `shared/routes.ts`
5. Add frontend labels in `client/src/i18n.ts` (all 3 languages)
6. Update `replit.md` with the new data source documentation
