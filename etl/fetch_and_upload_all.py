#!/usr/bin/env python3
"""
ETL masivo: fetches errores de TODOS los bots via builder CLI y los sube a BigQuery.
Uso: python3 fetch_and_upload_all.py

Requisitos (correr una vez):
    pip3 install google-cloud-bigquery

Credenciales BQ:
    gcloud auth application-default login
"""

import json, sys, subprocess, datetime
from pathlib import Path

# ── Configuración ──────────────────────────────────────────────────────────────
BQ_TABLE    = "commerce-sandbox.DWH_STAGE.fhs_flowbuilder_errors"
BQ_AUDIT    = "commerce-sandbox.DWH_STAGE.fhs_etl_audit_log"
BQ_PROJECT  = "commerce-sandbox"
CSV_FILE    = Path(__file__).parent / "bots_list.csv"
SKIP_BOTS   = set()   # sin exclusiones — el run diario procesa todos los bots
PAGE_SIZE   = 500                         # suficiente para capturar todos los errores en 1 req

today       = datetime.date.today()
week_start  = today - datetime.timedelta(days=today.weekday())
today_str   = str(today)

# ── Clasificación v2 (Mar 2026) ────────────────────────────────────────────────
# Basada en 20 tipos reales de 79 bots (259k HTTP · 51k Lua · 17k WA · 4k Agent)
DIAG_MAP = {
    "HTTP_CLIENT":   ("Payload incorrecto o endpoint mal configurado",
                      "Revisar URL y estructura del request en el paso {step} en YaloStudio"),
    "HTTP_TIMEOUT":  ("Servicio externo lento o sin respuesta",
                      "Agregar retry logic o aumentar timeout en el paso {step}"),
    "HTTP_SERVER":   ("Error del servidor o proveedor externo",
                      "Monitorear; contactar al proveedor si persiste (paso {step})"),
    "LUA_NIL":       ("Variable nula no validada antes de usar",
                      "Agregar validación if var ~= nil then antes del decode en el paso {step}"),
    "LUA_LOGIC":     ("Error de lógica en script Lua",
                      "Revisar lógica del step y agregar manejo de errores en el paso {step}"),
    "WA_MESSAGE":    ("Error en envío o configuración de mensaje WhatsApp",
                      "Verificar plantilla y configuración WA en el paso {step}"),
    "AGENT_ML_GAI":  ("Falla en agente IA (ML GAI o Custom Agent)",
                      "Revisar logs del agente y prompt del paso {step}"),
    "AGENT_STEP":    ("Falla genérica en Agent Step",
                      "Revisar configuración del Agent Step en el paso {step}"),
    "INTEGRATION":   ("Error en integración externa",
                      "Verificar disponibilidad del servicio externo en el paso {step}"),
}

# Tipos que mapean a INTEGRATION
_INTEGRATION_TYPES = {
    "Cloud Function Error",
    "Error requesting cloud function",
    "Salesdesk",
    "CDP Service Error",
    "Contact Register CDP Error",
    "OrisVoice Step: Create Call",
    "OrisVoice Step: Get Agent",
    "Knowledge Genie API Error",
}

def classify_error(e):
    type_ = e["type"]
    msg   = e["message"].lower()
    step  = e.get("step", "?")

    # ── Categoría ──────────────────────────────────────────────────────────
    if type_ in ("HTTP Request Error",
                 "Notification step: HTTP Request Error sending a notification"):
        code = 0
        for tok in e["message"].split():
            if tok.isdigit() and 400 <= int(tok) < 600:
                code = int(tok); break
        if code in (502, 504, 408):   category = "HTTP_TIMEOUT"
        elif 400 <= code < 500:       category = "HTTP_CLIENT"
        else:                         category = "HTTP_SERVER"

    elif type_ in ("HTTP Request Configuration/Timeout", "500"):
        category = "HTTP_TIMEOUT" if "timeout" in msg else "HTTP_SERVER"

    elif type_ in ("Lua Execution Error", "User/Flow Loop Detected"):
        category = "LUA_NIL" if ("nil" in msg or "json" in msg) else "LUA_LOGIC"

    elif type_ in ("WA Message Error",
                   "Whatsapp Flow Config Error",
                   "Whatsapp Flow Meta Error"):
        category = "WA_MESSAGE"

    elif type_ in ("Agent Step: ML GAI", "Custom Agent: Error"):
        category = "AGENT_ML_GAI"

    elif type_ == "Agent Step":
        category = "AGENT_STEP"

    elif type_ in _INTEGRATION_TYPES:
        category = "INTEGRATION"

    else:
        # Fallback para tipos nuevos no mapeados todavía
        category = "LUA_LOGIC"

    # ── Severidad (v2) ──────────────────────────────────────────────────────
    # URGENTE   = nuevo esta semana + no visto  → acción inmediata
    # ATENCION  = crónico + no visto            → deuda técnica ignorada
    # PENDIENTE = nuevo esta semana + ya visto  → equipo al tanto
    # CRONICO   = crónico + ya visto            → conocido y monitoreado
    first  = datetime.date.fromisoformat(e["firstOccurrenceAt"][:10])
    is_new = first >= week_start
    seen   = e.get("seen", False)
    if   is_new and not seen:      severity = "URGENTE"
    elif not is_new and not seen:  severity = "ATENCION"
    elif is_new and seen:          severity = "PENDIENTE"
    else:                          severity = "CRONICO"

    diag_tmpl, rec_tmpl = DIAG_MAP[category]
    diagnosis      = diag_tmpl
    recommendation = rec_tmpl.format(step=step)

    # Flag de alto volumen: ≥ 100 ocurrencias históricas
    occurrences = e.get("occurrences", 0)
    if occurrences >= 100:
        recommendation = f"⚡ {occurrences} ocurrencias — {recommendation}"

    return category, severity, diagnosis, recommendation

