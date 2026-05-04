# Yalo FHS — Flow Health Score

Sistema completo para calcular y visualizar el **Flow Health Score (FHS)** de los bots de producción de Yalo.

📊 **Dashboard:** [yaloflowskpidata.replit.app](https://yaloflowskpidata.replit.app/)  
📖 **Documentación:** [Notion — FHS Complete Documentation](https://www.notion.so/yalo/Flow-Health-Score-FHS-Complete-Documentation-31ed53382b2380fb9a9fd518af6e3103)

---

## Estructura del repo

```
yalo-fhs/
├── etl/                          ← Pipeline de datos (Python)
│   ├── fetch_and_upload_all.py   # Fetches errores de 91 bots → BigQuery
│   ├── compute_fhs_daily.py      # Calcula FHS semanal → fhs_scores_history
│   ├── setup_fhs_history.py      # Backfill histórico (ya corrió ✅)
│   ├── fetch_and_upload_features.py  # Módulos por cuenta
│   ├── run_etl_daily.sh          # Orquestador: corre los scripts en orden
│   ├── bots_list.csv             # 91 bots activos
│   └── requirements.txt
│
└── dashboard/                    ← App web (React + Node.js — Replit)
    ├── client/src/               # Frontend: React 18, TypeScript, Tailwind
    ├── server/                   # Backend: Express 5, BigQuery queries, FHS calc
    ├── shared/                   # Tipos compartidos, schema, rutas
    ├── .env.example              # Variables de entorno requeridas
    ├── README.md                 # Docs del dashboard
    └── CONTRIBUTING.md
```

---

## Cómo funciona

```
[builder CLI] → etl/fetch_and_upload_all.py
                        ↓ INSERT
              [BQ: fhs_flowbuilder_errors]
                        ↓
              etl/compute_fhs_daily.py → [BQ: fhs_scores_history]
                                                  ↓
                              dashboard/server/bigquery.ts (lee BQ)
                                                  ↓
                              dashboard/client/ (React — visualiza)
```

El **ETL** alimenta las tablas en BigQuery. El **dashboard** las lee y renderiza.

---

## ETL Pipeline (Python)

Requiere `builder` CLI autenticado y credenciales BigQuery.

```bash
cd etl/
pip install -r requirements.txt

# Paso 1 — Fetch errores de todos los bots
python3 fetch_and_upload_all.py

# Paso 2 — Calcular FHS scores de la semana
python3 compute_fhs_daily.py

# O los dos juntos
bash run_etl_daily.sh
```

> ⚠️ `setup_fhs_history.py` ya corrió (backfill de 52 semanas, abril 2026). **No volver a correr.**

> ⚠️ Lookback actual: `INTERVAL 2 WEEK` (~15 días). Pendiente ajustar a `INTERVAL 1 WEEK` en producción.

Ver [etl/README](etl/README.md) para documentación completa del pipeline.

---

## Dashboard (React + Node.js)

```bash
cd dashboard/
npm install
npm run db:push   # sync PostgreSQL schema
npm run dev       # inicia en localhost:5000
```

Variables de entorno requeridas (ver `dashboard/.env.example`):
- `DATABASE_URL` — PostgreSQL
- `SESSION_SECRET` — signing de sesiones
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth @yalo.com
- `SERVICE_ACCOUNT_MAURY` — Service account JSON para BigQuery

Ver [dashboard/README](dashboard/README.md) para documentación completa del dashboard.

---

## Fórmula FHS

```
FHS = 0.30 × A  (Flow Effectiveness — resolución y cierre)
    + 0.30 × B  (UX & Flow Quality — claridad, fricción, loops)
    + 0.20 × C  (Stability & Reliability — errores, latencia)
    + 0.15 × D  (Recovery & Resilience — recuperación, fallback)
    + 0.05 × E  (Safety)
```

| Score | Status |
|-------|--------|
| ≥ 80 | 🟢 SALUDABLE |
| 65–79 | 🟡 EN_RIESGO |
| < 65 | 🔴 CRITICO |

---

## Tablas BigQuery

| Tabla | Proyecto | Escrita por |
|-------|---------|-------------|
| `fhs_flowbuilder_errors` | `commerce-sandbox.DWH_STAGE` | ETL Python |
| `fhs_etl_audit_log` | `commerce-sandbox.DWH_STAGE` | ETL Python |
| `fhs_scores_history` | `commerce-sandbox.DWH_STAGE` | ETL Python |
| `fhs_account_features` | `commerce-sandbox.DWH_STAGE` | ETL Python |
| `fhs_s1_incidents` | `commerce-sandbox.DWH_STAGE` | Manual |
| `fhs_oris_inputs` | `commerce-sandbox.DWH_STAGE` | Vista BQ |

---

## Pendientes (mayo 2026)

- [ ] Ajustar lookback de evals a `INTERVAL 1 WEEK` en `compute_fhs_daily.py`
- [ ] Migrar `compute_fhs_daily.py` a BigQuery Scheduled Query
- [ ] Migrar `fetch_and_upload_all.py` a Cloud Run (hoy corre en Mac local)
- [ ] Pedir acceso `bigquery.jobs.create` a Gera en `dev-data-mlops`

---

## Licencia

MIT — ver [LICENSE](LICENSE)
