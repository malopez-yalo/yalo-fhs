#!/usr/bin/env python3
"""
fetch_and_upload_features.py
─────────────────────────────
Lee todos los *-knowledge.json de una carpeta y sube la matriz de módulos
por cuenta a BigQuery → commerce-sandbox.DWH_STAGE.fhs_account_features

Uso:
    python3 fetch_and_upload_features.py \
        --input ~/Documents/new-output-EBAgent/

Requisitos (correr una vez):
    pip3 install google-cloud-bigquery

Credenciales BQ:
    gcloud auth application-default login
"""

import json
import sys
import datetime
import argparse
from pathlib import Path

# ── Configuración ──────────────────────────────────────────────────────────────
BQ_TABLE   = "commerce-sandbox.DWH_STAGE.fhs_account_features"
BQ_PROJECT = "commerce-sandbox"

today     = datetime.date.today()
today_str = str(today)

# ── Definición de módulos/funcionalidades ──────────────────────────────────────
# Cada tupla: (nombre_display, bq_column, lambda de detección)

def _match_names(activities, keywords):
    for a in activities:
        name_lower = a.get("name", "").lower()
        if any(kw in name_lower for kw in keywords):
            return True
    return False

FEATURE_DEFS = [
    # ── Estructura ─────────────────────────────────────────────────────────────
    ("Entry Point",         "f_entry_point",
        lambda acts: any(a["purpose"] == "entry_point"    for a in acts)),
    ("Registro",            "f_registro",
        lambda acts: any(a["purpose"] == "registration"   for a in acts)),
    ("Autenticación",       "f_autenticacion",
        lambda acts: any(a["purpose"] == "authentication" for a in acts)),
    ("Catálogo",            "f_catalogo",
        lambda acts: any(a["purpose"] == "catalog"        for a in acts)),
    ("Pedidos",             "f_pedidos",
        lambda acts: any(a["purpose"] == "transaction"    for a in acts)),
    ("Métodos de Pago",     "f_metodos_pago",
        lambda acts: any(a["purpose"] == "payment"        for a in acts)),
    ("Soporte / FAQ",       "f_soporte",
        lambda acts: any(a["purpose"] == "support"        for a in acts)),
    ("Sales Desk",          "f_sales_desk",
        lambda acts: any(a["purpose"] == "sales_desk"     for a in acts)),

    # ── Transaccional ──────────────────────────────────────────────────────────
    ("One Chat Buy",        "f_one_chat_buy",
        lambda acts: _match_names(acts, ["one chat buy", "one_chat_buy", "onechatbuy",
                                         "compra rapida", "compra rápida"])),
    ("Carrusel ATC",        "f_carrusel_atc",
        lambda acts: _match_names(acts, ["carrusel atc", "carousel atc", "multi atc",
                                         "multiatc", "add to cart", "carrusel add"])),
    ("Webview / Cart",      "f_webview_cart",
        lambda acts: _match_names(acts, ["webview", "carrito", "web view", "cart link"])),
    ("Suggested Order",     "f_suggested_order",
        lambda acts: _match_names(acts, ["suggested order", "pedido sugerido",
                                         "suggested_order", "orden sugerida", "reorder"])),
    ("Order Reminder",      "f_order_reminder",
        lambda acts: _match_names(acts, ["order reminder", "recordatorio pedido",
                                         "reminder", "record pedido", "order_reminder"])),
    ("Boleto / Financiero", "f_boleto",
        lambda acts: _match_names(acts, ["boleto", "financiero", "financiera", "slip",
                                         "pago pendiente", "bank slip"])),

    # ── Fidelización ───────────────────────────────────────────────────────────
    ("Loyalty / Puntos",    "f_loyalty",
        lambda acts: _match_names(acts, ["loyalty", "puntos", "points", "fidelidad",
                                         "reward", "saldo puntos", "programa puntos"])),
    ("Cashback",            "f_cashback",
        lambda acts: _match_names(acts, ["cashback", "cash back", "devolución cashback"])),
    ("Cupones",             "f_cupones",
        lambda acts: _match_names(acts, ["cupon", "cupón", "coupon", "descuento código",
                                         "redeem", "canje cupon", "code promo", "coupons"])),
    ("Concurso / Sorteo",   "f_concurso",
        lambda acts: _match_names(acts, ["concurso", "sorteo", "contest", "juego",
                                         "trivia", "rifa"])),
    ("Promociones",         "f_promociones",
        lambda acts: _match_names(acts, ["promo", "promocion", "promoción",
                                         "oferta especial", "deal"])),

    # ── Agentes IA ─────────────────────────────────────────────────────────────
    ("Voice Agent",         "f_voice_agent",
        lambda acts: _match_names(acts, ["voice agent", "voice_agent", "agente voz",
                                         "voz ia", "voice ia", "audio agent"])),
    ("Knowledge Genie",     "f_knowledge_genie",
        lambda acts: _match_names(acts, ["knowledge genie", "knowledge_genie", "genie",
                                         "kb agent", "knowledge agent"])),
    ("Sales Agent AI",      "f_sales_agent_ai",
        lambda acts: _match_names(acts, ["sales agent", "oris r1", "oris p1",
                                         "agente ventas ia", "ai sales", "sales_agent", "oris"])),
    ("Yalo Force",          "f_yalo_force",
        lambda acts: _match_names(acts, ["yalo force", "yaloforce", "force agent",
                                         "yf agent"])),
    ("Smalltalk / AI Chat", "f_smalltalk",
        lambda acts: _match_names(acts, ["smalltalk", "small talk", "chit-chat",
                                         "chitchat", "helper ai", "asistente ia"])),

    # ── Perfil / Captación ─────────────────────────────────────────────────────
    ("Perfilador",          "f_perfilador",
        lambda acts: _match_names(acts, ["perfilador", "perfil cliente", "profiling",
                                         "segmentacion", "segmentación", "onboarding perfil"])),
    ("Subscribe / Unsub",   "f_subscribe",
        lambda acts: _match_names(acts, ["subscribe", "unsubscribe", "suscribir",
                                         "suscripcion", "suscripción", "unsub", "desuscrib"])),
    ("Opt-In / Opt-Out",    "f_optin",
        lambda acts: _match_names(acts, ["opt-in", "optin", "opt in",
                                         "opt-out", "optout", "opt out"])),
    ("T&C / TyC",           "f_tyc",
        lambda acts: _match_names(acts, ["tyc", "t&c", "terminos",
                                         "términos y condiciones", "terms and", "terms & cond"])),

    # ── Feedback ───────────────────────────────────────────────────────────────
    ("CSAT",                "f_csat",
        lambda acts: _match_names(acts, ["csat"])),
    ("NPS",                 "f_nps",
        lambda acts: _match_names(acts, ["nps"])),
    ("Encuesta / Survey",   "f_encuesta",
        lambda acts: _match_names(acts, ["encuesta", "survey", "feedback form",
                                         "satisfaccion", "satisfacción", "cuestionario"])),

    # ── Atención humana ────────────────────────────────────────────────────────
    ("Live Agent",          "f_live_agent",
        lambda acts: _match_names(acts, ["frontapp", "live agent", "human handoff",
                                         "agente humano", "handoff", "human agent",
                                         "escalation", "derivacion", "derivación"])),
    ("Business Hours",      "f_business_hours",
        lambda acts: _match_names(acts, ["business hour", "horario", "business_hour",
                                         "fuera de horario", "horario atencion",
                                         "horario atención"])),

    # ── Outbound ───────────────────────────────────────────────────────────────
    ("Campaigns / Notif.",  "f_campaigns",
        lambda acts: _match_names(acts, ["campaign", "notification", "notificacion",
                                         "notificación", "outbound", "broadcast",
                                         "masivo", "push notif"])),
]