# ── Fetch de errores vía builder CLI ──────────────────────────────────────────
def fetch_errors(workflow_name):
    cmd = [
        "builder", "errors", "fetch",
        f"--workflow-name={workflow_name}",
        f"--page-size={PAGE_SIZE}",
        "--json"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None, f"builder error: {result.stderr.strip()[:200]}"
    try:
        raw = json.loads(result.stdout)
        errors = raw["errors"] if isinstance(raw, dict) and "errors" in raw else raw
        return errors, None
    except Exception as ex:
        return None, f"JSON parse error: {ex}"

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    # Leer lista de bots
    with open(CSV_FILE) as f:
        bots = [line.strip() for line in f if line.strip()]

    bots_to_process = [b for b in bots if b not in SKIP_BOTS]
    print(f"📋 {len(bots)} bots en el CSV → procesando {len(bots_to_process)} (skip: {len(SKIP_BOTS)})")

    # Importar BQ
    try:
        from google.cloud import bigquery
        client = bigquery.Client(project=BQ_PROJECT)
    except ImportError:
        print("❌ Instala: pip3 install google-cloud-bigquery")
        sys.exit(1)

    # Procesar cada bot
    all_rows    = []
    audit_rows  = []
    ok_bots     = []
    empty_bots  = []
    failed_bots = []

    for i, bot in enumerate(bots_to_process, 1):
        print(f"\n[{i:02d}/{len(bots_to_process)}] {bot} ...", end=" ", flush=True)
        errors, err_msg = fetch_errors(bot)

        if err_msg:
            print(f"❌ {err_msg}")
            failed_bots.append((bot, err_msg))
            audit_rows.append({
                "workflow":      bot,
                "fetched_date":  today_str,
                "status":        "fetch_failed",
                "error_count":   0,
                "error_message": err_msg[:500],
            })
            continue

        if not errors:
            print("⚪ sin errores")
            empty_bots.append(bot)
            audit_rows.append({
                "workflow":      bot,
                "fetched_date":  today_str,
                "status":        "no_errors",
                "error_count":   0,
                "error_message": None,
            })
            continue

        rows = []
        for e in errors:
            try:
                cat, sev, diag, rec = classify_error(e)
                rows.append({
                    "workflow":           e["workflow"],
                    "errorId":            e["errorId"],
                    "step":               e.get("step", ""),
                    "type":               e["type"],
                    "seen":               e.get("seen", False),
                    "message":            e["message"],
                    "occurrences":        e.get("occurrences", 0),
                    "firstOccurrenceAt":  e["firstOccurrenceAt"],
                    "lastOccurrenceAt":   e["lastOccurrenceAt"],
                    "fetched_date":       today_str,
                    "category":           cat,
                    "severity":           sev,
                    "diagnosis":          diag,
                    "recommended_action": rec,
                })
            except Exception as ex:
                print(f"\n  ⚠️  Error clasificando {e.get('errorId','?')}: {ex}")

        print(f"✅ {len(rows)} errores")
        all_rows.extend(rows)
        ok_bots.append((bot, len(rows)))
        audit_rows.append({
            "workflow":      bot,
            "fetched_date":  today_str,
            "status":        "success",
            "error_count":   len(rows),
            "error_message": None,
        })

    # Upload a BQ
    print(f"\n{'─'*60}")
    print(f"⬆️  Subiendo {len(all_rows)} filas a BigQuery ...")

    if all_rows:
        bq_errors = client.insert_rows_json(BQ_TABLE, all_rows)
        if bq_errors:
            print(f"❌ Errores en BQ insert:")
            for e in bq_errors[:5]:
                print(f"   {e}")
            sys.exit(1)
        else:
            print(f"✅ ¡Listo! {len(all_rows)} filas insertadas.")
    else:
        print("⚪ No hay filas que subir.")

    # Upload audit log
    print(f"📋 Subiendo audit log ({len(audit_rows)} registros) ...")
    audit_errors = client.insert_rows_json(BQ_AUDIT, audit_rows)
    if audit_errors:
        print(f"⚠️  Audit log con errores: {audit_errors[:2]}")
    else:
        print(f"✅ Audit log guardado.")

    # Resumen
    print(f"\n{'═'*60}")
    print(f"📊 RESUMEN — {today_str}")
    print(f"   ✅ Con errores   : {len(ok_bots)} bots ({sum(n for _,n in ok_bots)} errores)")
    print(f"   ⚪ Sin errores   : {len(empty_bots)} bots")
    print(f"   ❌ Fallidos      : {len(failed_bots)} bots")

    if failed_bots:
        print(f"\n   Bots con fallo:")
        for bot, msg in failed_bots:
            print(f"     • {bot}: {msg}")

    print(f"\n💡 Verifica en BigQuery:")
    print(f"   SELECT workflow, COUNT(*) as errores")
    print(f"   FROM `{BQ_TABLE}`")
    print(f"   WHERE fetched_date = '{today_str}'")
    print(f"   GROUP BY 1 ORDER BY 2 DESC")


if __name__ == "__main__":
    main()
