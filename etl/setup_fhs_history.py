#!/usr/bin/env python3
"""
setup_fhs_history.py — Corre UNA SOLA VEZ para:
  1. Crear la tabla fhs_scores_history en BigQuery
  2. Hacer el backfill con el histórico disponible (hasta 52 semanas atrás)

Uso:
  python3 setup_fhs_history.py

Requisito: gcloud auth application-default login (ya hecho si corriste el ETL antes)
"""

from google.cloud import bigquery

PROJECT   = "commerce-sandbox"
DATASET   = "DWH_STAGE"
TABLE     = "fhs_scores_history"
FULL_TABLE = f"`{PROJECT}.{DATASET}.{TABLE}`"

client = bigquery.Client(project=PROJECT)

# ─── 1. Crear tabla si no existe ──────────────────────────────────────────────
DDL = f"""
CREATE TABLE IF NOT EXISTS {FULL_TABLE} (
  bot_id              STRING    NOT NULL,
  week_start          DATE      NOT NULL,
  fhs_score           FLOAT64,
  fhs_status          STRING,
  score_a             FLOAT64,
  score_b             FLOAT64,
  score_c             FLOAT64,
  score_d             FLOAT64,
  score_e             FLOAT64,
  latency_score       FLOAT64,
  error_load_score    FLOAT64,
  active_errors       INT64,
  total_runs          INT64,
  total_conversations INT64,
  has_oris_data       BOOL,
  s1_active           BOOL,
  snapshot_date       DATE      NOT NULL
)
PARTITION BY week_start
CLUSTER BY bot_id
"""

print("Creando tabla fhs_scores_history (si no existe)...")
client.query(DDL).result()
print("✅ Tabla lista.\n")

