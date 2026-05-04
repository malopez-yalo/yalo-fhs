#!/bin/bash
# ──────────────────────────────────────────────────────────
# ETL diario FHS — corre automáticamente vía crontab en tu Mac
#   1. Sube errores Flowbuilder → fhs_flowbuilder_errors
#   2. Calcula FHS scores de la semana → fhs_scores_history
# ──────────────────────────────────────────────────────────
FHS_DIR="/Users/maria.lopez@yalo.com/Desktop/FHS"
LOG="$FHS_DIR/etl_log.txt"
PYTHON="/usr/local/bin/python3"

echo "" >> "$LOG"
echo "===== $(date '+%Y-%m-%d %H:%M:%S') =====" >> "$LOG"

# ── Paso 1: Errores Flowbuilder → BigQuery ────────────────
echo "--- [1/2] Subiendo errores Flowbuilder..." >> "$LOG"
"$PYTHON" "$FHS_DIR/fetch_and_upload_all.py" >> "$LOG" 2>&1
echo "--- [1/2] Listo." >> "$LOG"

# ── Paso 2: Calcular FHS scores → fhs_scores_history ─────
echo "--- [2/2] Calculando FHS scores semanales..." >> "$LOG"
"$PYTHON" "$FHS_DIR/compute_fhs_daily.py" >> "$LOG" 2>&1
echo "--- [2/2] Listo." >> "$LOG"

echo "===== ETL completado $(date '+%H:%M:%S') =====" >> "$LOG"
