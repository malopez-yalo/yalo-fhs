# ETL Pipeline — FHS

Scripts Python que alimentan las tablas BigQuery que consume el dashboard FHS.

## Scripts

| Script | Qué hace | Cuándo correr |
|--------|----------|---------------|
| `fetch_and_upload_all.py` | Fetches errores de 91 bots via builder CLI → `fhs_flowbuilder_errors` | Diario (antes de las 11am) |
| `compute_fhs_daily.py` | Calcula FHS scores → `fhs_scores_history` | Diario (después del fetch) |
| `setup_fhs_history.py` | ✅ **YA CORRIÓ** — backfill 52 semanas. No volver a correr. | Una sola vez |
| `fetch_and_upload_features.py` | Carga módulos activos por cuenta desde knowledge JSONs | Cuando haya nuevos JSONs |
| `run_etl_daily.sh` | Orquestador: fetch + compute en secuencia | Cron o manual |

## Setup

```bash
# Dependencias
pip install -r requirements.txt

# Credenciales BigQuery
gcloud auth application-default login

# builder CLI (para fetch_and_upload_all.py)
builder login
```

## Correr manualmente

```bash
python3 fetch_and_upload_all.py   # ~5 min para 91 bots
python3 compute_fhs_daily.py      # ~30 seg
```

## Validación

```sql
-- Errores cargados hoy
SELECT fetched_date, COUNT(DISTINCT workflow) bots, COUNT(*) errores
FROM `commerce-sandbox.DWH_STAGE.fhs_flowbuilder_errors`
WHERE fetched_date = CURRENT_DATE() GROUP BY 1

-- FHS calculado esta semana
SELECT week_start, COUNT(*) bots, ROUND(AVG(fhs_score),1) avg_fhs
FROM `commerce-sandbox.DWH_STAGE.fhs_scores_history`
WHERE snapshot_date = CURRENT_DATE() GROUP BY 1 ORDER BY 1 DESC LIMIT 5
```

## Notas

- ⚠️ Lookback actual: `INTERVAL 2 WEEK`. Pendiente ajustar a `INTERVAL 1 WEEK` en producción.
- `fetch_and_upload_all.py` corre hoy en Mac local. Plan: migrar a Cloud Run.
- `compute_fhs_daily.py` es 100% SQL → puede moverse a BigQuery Scheduled Query.