# ─── 2. Backfill: insertar histórico de 52 semanas ────────────────────────────
BACKFILL = f"""
INSERT INTO {FULL_TABLE}

WITH oris_inputs AS (
  SELECT * FROM `commerce-sandbox.DWH_STAGE.fhs_oris_inputs`
),

cie_inputs AS (
  SELECT
    workflow_name                                                                 AS bot_id,
    DATE_TRUNC(analysis_date, WEEK)                                              AS week_start,
    ROUND(AVG(CASE WHEN metric_name = 'closure'               THEN avg_score END) * 100, 2) AS closure_rate,
    ROUND(AVG(CASE WHEN metric_name = 'resolution'            THEN avg_score END) * 100, 2) AS resolution_rate_ux,
    ROUND(AVG(CASE WHEN metric_name = 'confusion_detection'   THEN avg_score END) * 100, 2) AS confusion_detection_score,
    ROUND(AVG(CASE WHEN metric_name = 'frustration_detection' THEN avg_score END) * 100, 2) AS frustration_ux_score,
    ROUND(AVG(CASE WHEN metric_name = 'efficiency'            THEN avg_score END) * 100, 2) AS efficiency_score,
    ROUND(AVG(CASE WHEN metric_name = 'loop_prevention'       THEN avg_score END) * 100, 2) AS loop_prevention_score,
    ROUND(AVG(CASE WHEN metric_name = 'proactive_anticipation' THEN avg_score END) * 100, 2) AS proactive_anticipation_score
  FROM `arched-photon-194421.conversational_insights.v_cross_metric_scorecard`
  WHERE analysis_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
  GROUP BY 1, 2
),

latency_inputs AS (
  SELECT
    bot_id,
    DATE_TRUNC(create_at, WEEK)           AS week_start,
    ROUND(AVG(p50_latency_sec), 2)        AS latency_avg_s
  FROM `commerce-sandbox.DWH_STAGE.Flowbuilder_healthy_metrics`
  WHERE create_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
    AND p50_latency_sec IS NOT NULL
  GROUP BY 1, 2
),

flowbuilder_inputs AS (
  SELECT
    bot_id,
    DATE_TRUNC(create_at, WEEK)                                             AS week_start,
    ROUND(SAFE_DIVIDE(SUM(sessions) - SUM(fallback_session), SUM(sessions)) * 100, 2) AS fb_fallback_quality,
    ROUND(SAFE_DIVIDE(SUM(errorFree_session), SUM(sessions)) * 100, 2)     AS fb_error_free_score,
    ROUND(COALESCE(SAFE_DIVIDE(SUM(recovery_session), SUM(block_session) + SUM(recovery_session)) * 100, 100.0), 2) AS fb_recovery_rate
  FROM `commerce-sandbox.DWH_STAGE.Flowbuilder_healthy_metrics`
  WHERE create_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
    AND sessions IS NOT NULL
  GROUP BY 1, 2
),

errors_inputs AS (
  SELECT
    e.workflow                                                              AS bot_id,
    DATE_TRUNC(w_start, WEEK)                                              AS week_start,
    COUNT(DISTINCT e.errorId)                                              AS active_errors,
    COUNTIF(e.seen = FALSE)                                                AS unseen_errors,
    GREATEST(0.0, 100.0 - COUNT(DISTINCT e.errorId) * 4.0 - COUNTIF(e.seen = FALSE) * 6.0) AS error_load_score
  FROM `commerce-sandbox.DWH_STAGE.fhs_flowbuilder_errors` e
  CROSS JOIN UNNEST(GENERATE_DATE_ARRAY(
    DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK),
    CURRENT_DATE(),
    INTERVAL 1 WEEK
  )) AS w_start
  CROSS JOIN (
    SELECT MAX(fetched_date) AS max_date
    FROM `commerce-sandbox.DWH_STAGE.fhs_flowbuilder_errors`
  ) ls
  WHERE e.fetched_date = ls.max_date
    AND e.firstOccurrenceAt <= TIMESTAMP(DATE_ADD(DATE_TRUNC(w_start, WEEK), INTERVAL 6 DAY))
    AND e.lastOccurrenceAt  >= TIMESTAMP(DATE_TRUNC(w_start, WEEK))
  GROUP BY 1, 2
),

s1_incidents AS (
  SELECT bot_id, week_start, TRUE AS s1_active
  FROM `commerce-sandbox.DWH_STAGE.fhs_s1_incidents`
  WHERE s1_active = TRUE
),

ca_evals_inputs AS (
  SELECT
    COALESCE(
      NULLIF(REPLACE(JSON_EXTRACT_SCALAR(r.extra, '$.metadata.workflow_name'), '"', ''), ''),
      REPLACE(JSON_EXTRACT_SCALAR(r.extra, '$.metadata.workflow'), '"', '')
    )                                                                       AS bot_id,
    DATE_TRUNC(DATE(f.created_at, 'America/Mexico_City'), WEEK)            AS week_start,
    -- A: negativo = 'not_fulfilled'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'user_intent_fulfillment_custom_agent' AND f.value != 'not_fulfilled'),
      NULLIF(COUNTIF(f.key = 'user_intent_fulfillment_custom_agent'), 0)) * 100, 2) AS ca_intent_fulfillment_rate,
    -- B: negativo = 'frustrated'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'user_frustration_custom_agent' AND f.value != 'frustrated'),
      NULLIF(COUNTIF(f.key = 'user_frustration_custom_agent'), 0)) * 100, 2)        AS ca_no_frustration_rate,
    -- B: negativo = 'misunderstood'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'misunderstanding_custom_agent' AND f.value != 'misunderstood'),
      NULLIF(COUNTIF(f.key = 'misunderstanding_custom_agent'), 0)) * 100, 2)        AS ca_no_misunderstanding_rate,
    -- B: negativo = 'not_relevant'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'relevance_custom_agent' AND f.value != 'not_relevant'),
      NULLIF(COUNTIF(f.key = 'relevance_custom_agent'), 0)) * 100, 2)              AS ca_relevance_rate,
    -- C: negativo = 'fallback'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'knowledge_fallback_custom_agent' AND f.value != 'fallback'),
      NULLIF(COUNTIF(f.key = 'knowledge_fallback_custom_agent'), 0)) * 100, 2)     AS ca_no_knowledge_fallback_rate,
    -- C: negativo = 'error_detected'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'assistant_error_custom_agent' AND f.value != 'error_detected'),
      NULLIF(COUNTIF(f.key = 'assistant_error_custom_agent'), 0)) * 100, 2)        AS ca_no_error_rate,
    -- D: negativo = 'apology_detected' (nuevo pipeline) o 'agent_apology' (histórico sin backfill)
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'agent_apology_custom_agent' AND f.value NOT IN ('apology_detected', 'agent_apology')),
      NULLIF(COUNTIF(f.key = 'agent_apology_custom_agent'), 0)) * 100, 2)          AS ca_no_apology_rate,
    -- E: negativo = 'out_of_scope'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'domain_safety_custom_agent' AND f.value != 'out_of_scope'),
      NULLIF(COUNTIF(f.key = 'domain_safety_custom_agent'), 0)) * 100, 2)          AS ca_domain_safety_rate,
    -- E: negativo = 'toxic_or_harmful'
    ROUND(SAFE_DIVIDE(COUNTIF(f.key = 'toxicity_and_harmfulness_custom_agent' AND f.value != 'toxic_or_harmful'),
      NULLIF(COUNTIF(f.key = 'toxicity_and_harmfulness_custom_agent'), 0)) * 100, 2) AS ca_no_toxicity_rate
  FROM `arched-photon-194421.DWH2_STAGE.st_genai_langsmith_feedbacks` f
  JOIN `arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs` r ON f.trace_id = r.trace_id
  WHERE f.key IN (
      'user_intent_fulfillment_custom_agent', 'user_frustration_custom_agent',
      'misunderstanding_custom_agent', 'relevance_custom_agent',
      'knowledge_fallback_custom_agent', 'assistant_error_custom_agent',
      'agent_apology_custom_agent', 'domain_safety_custom_agent',
      'toxicity_and_harmfulness_custom_agent'
    )
    AND r.langsmith_workspace_name = 'Custom Agents'
    AND r.langsmith_tracing_project_name = 'custom-agents-production'
    AND r.id = r.trace_id
    AND f.created_at >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK))
    AND r.start_time >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK))  -- partition filter en runs ✅
  GROUP BY 1, 2
),

-- ── Token costs desde LangSmith runs (backfill 52 semanas) ────────────────────
ca_costs_inputs AS (
  SELECT
    COALESCE(
      NULLIF(REPLACE(JSON_EXTRACT_SCALAR(r.extra, '$.metadata.workflow_name'), '"', ''), ''),
      REPLACE(JSON_EXTRACT_SCALAR(r.extra, '$.metadata.workflow'), '"', '')
    )                                                                       AS bot_id,
    DATE_TRUNC(DATE(r.start_time), WEEK)                                   AS week_start,
    ROUND(SUM(r.total_cost), 4)                                            AS total_cost_usd,
    COUNT(DISTINCT r.trace_id)                                             AS ca_cost_conversations,
    ROUND(SAFE_DIVIDE(SUM(r.total_cost),
      NULLIF(COUNT(DISTINCT r.trace_id), 0)), 6)                           AS avg_cost_per_conv_usd,
    ROUND(SAFE_DIVIDE(SUM(r.total_tokens),
      NULLIF(COUNT(DISTINCT r.trace_id), 0)), 0)                           AS avg_tokens_per_conv,
    ROUND(SAFE_DIVIDE(
      SUM(CAST(JSON_VALUE(r.prompt_token_details, '$.cache_read') AS INT64)),
      NULLIF(SUM(r.prompt_tokens), 0)
    ), 4)                                                                  AS cache_hit_rate
  FROM `arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs` r
  WHERE r.start_time >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK))
    AND r.langsmith_workspace_name IN ('Oris', 'Custom Agents')
    AND r.langsmith_tracing_project_name IN (
        'ml-gai-service-production',
        'custom-agents-production'
    )
    AND r.run_type IN ('chain', 'llm')
  GROUP BY 1, 2
),

ca_sessions_inputs AS (
  SELECT
    flow_name                                                               AS bot_id,
    DATE_TRUNC(created_date, WEEK)                                         AS week_start,
    COUNT(DISTINCT session_id)                                             AS ca_total_sessions,
    ROUND((1.0 - SAFE_DIVIDE(
      COUNT(DISTINCT CASE WHEN human_transition THEN session_id END),
      NULLIF(COUNT(DISTINCT session_id), 0)
    )) * 100, 2)                                                           AS ca_human_containment_rate,
    ROUND(AVG(CASE WHEN activation_number = 1 THEN duration / 1000.0 END), 2) AS ca_first_response_sec
  FROM `arched-photon-194421.DWH2.custom_agents_fct_sequential`
  WHERE is_fake_user_flag = FALSE
    AND created_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
  GROUP BY 1, 2
),

-- P11: User Behavior — self-loop rate signal (Component B / Loop Prevention)
fb_transitions_inputs AS (
  SELECT
    bot_id,
    DATE_TRUNC(DATE(timestamp), WEEK)                                       AS week_start,
    ROUND(SAFE_DIVIDE(COUNTIF(current_state_name != last_state_name), NULLIF(COUNT(*), 0)) * 100, 2) AS fb_no_loop_rate
  FROM `arched-photon-194421.DWH2.flowbuilder_fct_user_transitions`
  WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
  GROUP BY 1, 2
),

-- P11: User Behavior — auth funnel success rate signal (Component A penalizer)
funnel_inputs AS (
  SELECT
    bot_id,
    DATE_TRUNC(DATE(event_timestamp), WEEK)                                AS week_start,
    ROUND(SAFE_DIVIDE(
      COUNT(DISTINCT CASE
        WHEN LOWER(funnel_step_friendly_name) LIKE '%sucesso%'      -- PT: "Sucesso na autenticação"
          OR LOWER(funnel_step_friendly_name) LIKE '%success%'      -- EN
          OR LOWER(funnel_step_friendly_name) LIKE '%validado%'     -- PT: paso validado
          OR LOWER(funnel_step_friendly_name) LIKE '%completado%'   -- PT/ES
          OR LOWER(funnel_step_friendly_name) LIKE '%completo%'     -- PT/ES
        THEN user_id END),
      NULLIF(COUNT(DISTINCT CASE
        WHEN is_start_new_funnel = TRUE
        THEN user_id END), 0)
    ) * 100, 2)                                                            AS auth_success_rate
  FROM `arched-photon-194421.DWH2.traffic_fct_funnel_events`
  WHERE DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 52 WEEK)
    AND is_duplicate = FALSE
  GROUP BY 1, 2
),

combined AS (
  SELECT
    o.bot_id,
    o.week_start,
    o.total_runs,
    o.total_conversations,
    COALESCE(s1.s1_active, FALSE)                                           AS s1_active,
    o.has_oris_data,

    ROUND(
      (0.50 * COALESCE(c.closure_rate, ca.ca_intent_fulfillment_rate, 0) +
       0.50 * (COALESCE(c.resolution_rate_ux, 0) * 0.70 +
               COALESCE(o.resolution_rate_evals, 0) * 0.30))
      * CASE
          WHEN fu.auth_success_rate IS NOT NULL AND fu.auth_success_rate < 60.0
            THEN 0.60 + fu.auth_success_rate / 100.0 * 0.40
          ELSE 1.0
        END
    , 2)                                                                    AS score_a,

    ROUND(CASE
      WHEN o.has_oris_data AND o.evals_clarity_score IS NOT NULL
        THEN COALESCE(c.confusion_detection_score, 0) * 0.50
           + COALESCE(o.evals_clarity_score, 0) * 0.30
           + COALESCE(ca.ca_no_misunderstanding_rate, 0) * 0.20
      WHEN ca.ca_no_misunderstanding_rate IS NOT NULL
        THEN COALESCE(c.confusion_detection_score, 0) * 0.60
           + ca.ca_no_misunderstanding_rate * 0.40
      ELSE COALESCE(c.confusion_detection_score, 0)
    END, 2)                                                                 AS clarity_score,

    ROUND(CASE
      WHEN o.has_oris_data AND o.frustration_evals_score IS NOT NULL AND ca.ca_no_frustration_rate IS NOT NULL
        THEN COALESCE(c.frustration_ux_score, 0) * 0.40
           + COALESCE(o.frustration_evals_score, 0) * 0.20
           + COALESCE(o.apology_score, 0) * 0.10
           + ca.ca_no_frustration_rate * 0.30
      WHEN o.has_oris_data AND o.frustration_evals_score IS NOT NULL
        THEN COALESCE(c.frustration_ux_score, 0) * 0.60
           + COALESCE(o.frustration_evals_score, 0) * 0.25
           + COALESCE(o.apology_score, 0) * 0.15
      WHEN ca.ca_no_frustration_rate IS NOT NULL
        THEN COALESCE(c.frustration_ux_score, 0) * 0.60
           + ca.ca_no_frustration_rate * 0.40
      ELSE COALESCE(c.frustration_ux_score, 0)
    END, 2)                                                                 AS friction_score,

    COALESCE(o.fallback_quality_score, fb.fb_fallback_quality)             AS fallback_quality_score,
    ROUND(CASE
      WHEN ft.fb_no_loop_rate IS NOT NULL AND ft.fb_no_loop_rate < 95.0
        THEN (COALESCE(c.efficiency_score, 0) + COALESCE(c.loop_prevention_score, 0)) / 2 * 0.60
           + ft.fb_no_loop_rate * 0.40
      ELSE (COALESCE(c.efficiency_score, 0) + COALESCE(c.loop_prevention_score, 0)) / 2
    END, 2)                                                                 AS efficiency_loops_score,
    ft.fb_no_loop_rate,
    fu.auth_success_rate,

    COALESCE(o.error_free_score, fb.fb_error_free_score, ca.ca_no_error_rate) AS error_free_score,
    COALESCE(c.efficiency_score, 0)                                        AS efficiency_score,

    CASE
      WHEN l.latency_avg_s IS NULL     THEN NULL
      WHEN l.latency_avg_s <= 5        THEN 100.0
      WHEN l.latency_avg_s <= 30       THEN GREATEST(0.0, 100.0 - (l.latency_avg_s - 5) * 3.0)
      WHEN l.latency_avg_s <= 60       THEN 25.0
      ELSE GREATEST(0.0, 25.0 - (l.latency_avg_s - 60) * 0.25)
    END                                                                     AS latency_score,

    er.error_load_score,
    er.active_errors,
    COALESCE(c.loop_prevention_score, 0)                                   AS loop_prevention_score,
    COALESCE(c.proactive_anticipation_score, 0)                            AS proactive_anticipation_score,
    COALESCE(fb.fb_recovery_rate, 100.0)                                   AS fb_recovery_rate,
    COALESCE(ca.ca_no_apology_rate, 100.0)                                 AS ca_no_apology_rate,
    COALESCE(cs.ca_human_containment_rate, 100.0)                          AS ca_human_containment_rate,
    o.safety_score_e,
    o.s2_domain_count,
    o.s3_toxic_count,
    ca.ca_domain_safety_rate,
    ca.ca_no_toxicity_rate,

    -- Token costs (diagnóstico)
    cc.total_cost_usd,
    cc.avg_cost_per_conv_usd,
    cc.avg_tokens_per_conv,
    cc.cache_hit_rate

  FROM oris_inputs o
  LEFT JOIN cie_inputs            c  ON o.bot_id = c.bot_id  AND o.week_start = c.week_start
  LEFT JOIN latency_inputs        l  ON o.bot_id = l.bot_id  AND o.week_start = l.week_start
  LEFT JOIN flowbuilder_inputs    fb ON o.bot_id = fb.bot_id AND o.week_start = fb.week_start
  LEFT JOIN errors_inputs         er ON o.bot_id = er.bot_id AND o.week_start = er.week_start
  LEFT JOIN s1_incidents          s1 ON o.bot_id = s1.bot_id AND o.week_start = s1.week_start
  LEFT JOIN ca_evals_inputs       ca ON o.bot_id = ca.bot_id AND o.week_start = ca.week_start
  LEFT JOIN ca_sessions_inputs    cs ON o.bot_id = cs.bot_id AND o.week_start = cs.week_start
  LEFT JOIN fb_transitions_inputs ft ON o.bot_id = ft.bot_id AND o.week_start = ft.week_start
  LEFT JOIN funnel_inputs         fu ON o.bot_id = fu.bot_id AND o.week_start = fu.week_start
  LEFT JOIN ca_costs_inputs       cc ON o.bot_id = cc.bot_id AND o.week_start = cc.week_start
),

scored AS (
  SELECT
    *,
    ROUND(
      0.30 * efficiency_loops_score +
      0.30 * clarity_score +
      0.20 * COALESCE(fallback_quality_score, 0) +
      0.20 * friction_score
    , 2)                                                                    AS score_b,

    CASE
      WHEN latency_score IS NOT NULL AND error_load_score IS NOT NULL
        THEN ROUND(0.20 * COALESCE(error_free_score, 0) + 0.30 * efficiency_score +
                   0.25 * latency_score + 0.25 * error_load_score, 2)
      WHEN latency_score IS NULL AND error_load_score IS NOT NULL
        THEN ROUND(0.25 * COALESCE(error_free_score, 0) + 0.40 * efficiency_score +
                   0.35 * error_load_score, 2)
      WHEN latency_score IS NOT NULL AND error_load_score IS NULL
        THEN ROUND(0.30 * COALESCE(error_free_score, 0) + 0.40 * efficiency_score + 0.30 * latency_score, 2)
      ELSE ROUND(0.40 * COALESCE(error_free_score, 0) + 0.60 * efficiency_score, 2)
    END                                                                     AS score_c,

    CASE
      WHEN ca_no_apology_rate != 100.0 OR ca_human_containment_rate != 100.0
        THEN ROUND(
          0.25 * COALESCE(fallback_quality_score, 0) +
          0.20 * fb_recovery_rate +
          0.20 * ca_no_apology_rate +
          0.15 * ca_human_containment_rate +
          0.12 * loop_prevention_score +
          0.08 * proactive_anticipation_score
        , 2)
      ELSE ROUND(
        0.35 * COALESCE(fallback_quality_score, 0) +
        0.30 * fb_recovery_rate +
        0.20 * loop_prevention_score +
        0.15 * proactive_anticipation_score
      , 2)
    END                                                                     AS score_d,

    CASE
      WHEN s1_active = TRUE THEN 0.0
      WHEN safety_score_e IS NOT NULL AND ca_domain_safety_rate IS NOT NULL
        THEN ROUND(0.60 * safety_score_e + 0.25 * ca_domain_safety_rate +
                   0.15 * COALESCE(ca_no_toxicity_rate, 100.0), 2)
      WHEN safety_score_e IS NOT NULL THEN safety_score_e
      WHEN ca_domain_safety_rate IS NOT NULL
        THEN ROUND(0.60 * ca_domain_safety_rate + 0.40 * COALESCE(ca_no_toxicity_rate, 100.0), 2)
      ELSE 100.0
    END                                                                     AS score_e

  FROM combined
)

SELECT
  bot_id,
  week_start,
  ROUND(0.30*score_a + 0.30*score_b + 0.20*score_c + 0.15*score_d + 0.05*score_e, 1) AS fhs_score,
  CASE
    WHEN s1_active = TRUE THEN 'CRITICO_S1'
    WHEN ROUND(0.30*score_a + 0.30*score_b + 0.20*score_c + 0.15*score_d + 0.05*score_e, 1) >= 80 THEN 'SALUDABLE'
    WHEN ROUND(0.30*score_a + 0.30*score_b + 0.20*score_c + 0.15*score_d + 0.05*score_e, 1) >= 65 THEN 'EN_RIESGO'
    ELSE 'CRITICO'
  END                                                                       AS fhs_status,
  score_a,
  score_b,
  score_c,
  score_d,
  score_e,
  latency_score,
  error_load_score,
  active_errors,
  total_runs,
  total_conversations,
  has_oris_data,
  s1_active,
  total_cost_usd,
  avg_cost_per_conv_usd,
  avg_tokens_per_conv,
  cache_hit_rate,
  CURRENT_DATE()                                                            AS snapshot_date
FROM scored
WHERE (bot_id, week_start) NOT IN (
  SELECT AS STRUCT bot_id, week_start
  FROM {FULL_TABLE}
)
ORDER BY bot_id, week_start DESC
"""

print("Corriendo backfill (hasta 52 semanas de histórico)...")
print("Esto puede tomar 1-2 minutos...\n")

job = client.query(BACKFILL)
job.result()

rows_inserted = job.num_dml_affected_rows
print(f"✅ Backfill completo: {rows_inserted} filas insertadas en {FULL_TABLE}")
print("\nListo. Ahora el cron diario (compute_fhs_daily.py) mantiene el histórico actualizado.")