FEATURE_COLUMNS = [col for _, col, _ in FEATURE_DEFS]

# ── Extracción de datos del knowledge.json ─────────────────────────────────────

def extract_features(json_path: Path) -> dict:
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    builder    = data.get("builder", {})
    activities = builder.get("activities", [])
    webhooks   = builder.get("webhooks", [])
    summary    = builder.get("summary", {})

    # Módulos activos (count) para el campo module_count
    features = {}
    for _, col, fn in FEATURE_DEFS:
        features[col] = fn(activities)

    module_count = sum(1 for v in features.values() if v)

    # Propósitos únicos presentes en el flujo
    purposes = sorted(set(
        a.get("purpose", "") for a in activities if a.get("purpose")
    ))

    row = {
        "account_id":        data.get("account_id",
                                      json_path.stem.replace("-knowledge", "")),
        "workflow_name":     builder.get("workflow_name", ""),
        "generated_at":      data.get("generated_at", ""),
        "fetched_date":      today_str,
        "total_activities":  summary.get("total_activities", len(activities)),
        "agent_count":       summary.get("by_category", {}).get("agentic", 0),
        "webhook_count":     len(webhooks),
        "flow_type":         summary.get("flow_type", ""),
        "purposes":          "|".join(purposes),
        "module_count":      module_count,
    }
    row.update(features)
    return row


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Sube la matriz de módulos de knowledge JSONs a BigQuery"
    )
    parser.add_argument(
        "--input",
        default="~/Documents/new-output-EBAgent/",
        help="Carpeta con los *-knowledge.json"
    )
    args = parser.parse_args()

    input_dir = Path(args.input).expanduser()
    json_files = sorted(input_dir.glob("*-knowledge.json"))

    if not json_files:
        print(f"❌  No se encontraron *-knowledge.json en: {input_dir}")
        sys.exit(1)

    print(f"📦  {len(json_files)} knowledge JSONs encontrados en {input_dir}")

    # Importar BQ
    try:
        from google.cloud import bigquery
        client = bigquery.Client(project=BQ_PROJECT)
    except ImportError:
        print("❌  Instala: pip3 install google-cloud-bigquery")
        sys.exit(1)

    # Procesar cada JSON
    rows        = []
    ok_accounts = []
    failed      = []

    for jf in json_files:
        try:
            row = extract_features(jf)
            rows.append(row)
            ok_accounts.append(row["account_id"])
            n_mods = row["module_count"]
            print(f"  ✓ {row['account_id']}  ({n_mods} módulos activos)")
        except Exception as e:
            failed.append((jf.name, str(e)))
            print(f"  ⚠️  Error en {jf.name}: {e}")

    if not rows:
        print("⚪  No hay filas que subir.")
        sys.exit(0)

    # Crear tabla si no existe
    from google.cloud.bigquery import SchemaField, Table
    from google.api_core.exceptions import NotFound

    schema = [
        SchemaField("account_id",       "STRING",    mode="REQUIRED"),
        SchemaField("workflow_name",     "STRING"),
        SchemaField("generated_at",      "STRING"),
        SchemaField("fetched_date",      "DATE",      mode="REQUIRED"),
        SchemaField("total_activities",  "INT64"),
        SchemaField("agent_count",       "INT64"),
        SchemaField("webhook_count",     "INT64"),
        SchemaField("flow_type",         "STRING"),
        SchemaField("purposes",          "STRING"),
        SchemaField("module_count",      "INT64"),
        # ── Módulos (booleanos) ──────────────────────────────────────────────
        SchemaField("f_entry_point",     "BOOL"),
        SchemaField("f_registro",        "BOOL"),
        SchemaField("f_autenticacion",   "BOOL"),
        SchemaField("f_catalogo",        "BOOL"),
        SchemaField("f_pedidos",         "BOOL"),
        SchemaField("f_metodos_pago",    "BOOL"),
        SchemaField("f_soporte",         "BOOL"),
        SchemaField("f_sales_desk",      "BOOL"),
        SchemaField("f_one_chat_buy",    "BOOL"),
        SchemaField("f_carrusel_atc",    "BOOL"),
        SchemaField("f_webview_cart",    "BOOL"),
        SchemaField("f_suggested_order", "BOOL"),
        SchemaField("f_order_reminder",  "BOOL"),
        SchemaField("f_boleto",          "BOOL"),
        SchemaField("f_loyalty",         "BOOL"),
        SchemaField("f_cashback",        "BOOL"),
        SchemaField("f_cupones",         "BOOL"),
        SchemaField("f_concurso",        "BOOL"),
        SchemaField("f_promociones",     "BOOL"),
        SchemaField("f_voice_agent",     "BOOL"),
        SchemaField("f_knowledge_genie", "BOOL"),
        SchemaField("f_sales_agent_ai",  "BOOL"),
        SchemaField("f_yalo_force",      "BOOL"),
        SchemaField("f_smalltalk",       "BOOL"),
        SchemaField("f_perfilador",      "BOOL"),
        SchemaField("f_subscribe",       "BOOL"),
        SchemaField("f_optin",           "BOOL"),
        SchemaField("f_tyc",             "BOOL"),
        SchemaField("f_csat",            "BOOL"),
        SchemaField("f_nps",             "BOOL"),
        SchemaField("f_encuesta",        "BOOL"),
        SchemaField("f_live_agent",      "BOOL"),
        SchemaField("f_business_hours",  "BOOL"),
        SchemaField("f_campaigns",       "BOOL"),
    ]

    table_ref = client.dataset("DWH_STAGE", project="commerce-sandbox").table("fhs_account_features")
    try:
        client.get_table(table_ref)
        print("📋  Tabla ya existe — insertando filas...")
    except NotFound:
        print("🆕  Tabla no encontrada — creando fhs_account_features ...")
        table = Table(table_ref, schema=schema)
        client.create_table(table)
        print("✅  Tabla creada.")

    # Upload a BigQuery
    print(f"\n{'─'*60}")
    print(f"⬆️  Subiendo {len(rows)} cuentas a BigQuery ({BQ_TABLE}) ...")

    bq_errors = client.insert_rows_json(BQ_TABLE, rows)
    if bq_errors:
        print(f"❌  Errores en BQ insert:")
        for e in bq_errors[:5]:
            print(f"   {e}")
        sys.exit(1)
    else:
        print(f"✅  ¡Listo! {len(rows)} filas insertadas.")

    # Resumen
    print(f"\n{'═'*60}")
    print(f"📊  RESUMEN — {today_str}")
    print(f"    ✅ Procesados : {len(ok_accounts)} cuentas")
    print(f"    ❌ Fallidos   : {len(failed)}")
    if failed:
        for name, msg in failed:
            print(f"       • {name}: {msg}")

    print(f"""
💡 Verifica en BigQuery:
   SELECT account_id, module_count, f_sales_agent_ai, f_live_agent, f_suggested_order
   FROM `{BQ_TABLE}`
   WHERE fetched_date = '{today_str}'
   ORDER BY module_count DESC

💡 Cruzar con FHS (ejemplo):
   SELECT f.account_id, f.module_count, e.fhs_score
   FROM `{BQ_TABLE}` f
   JOIN `commerce-sandbox.DWH_STAGE.fhs_scores` e
     ON f.account_id = e.account_id
   WHERE f.fetched_date = '{today_str}'
     AND f.f_suggested_order = TRUE
   ORDER BY e.fhs_score ASC
""")


if __name__ == "__main__":
    main()
