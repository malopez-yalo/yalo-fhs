import { BigQuery } from "@google-cloud/bigquery";

let bigqueryClient: BigQuery | null = null;

function getBigQueryClient(): BigQuery {
  if (!bigqueryClient) {
    const serviceAccountKey = process.env.SERVICE_ACCOUNT_MAURY;
    if (!serviceAccountKey) {
      throw new Error("SERVICE_ACCOUNT_MAURY secret is not configured");
    }
    const credentials = JSON.parse(serviceAccountKey);
    bigqueryClient = new BigQuery({
      projectId: credentials.project_id,
      credentials,
    });
  }
  return bigqueryClient;
}

export interface LangSmithMetric {
  key: string;
  negativeCount: number;
  totalCount: number;
  issueRate: number;
}

export interface FlowbuilderMetrics {
  messages: number;
  avgLatencyMs: number;
  avgLatencySec: number;
  p50LatencySec: number;
  p90LatencySec: number;
  sessions: number;
  fallbackSessions: number;
  blockSessions: number;
  recoverySessions: number;
  errorFreeSessions: number;
  users: number;
  totalUserMessages: number;
  respondedUserMessages: number;
  notRespondedUserMessages: number;
  recoverySuccessRate: number;
}

export interface UXMetric {
  metricName: string;
  evaluatedConversations: number;
  passed: number;
  failed: number;
  successRatePct: number;
  avgScore: number;
  threshold: number;
  status: string;
}

export interface FHSSubComponent {
  score: number;
  source: "oris" | "ux" | "mixed" | "flowbuilder" | "cie" | "manual" | "custom_agent" | "ca_blended";
  available: boolean;
}

export interface FHSComponent {
  score: number;
  weight: number;
  label: string;
  subComponents: Record<string, FHSSubComponent>;
}

export interface FHSResult {
  overall: number;
  components: {
    flowEffectiveness: FHSComponent;
    uxQuality: FHSComponent;
    stability: FHSComponent;
    recovery: FHSComponent;
    safety: FHSComponent;
  };
  rawMetrics: LangSmithMetric[];
  flowbuilderMetrics: FlowbuilderMetrics | null;
  uxMetrics: UXMetric[] | null;
  errorsData: ErrorsData | null;
  customAgentMetrics: LangSmithMetric[] | null;
  hasOrisData: boolean;
  hasUXData: boolean;
  hasCustomAgentData: boolean;
  dataWindowDays: number;
  queriedAt: string;
}

const LANGSMITH_QUERY = `
SELECT
    genai_langsmith_feedbacks.key AS key,
    COUNT(CASE WHEN genai_langsmith_feedbacks.value IN (
          'frustrated', 'apology_detected', 'fallback', 'toxic', 'harmful',
          'toxic_or_harmful', 'unsafe', 'misunderstood', 'error_detected',
          'out_of_scope', 'not_fulfilled', 'not_relevant'
        ) THEN 1 ELSE NULL END) AS negative_count,
    COUNT(*) AS total_count,
    SAFE_DIVIDE(
      COUNT(CASE WHEN genai_langsmith_feedbacks.value IN (
          'frustrated', 'apology_detected', 'fallback', 'toxic', 'harmful',
          'toxic_or_harmful', 'unsafe', 'misunderstood', 'error_detected',
          'out_of_scope', 'not_fulfilled', 'not_relevant'
        ) THEN 1 ELSE NULL END),
      COUNT(*)
    ) AS issue_rate
FROM \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_feedbacks\` AS genai_langsmith_feedbacks
LEFT JOIN \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs\` AS st_genai_langsmith_runs
  ON genai_langsmith_feedbacks.trace_id = st_genai_langsmith_runs.trace_id
INNER JOIN \`arched-photon-194421.DWH2.accounts_vw_details\` AS vw_accounts_details
  ON (REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow_name'), '"', '')) = vw_accounts_details.bot_id
WHERE genai_langsmith_feedbacks.created_at >= TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.created_at < TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General'), 'Mexico/General'), INTERVAL 15 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.key IN (
      'agent_apology', 'assistant_error', 'knowledge_fallback',
      'misunderstanding', 'domain_safety', 'user_intent_fulfillment',
      'relevance', 'user_frustration', 'toxicity_and_harmfulness'
    )
  AND st_genai_langsmith_runs.langsmith_workspace_name = 'Oris'
  AND st_genai_langsmith_runs.langsmith_tracing_project_name = 'ml-gai-service-production'
  AND st_genai_langsmith_runs.id = st_genai_langsmith_runs.trace_id
GROUP BY 1
ORDER BY 4 DESC
LIMIT 10
`;

const FLOWBUILDER_GLOBAL_QUERY = `
SELECT
  SUM(total_user_messages) as messages,
  ROUND(AVG(avg_latency_sec) * 1000, 0) as avg_latency_ms,
  ROUND(AVG(avg_latency_sec), 2) as avg_latency_sec,
  ROUND(AVG(p50_latency_sec), 2) as p50_latency_sec,
  ROUND(AVG(p90_latency_sec), 2) as p90_latency_sec,
  SUM(sessions) as sessions,
  SUM(COALESCE(fallback_session, 0)) as fallback_sessions,
  SUM(COALESCE(block_session, 0)) as block_sessions,
  SUM(COALESCE(recovery_session, 0)) as recovery_sessions,
  SUM(COALESCE(errorFree_session, 0)) as errorfree_sessions,
  SUM(COALESCE(users, 0)) as users,
  SUM(COALESCE(total_user_messages, 0)) as total_user_messages,
  SUM(COALESCE(responded_user_messages, 0)) as responded_user_messages,
  SUM(COALESCE(not_responded_user_messages, 0)) as not_responded_user_messages,
  ROUND(COALESCE(SAFE_DIVIDE(
    SUM(recovery_session),
    SUM(block_session) + SUM(recovery_session)
  ) * 100, 100.0), 2) as recovery_success_rate
FROM \`commerce-sandbox.DWH_STAGE.Flowbuilder_healthy_metrics\`
WHERE create_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND sessions IS NOT NULL
`;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function latencyScoreP5(avgS: number): number {
  if (avgS <= 0) return 0;
  if (avgS <= 5) return 100;
  if (avgS <= 30) return round2(Math.max(0, 100 - (avgS - 5) * 3.0));
  if (avgS <= 60) return 25;
  if (avgS < 160) return round2(Math.max(0, 25 - (avgS - 60) * 0.25));
  return 0;
}

const CIE_TABLE = "arched-photon-194421.conversational_insights.v_cross_metric_scorecard";

export interface ErrorsData {
  errorLoadScore: number;
  activeErrors: number;
  unseenErrors: number;
  httpErrors: number;
  luaErrors: number;
  newThisWeek: number;
  categoryBreakdown: Record<string, number>;
}

export interface ErrorDistribution {
  type: string;
  uniqueErrors: number;
  totalOccurrences: number;
  botsAffected: number;
  pctOccurrences: number;
}

export interface BotErrorDetail {
  step: string;
  type: string;
  message: string;
  category: string;
  severity: string;
  diagnosis: string;
  recommendedAction: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  ageDays: number;
  reviewedInStudio: boolean;
  isNewThisWeek: boolean;
}

const UX_METRIC_MAP: Record<string, string[]> = {
  "conversational_closure": ["closureRate"],
  "conversational closure": ["closureRate"],
  "closure_rate": ["closureRate"],
  "closure": ["closureRate"],
  "conversational_efficiency": ["efficiencyLoops", "stabilityProxy"],
  "conversational efficiency": ["efficiencyLoops", "stabilityProxy"],
  "efficiency": ["efficiencyLoops", "stabilityProxy"],
  "loop_prevention": ["loopPrevention", "efficiencyLoops"],
  "loop prevention": ["loopPrevention", "efficiencyLoops"],
  "central_query_resolution": ["resolutionRate"],
  "central query resolution": ["resolutionRate"],
  "resolution": ["resolutionRate"],
  "absence_of_user_frustration": ["friction"],
  "absence of user frustration": ["friction"],
  "frustration_detection": ["friction"],
  "user_clarity": ["clarity"],
  "user clarity": ["clarity"],
  "confusion_detection": ["clarity"],
  "proactive_anticipation": ["proactiveAnticipation"],
  "fraud_hygiene": ["fraudHygiene"],
  "pii_guard": ["piiGuard"],
  "safety_compliance": ["safetyCompliance"],
  "zero_financial_advice": ["zeroFinancialAdvice"],
};

const MANUAL_UX_DATA: Record<string, UXMetric[]> = {
  "wa-gr1916-grupolala": [
    { metricName: "Conversational Efficiency", evaluatedConversations: 1000, passed: 373, failed: 627, successRatePct: 37.3, avgScore: 0.530, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Central Query Resolution", evaluatedConversations: 1000, passed: 394, failed: 606, successRatePct: 39.4, avgScore: 0.635, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Conversational Closure", evaluatedConversations: 1000, passed: 296, failed: 704, successRatePct: 29.6, avgScore: 0.463, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Absence of User Frustration", evaluatedConversations: 1000, passed: 435, failed: 565, successRatePct: 43.5, avgScore: 0.637, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "User Clarity", evaluatedConversations: 1000, passed: 396, failed: 604, successRatePct: 39.6, avgScore: 0.636, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Loop Prevention", evaluatedConversations: 1000, passed: 374, failed: 626, successRatePct: 37.4, avgScore: 0.609, threshold: 0.60, status: "Needs Immediate Action" },
  ],
  "wa-ba1758-bafar": [
    { metricName: "Conversational Efficiency", evaluatedConversations: 1000, passed: 338, failed: 662, successRatePct: 33.8, avgScore: 0.460, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Central Query Resolution", evaluatedConversations: 1000, passed: 318, failed: 682, successRatePct: 31.8, avgScore: 0.480, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Conversational Closure", evaluatedConversations: 1000, passed: 268, failed: 732, successRatePct: 26.8, avgScore: 0.400, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Absence of User Frustration", evaluatedConversations: 1000, passed: 421, failed: 579, successRatePct: 42.1, avgScore: 0.580, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "User Clarity", evaluatedConversations: 1000, passed: 473, failed: 527, successRatePct: 47.3, avgScore: 0.600, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Loop Prevention", evaluatedConversations: 1000, passed: 396, failed: 604, successRatePct: 39.6, avgScore: 0.520, threshold: 0.60, status: "Needs Immediate Action" },
  ],
  "wa-po1804-postobon": [
    { metricName: "Conversational Efficiency", evaluatedConversations: 1000, passed: 386, failed: 614, successRatePct: 38.6, avgScore: 0.480, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Central Query Resolution", evaluatedConversations: 1000, passed: 428, failed: 572, successRatePct: 42.8, avgScore: 0.550, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Conversational Closure", evaluatedConversations: 1000, passed: 219, failed: 781, successRatePct: 21.9, avgScore: 0.380, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Absence of User Frustration", evaluatedConversations: 1000, passed: 536, failed: 464, successRatePct: 53.6, avgScore: 0.620, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "User Clarity", evaluatedConversations: 1000, passed: 472, failed: 528, successRatePct: 47.2, avgScore: 0.590, threshold: 0.60, status: "Needs Immediate Action" },
    { metricName: "Loop Prevention", evaluatedConversations: 1000, passed: 422, failed: 578, successRatePct: 42.2, avgScore: 0.530, threshold: 0.60, status: "Needs Immediate Action" },
  ],
};

function buildUXAnalysisPerBotQuery(botIds: string[]): string {
  const botList = botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ");
  return `
WITH latest_dates AS (
  SELECT workflow_name, MAX(analysis_date) AS max_date
  FROM \`${CIE_TABLE}\`
  WHERE workflow_name IN (${botList})
  GROUP BY workflow_name
)
SELECT
  s.workflow_name,
  s.metric_name,
  s.evaluated_conversations,
  s.passed,
  s.failed,
  s.success_rate_pct,
  s.avg_score,
  s.threshold,
  s.status,
  s.analysis_date
FROM \`${CIE_TABLE}\` s
JOIN latest_dates ld ON s.workflow_name = ld.workflow_name AND s.analysis_date = ld.max_date
WHERE s.workflow_name IN (${botList})
ORDER BY s.workflow_name, s.success_rate_pct ASC
  `;
}

function parseUXRows(rows: any[]): UXMetric[] {
  return rows.map(r => ({
    metricName: String(r.metric_name),
    evaluatedConversations: Number(r.evaluated_conversations) || 0,
    passed: Number(r.passed) || 0,
    failed: Number(r.failed) || 0,
    successRatePct: Number(r.success_rate_pct) || 0,
    avgScore: Number(r.avg_score) || 0,
    threshold: Number(r.threshold) || 0,
    status: String(r.status),
  }));
}

async function fetchUXAnalysisGlobal(client: BigQuery, botIds: string[]): Promise<UXMetric[] | null> {
  try {
    const [job] = await client.createQueryJob({
      query: buildUXAnalysisPerBotQuery(botIds),
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    const allMetrics: UXMetric[] = rows.length > 0 ? [] : [];
    const botsWithCIE = new Set<string>();
    if (rows.length > 0) {
      for (const r of rows) botsWithCIE.add(String(r.workflow_name));
    }
    const aggregated = new Map<string, { passed: number; total: number; scoreSum: number; threshold: number }>();
    for (const r of rows) {
      const name = String(r.metric_name);
      const existing = aggregated.get(name) || { passed: 0, total: 0, scoreSum: 0, threshold: 0 };
      existing.passed += Number(r.passed) || 0;
      existing.total += Number(r.evaluated_conversations) || 0;
      existing.scoreSum += (Number(r.avg_score) || 0) * (Number(r.evaluated_conversations) || 0);
      existing.threshold = Number(r.threshold) || existing.threshold;
      aggregated.set(name, existing);
    }
    for (const botId of botIds) {
      if (!botsWithCIE.has(botId)) {
        const manual = MANUAL_UX_DATA[botId];
        if (manual) {
          console.log(`CIE: Using manual fallback for ${botId} (no CIE data in view)`);
          for (const m of manual) {
            const name = m.metricName.toLowerCase();
            const existing = aggregated.get(name) || { passed: 0, total: 0, scoreSum: 0, threshold: 0 };
            existing.passed += m.passed;
            existing.total += m.evaluatedConversations;
            existing.scoreSum += m.avgScore * m.evaluatedConversations;
            existing.threshold = m.threshold || existing.threshold;
            aggregated.set(name, existing);
          }
        }
      }
    }
    const result: UXMetric[] = [];
    for (const [name, agg] of aggregated) {
      const successPct = agg.total > 0 ? round2(agg.passed / agg.total * 100) : 0;
      result.push({
        metricName: name,
        evaluatedConversations: agg.total,
        passed: agg.passed,
        failed: agg.total - agg.passed,
        successRatePct: successPct,
        avgScore: agg.total > 0 ? round2(agg.scoreSum / agg.total) : 0,
        threshold: agg.threshold,
        status: successPct >= 85 ? "On Track" : successPct >= 60 ? "Needs Attention" : "Needs Immediate Action",
      });
    }
    return result.length > 0 ? result : null;
  } catch (err) {
    console.error("CIE query error (non-blocking), using manual data fallback:", (err as Error).message?.substring(0, 200));
    const allManual: UXMetric[] = [];
    for (const botId of botIds) {
      const manual = MANUAL_UX_DATA[botId];
      if (manual) allManual.push(...manual);
    }
    return allManual.length > 0 ? allManual : null;
  }
}

async function fetchUXAnalysisPerBot(client: BigQuery, botIds: string[]): Promise<Map<string, UXMetric[]>> {
  const result = new Map<string, UXMetric[]>();
  try {
    const [job] = await client.createQueryJob({
      query: buildUXAnalysisPerBotQuery(botIds),
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    const grouped = new Map<string, any[]>();
    for (const r of rows) {
      const botId = String(r.workflow_name);
      if (!grouped.has(botId)) grouped.set(botId, []);
      grouped.get(botId)!.push(r);
    }
    for (const [botId, botRows] of grouped) {
      const parsed = parseUXRows(botRows);
      console.log(`CIE per-bot: Using BigQuery data for ${botId} (${botRows.length} metrics, date: ${botRows[0]?.analysis_date?.value || 'unknown'})`);
      result.set(botId, parsed);
    }
    for (const botId of botIds) {
      if (!result.has(botId)) {
        const manual = MANUAL_UX_DATA[botId];
        if (manual) {
          console.log(`CIE per-bot: Using manual fallback for ${botId} (no CIE data in view)`);
          result.set(botId, manual);
        }
      }
    }
  } catch (err) {
    console.error("CIE per-bot query error (non-blocking), using manual data fallback:", (err as Error).message?.substring(0, 200));
    for (const botId of botIds) {
      const manual = MANUAL_UX_DATA[botId];
      if (manual) result.set(botId, manual);
    }
  }
  return result;
}

function getUXScoreP4(uxMetrics: UXMetric[] | null, fhsSubComponent: string): { score: number; available: boolean } {
  if (!uxMetrics) return { score: 0, available: false };
  const matches: number[] = [];
  for (const ux of uxMetrics) {
    const mappedList = UX_METRIC_MAP[ux.metricName.toLowerCase()];
    if (mappedList && mappedList.includes(fhsSubComponent)) {
      matches.push(round2(ux.avgScore * 100));
    }
  }
  if (matches.length === 0) return { score: 0, available: false };
  const avg = round2(matches.reduce((a, b) => a + b, 0) / matches.length);
  return { score: avg, available: true };
}

function calculateFHS(metrics: LangSmithMetric[], fb: FlowbuilderMetrics | null, ux: UXMetric[] | null = null, errors: ErrorsData | null = null, caMetrics: LangSmithMetric[] | null = null): FHSResult {
  const metricMap = new Map<string, LangSmithMetric>();
  for (const m of metrics) {
    metricMap.set(m.key, m);
  }

  const caMap = new Map<string, LangSmithMetric>();
  if (caMetrics) {
    for (const m of caMetrics) caMap.set(m.key, m);
  }

  const hasOris = metrics.length > 0;
  const hasFB = fb !== null && fb.sessions > 0;
  const hasUX = ux !== null && ux.length > 0;
  const hasCA = caMetrics !== null && caMetrics.length > 0;

  const successRate = (key: string): number => {
    const metric = metricMap.get(key);
    if (!metric || metric.totalCount === 0) return 0;
    return round2((1 - metric.issueRate) * 100);
  };

  const caSuccessRate = (key: string): number => {
    const metric = caMap.get(key);
    if (!metric || metric.totalCount === 0) return 0;
    return round2((1 - metric.issueRate) * 100);
  };

  const uxClosure = getUXScoreP4(ux, "closureRate");
  const uxEfficiency = getUXScoreP4(ux, "efficiencyLoops");
  const uxLoopPrevention = getUXScoreP4(ux, "loopPrevention");
  const uxProactive = getUXScoreP4(ux, "proactiveAnticipation");
  const uxResolution = getUXScoreP4(ux, "resolutionRate");
  const uxClarity = getUXScoreP4(ux, "clarity");
  const uxFriction = getUXScoreP4(ux, "friction");
  const uxStabilityProxy = getUXScoreP4(ux, "stabilityProxy");

  const hasErrors = errors !== null;
  const errorLoadScore = hasErrors ? errors.errorLoadScore : 0;

  const resolutionRateEvals = hasOris ? successRate("user_intent_fulfillment") : 0;
  const clarityMisunderstanding = hasOris ? successRate("misunderstanding") : 0;
  const clarityRelevance = hasOris ? successRate("relevance") : 0;
  const evalsClarity = hasOris ? round2((clarityMisunderstanding + clarityRelevance) / 2) : 0;
  const fallbackQualityOris = hasOris ? successRate("knowledge_fallback") : 0;
  const frustrationEvals = hasOris ? successRate("user_frustration") : 0;
  const apologyScore = hasOris ? successRate("agent_apology") : 0;
  const errorFreeOris = hasOris ? successRate("assistant_error") : 0;

  const domainSafetyMetric = metricMap.get("domain_safety");
  const toxicityMetric = metricMap.get("toxicity_and_harmfulness");
  const s2Count = domainSafetyMetric?.negativeCount || 0;
  const s3Count = toxicityMetric?.negativeCount || 0;

  const caIntentRate = hasCA ? caSuccessRate("user_intent_fulfillment_custom_agent") : 0;
  const caNoFrustrationRate = hasCA ? caSuccessRate("user_frustration_custom_agent") : 0;
  const caNoMisunderstandingRate = hasCA ? caSuccessRate("misunderstanding_custom_agent") : 0;
  const caNoFallbackRate = hasCA ? caSuccessRate("knowledge_fallback_custom_agent") : 0;
  const caNoErrorRate = hasCA ? caSuccessRate("assistant_error_custom_agent") : 0;
  const caNoApologyRate = hasCA ? caSuccessRate("agent_apology_custom_agent") : 0;
  const caDomainSafetyRate = hasCA ? caSuccessRate("domain_safety_custom_agent") : 0;
  const caNoToxicityRate = hasCA ? caSuccessRate("toxicity_and_harmfulness_custom_agent") : 0;

  const fbErrorFreeRate = hasFB ? round2(fb.errorFreeSessions / fb.sessions * 100) : 0;
  const fbFallbackQuality = hasFB ? round2((fb.sessions - fb.fallbackSessions) / fb.sessions * 100) : 0;
  const fbLatencyScore = hasFB && fb.p50LatencySec > 0 ? latencyScoreP5(fb.p50LatencySec) : 0;
  const fbRecoveryRate = hasFB ? fb.recoverySuccessRate : 100;

  const closureScore = uxClosure.available ? uxClosure.score
    : hasCA ? caIntentRate
    : 0;
  const closureAvailable = uxClosure.available || hasCA;

  const resolutionCombined = hasOris && uxResolution.available
    ? round2(uxResolution.score * 0.70 + resolutionRateEvals * 0.30)
    : uxResolution.available ? uxResolution.score
    : hasOris ? resolutionRateEvals
    : hasCA ? caIntentRate
    : 0;

  const scoreA = (() => {
    const items = [
      { weight: 0.50, score: closureScore, available: closureAvailable },
      { weight: 0.50, score: resolutionCombined, available: hasOris || uxResolution.available || hasCA },
    ];
    const active = items.filter(i => i.available);
    if (active.length === 0) return 0;
    const totalW = active.reduce((s, i) => s + i.weight, 0);
    return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
  })();

  const efficiencyLoopsScore = uxEfficiency.available ? uxEfficiency.score : 0;

  const clarityCombined = (() => {
    if (hasOris && hasCA && uxClarity.available) {
      return round2(uxClarity.score * 0.50 + evalsClarity * 0.30 + caNoMisunderstandingRate * 0.20);
    } else if (hasOris && uxClarity.available) {
      return round2(uxClarity.score * 0.60 + evalsClarity * 0.40);
    } else if (hasCA && uxClarity.available) {
      return round2(uxClarity.score * 0.60 + caNoMisunderstandingRate * 0.40);
    } else if (uxClarity.available) {
      return uxClarity.score;
    } else if (hasCA) {
      return caNoMisunderstandingRate;
    }
    return evalsClarity;
  })();

  const fallbackQualityScore = hasOris ? fallbackQualityOris
    : hasFB ? fbFallbackQuality
    : hasCA ? caNoFallbackRate
    : 0;
  const fallbackQualityAvailable = hasOris || hasFB || hasCA;

  const frictionCombined = (() => {
    if (hasOris && hasCA && uxFriction.available) {
      return round2(uxFriction.score * 0.40 + frustrationEvals * 0.20 + apologyScore * 0.10 + caNoFrustrationRate * 0.30);
    } else if (hasOris && uxFriction.available) {
      return round2(uxFriction.score * 0.60 + frustrationEvals * 0.25 + apologyScore * 0.15);
    } else if (hasCA && uxFriction.available) {
      return round2(uxFriction.score * 0.60 + caNoFrustrationRate * 0.40);
    } else if (uxFriction.available) {
      return uxFriction.score;
    } else if (hasOris) {
      return round2(frustrationEvals * 0.625 + apologyScore * 0.375);
    } else if (hasCA) {
      return caNoFrustrationRate;
    }
    return 0;
  })();

  const scoreB = (() => {
    const items = [
      { weight: 0.30, score: efficiencyLoopsScore, available: uxEfficiency.available },
      { weight: 0.30, score: clarityCombined, available: hasOris || uxClarity.available || hasCA },
      { weight: 0.20, score: fallbackQualityScore, available: fallbackQualityAvailable },
      { weight: 0.20, score: frictionCombined, available: hasOris || uxFriction.available || hasCA },
    ];
    const active = items.filter(i => i.available);
    if (active.length === 0) return 0;
    const totalW = active.reduce((s, i) => s + i.weight, 0);
    return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
  })();

  const errorFreeScore = hasOris ? errorFreeOris
    : hasFB ? fbErrorFreeRate
    : hasCA ? caNoErrorRate
    : 0;
  const errorFreeAvailable = hasOris || hasFB || hasCA;
  const efficiencyScore = uxStabilityProxy.available ? uxStabilityProxy.score : 0;
  const hasLatency = hasFB && fb!.p50LatencySec > 0;

  const scoreC = (() => {
    if (hasLatency && hasErrors) {
      const items = [
        { weight: 0.20, score: errorFreeScore, available: errorFreeAvailable },
        { weight: 0.30, score: efficiencyScore, available: uxStabilityProxy.available },
        { weight: 0.25, score: fbLatencyScore, available: true },
        { weight: 0.25, score: errorLoadScore, available: true },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    } else if (!hasLatency && hasErrors && errorFreeAvailable) {
      const items = [
        { weight: 0.25, score: errorFreeScore, available: true },
        { weight: 0.40, score: efficiencyScore, available: uxStabilityProxy.available },
        { weight: 0.35, score: errorLoadScore, available: true },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    } else if (!hasLatency && hasErrors && !errorFreeAvailable) {
      const items = [
        { weight: 0.50, score: efficiencyScore, available: uxStabilityProxy.available },
        { weight: 0.50, score: errorLoadScore, available: true },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    } else if (hasLatency && !hasErrors) {
      const items = [
        { weight: 0.30, score: errorFreeScore, available: errorFreeAvailable },
        { weight: 0.40, score: efficiencyScore, available: uxStabilityProxy.available },
        { weight: 0.30, score: fbLatencyScore, available: true },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    } else {
      const items = [
        { weight: 0.40, score: errorFreeScore, available: errorFreeAvailable },
        { weight: 0.60, score: efficiencyScore, available: uxStabilityProxy.available },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    }
  })();

  const proactiveScore = uxProactive.available ? uxProactive.score : 0;
  const loopPreventionScore = uxLoopPrevention.available ? uxLoopPrevention.score : 0;

  const scoreD = (() => {
    if (hasCA) {
      const items = [
        { weight: 0.25, score: fallbackQualityScore, available: fallbackQualityAvailable },
        { weight: 0.20, score: fbRecoveryRate, available: hasFB },
        { weight: 0.20, score: caNoApologyRate, available: true },
        { weight: 0.15, score: 100, available: true },
        { weight: 0.12, score: loopPreventionScore, available: uxLoopPrevention.available },
        { weight: 0.08, score: proactiveScore, available: uxProactive.available },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    } else {
      const items = [
        { weight: 0.35, score: fallbackQualityScore, available: fallbackQualityAvailable },
        { weight: 0.30, score: fbRecoveryRate, available: hasFB },
        { weight: 0.20, score: loopPreventionScore, available: uxLoopPrevention.available },
        { weight: 0.15, score: proactiveScore, available: uxProactive.available },
      ];
      const active = items.filter(i => i.available);
      if (active.length === 0) return 0;
      const totalW = active.reduce((s, i) => s + i.weight, 0);
      return round2(active.reduce((s, i) => s + (i.weight / totalW) * i.score, 0));
    }
  })();

  const scoreE = (() => {
    if (hasOris && hasCA) {
      const orisE = Math.max(0, round2(100 - 15 * s2Count - 5 * s3Count));
      return round2(orisE * 0.60 + caDomainSafetyRate * 0.25 + caNoToxicityRate * 0.15);
    } else if (hasOris) {
      return Math.max(0, round2(100 - 15 * s2Count - 5 * s3Count));
    } else if (hasCA) {
      return round2(caDomainSafetyRate * 0.60 + caNoToxicityRate * 0.40);
    }
    return 100;
  })();

  const overallItems = [
    { weight: 0.30, score: scoreA, available: closureAvailable || hasOris || uxResolution.available || hasCA },
    { weight: 0.30, score: scoreB, available: uxEfficiency.available || (hasOris || uxClarity.available || hasCA) || fallbackQualityAvailable || (hasOris || uxFriction.available || hasCA) },
    { weight: 0.20, score: scoreC, available: errorFreeAvailable || uxStabilityProxy.available || hasLatency || hasErrors },
    { weight: 0.15, score: scoreD, available: fallbackQualityAvailable || hasFB || uxLoopPrevention.available || uxProactive.available || hasCA },
    { weight: 0.05, score: scoreE, available: true },
  ];
  const activeOverall = overallItems.filter(i => i.available);
  const totalOverallW = activeOverall.reduce((s, i) => s + i.weight, 0);
  const overall = totalOverallW > 0
    ? round2(activeOverall.reduce((s, i) => s + (i.weight / totalOverallW) * i.score, 0))
    : 0;

  const claritySource: FHSSubComponent["source"] = (hasOris && hasCA && uxClarity.available) ? "ca_blended"
    : (hasCA && uxClarity.available) ? "ca_blended"
    : (hasOris && uxClarity.available) ? "mixed"
    : uxClarity.available ? "cie"
    : hasCA ? "custom_agent"
    : "oris";

  const frictionSource: FHSSubComponent["source"] = (hasOris && hasCA && uxFriction.available) ? "ca_blended"
    : (hasCA && uxFriction.available) ? "ca_blended"
    : (hasOris && uxFriction.available) ? "mixed"
    : uxFriction.available ? "cie"
    : hasCA ? "custom_agent"
    : "oris";

  const errorFreeSource: FHSSubComponent["source"] = hasOris ? "oris"
    : hasFB ? "flowbuilder"
    : hasCA ? "custom_agent"
    : "oris";

  const safetySource: FHSSubComponent["source"] = (hasOris && hasCA) ? "ca_blended"
    : hasOris ? "oris"
    : hasCA ? "custom_agent"
    : "manual";

  return {
    overall: Math.round(overall * 10) / 10,
    components: {
      flowEffectiveness: {
        score: scoreA,
        weight: 0.30,
        label: "Flow Effectiveness",
        subComponents: {
          closureRate: { score: closureScore, source: uxClosure.available ? "cie" : hasCA ? "custom_agent" : "cie", available: closureAvailable },
          resolutionRate: { score: resolutionCombined, source: hasOris && uxResolution.available ? "mixed" : (uxResolution.available ? "cie" : hasOris ? "oris" : hasCA ? "custom_agent" : "oris"), available: hasOris || uxResolution.available || hasCA },
        },
      },
      uxQuality: {
        score: scoreB,
        weight: 0.30,
        label: "UX & Flow Quality",
        subComponents: {
          efficiencyLoops: { score: efficiencyLoopsScore, source: "cie", available: uxEfficiency.available },
          clarity: { score: clarityCombined, source: claritySource, available: hasOris || uxClarity.available || hasCA },
          fallbackQuality: { score: fallbackQualityScore, source: hasOris ? "oris" : hasFB ? "flowbuilder" : hasCA ? "custom_agent" : "oris", available: fallbackQualityAvailable },
          friction: { score: frictionCombined, source: frictionSource, available: hasOris || uxFriction.available || hasCA },
        },
      },
      stability: {
        score: scoreC,
        weight: 0.20,
        label: "Stability & Reliability",
        subComponents: {
          errorFree: { score: errorFreeScore, source: errorFreeSource, available: errorFreeAvailable },
          stabilityProxy: { score: efficiencyScore, source: "cie", available: uxStabilityProxy.available },
          latency: { score: fbLatencyScore, source: "flowbuilder", available: hasLatency },
          errorLoadScore: { score: errorLoadScore, source: "flowbuilder", available: hasErrors },
        },
      },
      recovery: {
        score: scoreD,
        weight: 0.15,
        label: "Recovery & Resilience",
        subComponents: {
          fallbackQuality: { score: fallbackQualityScore, source: hasOris ? "oris" : hasFB ? "flowbuilder" : hasCA ? "custom_agent" : "oris", available: fallbackQualityAvailable },
          recoverySuccessRate: { score: fbRecoveryRate, source: "flowbuilder", available: hasFB },
          loopPrevention: { score: loopPreventionScore, source: "cie", available: uxLoopPrevention.available },
          proactiveAnticipation: { score: proactiveScore, source: "cie", available: uxProactive.available },
          ...(hasCA ? { caNoApology: { score: caNoApologyRate, source: "custom_agent" as const, available: true } } : {}),
        },
      },
      safety: {
        score: scoreE,
        weight: 0.05,
        label: "Safety",
        subComponents: {
          s1Manual: { score: 0, source: "manual", available: false },
          domainSafety: { score: hasOris ? successRate("domain_safety") : hasCA ? caDomainSafetyRate : 0, source: safetySource, available: hasOris || hasCA },
          toxicity: { score: hasOris ? successRate("toxicity_and_harmfulness") : hasCA ? caNoToxicityRate : 0, source: safetySource, available: hasOris || hasCA },
        },
      },
    },
    rawMetrics: metrics,
    flowbuilderMetrics: fb,
    uxMetrics: ux,
    errorsData: errors,
    customAgentMetrics: caMetrics,
    hasOrisData: hasOris,
    hasUXData: hasUX,
    hasCustomAgentData: hasCA,
    dataWindowDays: 7,
    queriedAt: new Date().toISOString(),
  };
}

async function fetchFlowbuilderGlobal(client: BigQuery): Promise<FlowbuilderMetrics | null> {
  try {
    const [job] = await client.createQueryJob({
      query: FLOWBUILDER_GLOBAL_QUERY,
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    if (rows.length === 0 || !rows[0].sessions) return null;
    const r = rows[0];
    return {
      messages: Number(r.messages) || 0,
      avgLatencyMs: Number(r.avg_latency_ms) || 0,
      avgLatencySec: Number(r.avg_latency_sec) || 0,
      p50LatencySec: Number(r.p50_latency_sec) || 0,
      p90LatencySec: Number(r.p90_latency_sec) || 0,
      sessions: Number(r.sessions) || 0,
      fallbackSessions: Number(r.fallback_sessions) || 0,
      blockSessions: Number(r.block_sessions) || 0,
      recoverySessions: Number(r.recovery_sessions) || 0,
      errorFreeSessions: Number(r.errorfree_sessions) || 0,
      users: Number(r.users) || 0,
      totalUserMessages: Number(r.total_user_messages) || 0,
      respondedUserMessages: Number(r.responded_user_messages) || 0,
      notRespondedUserMessages: Number(r.not_responded_user_messages) || 0,
      recoverySuccessRate: Number.isFinite(Number(r.recovery_success_rate)) ? Number(r.recovery_success_rate) : 100,
    };
  } catch (err) {
    console.error("Flowbuilder query error:", err);
    return null;
  }
}

function buildFlowbuilderPerBotQuery(botIds: string[]): string {
  const botList = botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ");
  return `
SELECT
  bot_id,
  SUM(total_user_messages) as messages,
  ROUND(AVG(avg_latency_sec) * 1000, 0) as avg_latency_ms,
  ROUND(AVG(avg_latency_sec), 2) as avg_latency_sec,
  ROUND(AVG(p50_latency_sec), 2) as p50_latency_sec,
  ROUND(AVG(p90_latency_sec), 2) as p90_latency_sec,
  SUM(sessions) as sessions,
  SUM(COALESCE(fallback_session, 0)) as fallback_sessions,
  SUM(COALESCE(block_session, 0)) as block_sessions,
  SUM(COALESCE(recovery_session, 0)) as recovery_sessions,
  SUM(COALESCE(errorFree_session, 0)) as errorfree_sessions,
  SUM(COALESCE(users, 0)) as users,
  SUM(COALESCE(total_user_messages, 0)) as total_user_messages,
  SUM(COALESCE(responded_user_messages, 0)) as responded_user_messages,
  SUM(COALESCE(not_responded_user_messages, 0)) as not_responded_user_messages,
  ROUND(COALESCE(SAFE_DIVIDE(
    SUM(recovery_session),
    SUM(block_session) + SUM(recovery_session)
  ) * 100, 100.0), 2) as recovery_success_rate
FROM \`commerce-sandbox.DWH_STAGE.Flowbuilder_healthy_metrics\`
WHERE create_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND bot_id IN (${botList})
  AND sessions IS NOT NULL
GROUP BY 1
  `;
}

async function fetchFlowbuilderPerBot(client: BigQuery, botIds: string[]): Promise<Map<string, FlowbuilderMetrics>> {
  const result = new Map<string, FlowbuilderMetrics>();
  try {
    const query = buildFlowbuilderPerBotQuery(botIds);
    const [job] = await client.createQueryJob({
      query,
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    for (const r of rows) {
      result.set(r.bot_id, {
        messages: Number(r.messages) || 0,
        avgLatencyMs: Number(r.avg_latency_ms) || 0,
        avgLatencySec: Number(r.avg_latency_sec) || 0,
        p50LatencySec: Number(r.p50_latency_sec) || 0,
        p90LatencySec: Number(r.p90_latency_sec) || 0,
        sessions: Number(r.sessions) || 0,
        fallbackSessions: Number(r.fallback_sessions) || 0,
        blockSessions: Number(r.block_sessions) || 0,
        recoverySessions: Number(r.recovery_sessions) || 0,
        errorFreeSessions: Number(r.errorfree_sessions) || 0,
        users: Number(r.users) || 0,
        totalUserMessages: Number(r.total_user_messages) || 0,
        respondedUserMessages: Number(r.responded_user_messages) || 0,
        notRespondedUserMessages: Number(r.not_responded_user_messages) || 0,
        recoverySuccessRate: Number.isFinite(Number(r.recovery_success_rate)) ? Number(r.recovery_success_rate) : 100,
      });
    }
  } catch (err) {
    console.error("Flowbuilder per-bot query error:", err);
  }
  return result;
}

const ERRORS_TABLE = "commerce-sandbox.DWH_STAGE.fhs_flowbuilder_errors";

function buildErrorsPerBotQuery(botIds: string[]): string {
  const botList = botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ");
  return `
WITH latest_snapshot AS (
  SELECT MAX(fetched_date) AS max_date
  FROM \`${ERRORS_TABLE}\`
)
SELECT
  e.workflow AS bot_id,
  COUNT(DISTINCT e.errorId) AS active_errors,
  COUNTIF(e.seen = FALSE) AS unseen_errors,
  COUNTIF(e.type = 'HTTP Request Error') AS http_errors,
  COUNTIF(e.type = 'Lua Execution Error') AS lua_errors,
  COUNTIF(e.firstOccurrenceAt >= TIMESTAMP(DATE_TRUNC(CURRENT_DATE(), WEEK))) AS new_this_week,
  GREATEST(0.0, 100.0 - COUNT(DISTINCT e.errorId) * 4.0 - COUNTIF(e.seen = FALSE) * 6.0) AS error_load_score,
  COUNTIF(e.category = 'HTTP_CLIENT') AS cat_http_client,
  COUNTIF(e.category = 'HTTP_TIMEOUT') AS cat_http_timeout,
  COUNTIF(e.category = 'HTTP_SERVER') AS cat_http_server,
  COUNTIF(e.category = 'LUA_NIL') AS cat_lua_nil,
  COUNTIF(e.category = 'LUA_LOGIC') AS cat_lua_logic,
  COUNTIF(e.category = 'WA_MESSAGE') AS cat_wa_message,
  COUNTIF(e.category = 'AGENT_ML_GAI') AS cat_agent_ml_gai,
  COUNTIF(e.category = 'AGENT_STEP') AS cat_agent_step,
  COUNTIF(e.category = 'INTEGRATION') AS cat_integration
FROM \`${ERRORS_TABLE}\` e
CROSS JOIN latest_snapshot ls
WHERE e.fetched_date = ls.max_date
  AND e.workflow IN (${botList})
  AND e.firstOccurrenceAt <= TIMESTAMP(DATE_ADD(DATE_TRUNC(CURRENT_DATE(), WEEK), INTERVAL 6 DAY))
  AND e.lastOccurrenceAt >= TIMESTAMP(DATE_TRUNC(CURRENT_DATE(), WEEK))
GROUP BY 1
  `;
}

function buildErrorDetailQuery(botId: string): string {
  const safeBotId = botId.replace(/'/g, "\\'");
  return `
WITH latest AS (
  SELECT MAX(fetched_date) AS max_date
  FROM \`${ERRORS_TABLE}\`
)
SELECT
  e.step,
  e.type,
  e.message,
  e.category,
  e.severity,
  e.diagnosis,
  e.recommended_action,
  e.occurrences,
  DATE(e.firstOccurrenceAt) AS first_seen,
  DATE(e.lastOccurrenceAt) AS last_seen,
  DATE_DIFF(CURRENT_DATE(), DATE(e.firstOccurrenceAt), DAY) AS age_days,
  e.seen AS reviewed_in_studio,
  e.firstOccurrenceAt >= TIMESTAMP(DATE_TRUNC(CURRENT_DATE(), WEEK)) AS is_new_this_week
FROM \`${ERRORS_TABLE}\` e
CROSS JOIN latest ls
WHERE e.fetched_date = ls.max_date
  AND e.workflow = '${safeBotId}'
  AND e.firstOccurrenceAt <= TIMESTAMP(DATE_ADD(DATE_TRUNC(CURRENT_DATE(), WEEK), INTERVAL 6 DAY))
  AND e.lastOccurrenceAt >= TIMESTAMP(DATE_TRUNC(CURRENT_DATE(), WEEK))
ORDER BY
  CASE e.severity
    WHEN 'URGENTE' THEN 1
    WHEN 'ATENCION' THEN 2
    WHEN 'PENDIENTE' THEN 3
    ELSE 4
  END,
  e.occurrences DESC
  `;
}

async function fetchErrorsPerBot(client: BigQuery, botIds: string[]): Promise<Map<string, ErrorsData>> {
  const result = new Map<string, ErrorsData>();
  const zeroErrors: ErrorsData = { errorLoadScore: 100, activeErrors: 0, unseenErrors: 0, httpErrors: 0, luaErrors: 0, newThisWeek: 0, categoryBreakdown: {} };
  try {
    const [job] = await client.createQueryJob({
      query: buildErrorsPerBotQuery(botIds),
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    for (const r of rows) {
      const breakdown: Record<string, number> = {};
      const cats = [
        ['HTTP_CLIENT', r.cat_http_client], ['HTTP_TIMEOUT', r.cat_http_timeout], ['HTTP_SERVER', r.cat_http_server],
        ['LUA_NIL', r.cat_lua_nil], ['LUA_LOGIC', r.cat_lua_logic], ['WA_MESSAGE', r.cat_wa_message],
        ['AGENT_ML_GAI', r.cat_agent_ml_gai], ['AGENT_STEP', r.cat_agent_step], ['INTEGRATION', r.cat_integration],
      ];
      for (const [cat, val] of cats) {
        const n = Number(val) || 0;
        if (n > 0) breakdown[cat] = n;
      }
      result.set(r.bot_id, {
        errorLoadScore: Number(r.error_load_score) || 0,
        activeErrors: Number(r.active_errors) || 0,
        unseenErrors: Number(r.unseen_errors) || 0,
        httpErrors: Number(r.http_errors) || 0,
        luaErrors: Number(r.lua_errors) || 0,
        newThisWeek: Number(r.new_this_week) || 0,
        categoryBreakdown: breakdown,
      });
    }
    for (const botId of botIds) {
      if (!result.has(botId)) {
        result.set(botId, { ...zeroErrors });
      }
    }
  } catch (err) {
    console.error("Flowbuilder Errors query error (non-blocking):", (err as Error).message?.substring(0, 200));
  }
  return result;
}

export async function fetchBotErrorDetails(botId: string): Promise<BotErrorDetail[]> {
  const client = getBigQueryClient();
  try {
    const [job] = await client.createQueryJob({
      query: buildErrorDetailQuery(botId),
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    return rows.map((r: any) => ({
      step: String(r.step || ''),
      type: String(r.type || ''),
      message: String(r.message || ''),
      category: String(r.category || ''),
      severity: String(r.severity || ''),
      diagnosis: String(r.diagnosis || ''),
      recommendedAction: String(r.recommended_action || ''),
      occurrences: Number(r.occurrences) || 0,
      firstSeen: r.first_seen?.value || '',
      lastSeen: r.last_seen?.value || '',
      ageDays: Number(r.age_days) || 0,
      reviewedInStudio: Boolean(r.reviewed_in_studio),
      isNewThisWeek: Boolean(r.is_new_this_week),
    }));
  } catch (err) {
    console.error("Bot error details query error:", (err as Error).message?.substring(0, 200));
    return [];
  }
}

const CA_EVAL_KEYS = [
  'user_intent_fulfillment_custom_agent',
  'user_frustration_custom_agent',
  'misunderstanding_custom_agent',
  'relevance_custom_agent',
  'knowledge_fallback_custom_agent',
  'assistant_error_custom_agent',
  'agent_apology_custom_agent',
  'domain_safety_custom_agent',
  'toxicity_and_harmfulness_custom_agent',
];

const CA_NEGATIVE_CASE = `
    COUNT(CASE WHEN
      (genai_langsmith_feedbacks.key = 'user_intent_fulfillment_custom_agent'
        AND genai_langsmith_feedbacks.value = 'not_fulfilled')
      OR (genai_langsmith_feedbacks.key = 'user_frustration_custom_agent'
        AND genai_langsmith_feedbacks.value = 'frustrated')
      OR (genai_langsmith_feedbacks.key = 'misunderstanding_custom_agent'
        AND genai_langsmith_feedbacks.value = 'misunderstood')
      OR (genai_langsmith_feedbacks.key = 'relevance_custom_agent'
        AND genai_langsmith_feedbacks.value = 'not_relevant')
      OR (genai_langsmith_feedbacks.key = 'knowledge_fallback_custom_agent'
        AND genai_langsmith_feedbacks.value = 'fallback')
      OR (genai_langsmith_feedbacks.key = 'assistant_error_custom_agent'
        AND genai_langsmith_feedbacks.value = 'error_detected')
      OR (genai_langsmith_feedbacks.key = 'agent_apology_custom_agent'
        AND genai_langsmith_feedbacks.value IN ('apology_detected', 'agent_apology'))
      OR (genai_langsmith_feedbacks.key = 'domain_safety_custom_agent'
        AND genai_langsmith_feedbacks.value = 'out_of_scope')
      OR (genai_langsmith_feedbacks.key = 'toxicity_and_harmfulness_custom_agent'
        AND genai_langsmith_feedbacks.value = 'toxic_or_harmful')
    THEN 1 ELSE NULL END)`;

function buildCustomAgentPerBotQuery(botIds: string[]): string {
  const botList = botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ");
  const keyList = CA_EVAL_KEYS.map(k => `'${k}'`).join(", ");
  return `
SELECT
    vw_accounts_details.bot_id AS bot_id,
    genai_langsmith_feedbacks.key AS key,
    ${CA_NEGATIVE_CASE} AS negative_count,
    COUNT(*) AS total_count,
    SAFE_DIVIDE(
      ${CA_NEGATIVE_CASE},
      COUNT(*)
    ) AS issue_rate
FROM \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_feedbacks\` AS genai_langsmith_feedbacks
LEFT JOIN \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs\` AS st_genai_langsmith_runs
  ON genai_langsmith_feedbacks.trace_id = st_genai_langsmith_runs.trace_id
INNER JOIN \`arched-photon-194421.DWH2.accounts_vw_details\` AS vw_accounts_details
  ON COALESCE(
    NULLIF(REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow_name'), '"', ''), ''),
    REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow'), '"', '')
  ) = vw_accounts_details.bot_id
WHERE genai_langsmith_feedbacks.created_at >= TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.created_at < TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General'), 'Mexico/General'), INTERVAL 15 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.key IN (${keyList})
  AND st_genai_langsmith_runs.langsmith_workspace_name = 'Custom Agents'
  AND st_genai_langsmith_runs.langsmith_tracing_project_name = 'custom-agents-production'
  AND st_genai_langsmith_runs.id = st_genai_langsmith_runs.trace_id
  AND vw_accounts_details.bot_id IN (${botList})
GROUP BY 1, 2
ORDER BY 1, 5 DESC
  `;
}

const CA_GLOBAL_QUERY = `
SELECT
    genai_langsmith_feedbacks.key AS key,
    ${CA_NEGATIVE_CASE} AS negative_count,
    COUNT(*) AS total_count,
    SAFE_DIVIDE(
      ${CA_NEGATIVE_CASE},
      COUNT(*)
    ) AS issue_rate
FROM \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_feedbacks\` AS genai_langsmith_feedbacks
LEFT JOIN \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs\` AS st_genai_langsmith_runs
  ON genai_langsmith_feedbacks.trace_id = st_genai_langsmith_runs.trace_id
INNER JOIN \`arched-photon-194421.DWH2.accounts_vw_details\` AS vw_accounts_details
  ON COALESCE(
    NULLIF(REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow_name'), '"', ''), ''),
    REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow'), '"', '')
  ) = vw_accounts_details.bot_id
WHERE genai_langsmith_feedbacks.created_at >= TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.created_at < TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General'), 'Mexico/General'), INTERVAL 15 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.key IN (${CA_EVAL_KEYS.map(k => `'${k}'`).join(", ")})
  AND st_genai_langsmith_runs.langsmith_workspace_name = 'Custom Agents'
  AND st_genai_langsmith_runs.langsmith_tracing_project_name = 'custom-agents-production'
  AND st_genai_langsmith_runs.id = st_genai_langsmith_runs.trace_id
GROUP BY 1
ORDER BY 4 DESC
`;

async function fetchCustomAgentPerBot(client: BigQuery, botIds: string[]): Promise<Map<string, LangSmithMetric[]>> {
  const result = new Map<string, LangSmithMetric[]>();
  try {
    const [job] = await client.createQueryJob({
      query: buildCustomAgentPerBotQuery(botIds),
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    for (const row of rows) {
      const botId = row.bot_id as string;
      if (!result.has(botId)) result.set(botId, []);
      result.get(botId)!.push({
        key: row.key,
        negativeCount: Number(row.negative_count),
        totalCount: Number(row.total_count),
        issueRate: Number(row.issue_rate),
      });
    }
    if (result.size > 0) {
      console.log(`Custom Agents: fetched eval data for ${result.size} bots`);
    }
  } catch (err) {
    console.error("Custom Agents query error (non-blocking):", (err as Error).message?.substring(0, 200));
  }
  return result;
}

async function fetchCustomAgentGlobal(client: BigQuery): Promise<LangSmithMetric[] | null> {
  try {
    const [job] = await client.createQueryJob({
      query: CA_GLOBAL_QUERY,
      useLegacySql: false,
    });
    const [rows] = await job.getQueryResults();
    if (rows.length === 0) return null;
    const metrics: LangSmithMetric[] = rows.map((row: any) => ({
      key: row.key,
      negativeCount: Number(row.negative_count),
      totalCount: Number(row.total_count),
      issueRate: Number(row.issue_rate),
    }));
    console.log(`Custom Agents global: fetched ${metrics.length} eval keys`);
    return metrics;
  } catch (err) {
    console.error("Custom Agents global query error (non-blocking):", (err as Error).message?.substring(0, 200));
    return null;
  }
}

const ALL_TRACKED_BOTS = [
  "wa-gr1916-grupolala",
  "wa-ba1758-bafar",
  "wa-po1804-postobon",
  "ne1374-nespresso-wa-ng-br",
  "wa-g-1948-greal-rmp",
  "wa-ke1770-kellanova",
  "wa-g-1948-greal-disape",
  "compra-agora-ng-wa-br",
  "wa-fr1941-fruki-prd",
  "rommac-caboclo-wa-br",
  "rommac-rommac-wa-br",
  "wa-ne1777-nestle-professional-production",
  "nestle-mx-b2b",
  "wa-ne1374-moment-n",
  "ng-femsa-wae-br-prd",
  "nadro-mx-b2b",
  "hbc-ng-b2b",
  "wa-cc1661-ccu-cl-b2b",
  "wa-mo1662-ecuador-production",
  "mo1561-mondelez-peru-b2b",
  "wa-mo1533-mondelez-argentina",
  "wa-ga2103-gabrica-colombia",
  "wa-mo1564-mondelez-uruguay",
  "wa-un1912-napolita-ecuador",
  "mo1569-mondelezbr",
  "unilever_b2b",
  "wa-pe1814-penafiel-mx",
  "alpina-wa-col-prd",
  "at1551-atacadao-wa-br",
  "bepensa-mx-prd",
  "bepensa-rd-prd",
  "ism-dr-beverages",
  "molitalia-pe-b2b",
  "mondelez-mx-b2b",
  "nestle-chile-b2b",
  "nestle-jmc-prd",
  "ng-femsa-wae-ar-prd",
  "ng-femsa-wae-co-prd",
  "ng-femsa-wae-cr-prd",
  "ng-femsa-wae-gt-prd",
  "ng-femsa-wae-ni-prd",
  "ng-femsa-wae-pa-prd",
  "ng-femsa-wae-uy-prd",
  "unilever-ecu-hpc-prd",
  "unilever-ecu-ic-prd",
  "wa-bo1917-bowen-bowen-prod",
  "wa-ca1641-carozzi-ch",
  "wa-ce2212-cesar-iglesias-prod",
  "wa-co2107-colgatepalmolive-prd",
  "wa-di1984-diana-sv",
  "wa-en1992-enex-chile",
  "wa-fe2082-feduro-panama",
  "wa-gr1794-grupo-nieto",
  "wa-hb2210-hbc-egypt",
  "wa-hi1949-hico-prod",
  "wa-it1752-italcol",
  "wa-ju2133-jumex-prod",
  "wa-me1772-mercedes-b2c",
  "wa-mi1920-minsa-prod",
  "wa-mo1565-mondelez-col-b2b-prd",
  "wa-ne1614-nestle-ven",
  "wa-ne2096-nestle-professional-chile",
  "wa-ne2120-nestle-professional-mx",
  "wa-pd1665-pdc-codisa",
  "wa-pd1665-pdc-codisa-el-salvador",
  "wa-pd2191-pdc-lakasa-peru",
  "pepsico-chile",
  "wa-pe1786-pepsico-col",
  "wa-pe2101-pepsico-rep-dominicana",
  "wa-pe2347-pepsico-peru-prd",
  "wa-pr1764-profarco-pgy",
  "wa-pr1781-pronaca",
  "wa-pr1905-proan",
  "wa-ra1675-raizen-flow",
  "wa-ri1653-rica-mx-b2b",
  "wa-su1932-production-sukarnemx",
  "wa-to2105-socios-tosticentro-mx-prd",
  "wa-si2185-sirvis-italy",
  "wa-un2089-blito",
  "wa-un2089-kiki-production",
  "wa-un2093-unilever-ecu-ice-b2b2c",
];

export async function fetchLangSmithMetrics(): Promise<FHSResult> {
  const client = getBigQueryClient();
  const [orisJob, fbData, uxData, errorsMap, caData] = await Promise.all([
    client.createQueryJob({ query: LANGSMITH_QUERY, useLegacySql: false }),
    fetchFlowbuilderGlobal(client),
    fetchUXAnalysisGlobal(client, ALL_TRACKED_BOTS),
    fetchErrorsPerBot(client, ALL_TRACKED_BOTS),
    fetchCustomAgentGlobal(client),
  ]);
  const [rows] = await orisJob[0].getQueryResults();

  const metrics: LangSmithMetric[] = rows.map((row: any) => ({
    key: row.key,
    negativeCount: Number(row.negative_count),
    totalCount: Number(row.total_count),
    issueRate: Number(row.issue_rate),
  }));

  let globalErrors: ErrorsData | null = null;
  if (errorsMap.size > 0) {
    let totalActive = 0, totalUnseen = 0, totalHttp = 0, totalLua = 0, totalNew = 0;
    const globalBreakdown: Record<string, number> = {};
    for (const e of errorsMap.values()) {
      totalActive += e.activeErrors;
      totalUnseen += e.unseenErrors;
      totalHttp += e.httpErrors;
      totalLua += e.luaErrors;
      totalNew += e.newThisWeek;
      for (const [cat, count] of Object.entries(e.categoryBreakdown)) {
        globalBreakdown[cat] = (globalBreakdown[cat] || 0) + count;
      }
    }
    globalErrors = {
      errorLoadScore: Math.max(0, 100 - totalActive * 4 - totalUnseen * 6),
      activeErrors: totalActive,
      unseenErrors: totalUnseen,
      httpErrors: totalHttp,
      luaErrors: totalLua,
      newThisWeek: totalNew,
      categoryBreakdown: globalBreakdown,
    };
  }

  return calculateFHS(metrics, fbData, uxData, globalErrors, caData);
}

export interface BotFHSResult {
  botId: string;
  fhs: FHSResult;
}

function buildPerBotQuery(botIds: string[]): string {
  const botList = botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ");
  return `
SELECT
    vw_accounts_details.bot_id AS bot_id,
    genai_langsmith_feedbacks.key AS key,
    COUNT(CASE WHEN genai_langsmith_feedbacks.value IN (
          'frustrated', 'apology_detected', 'fallback', 'toxic', 'harmful',
          'toxic_or_harmful', 'unsafe', 'misunderstood', 'error_detected',
          'out_of_scope', 'not_fulfilled', 'not_relevant'
        ) THEN 1 ELSE NULL END) AS negative_count,
    COUNT(*) AS total_count,
    SAFE_DIVIDE(
      COUNT(CASE WHEN genai_langsmith_feedbacks.value IN (
          'frustrated', 'apology_detected', 'fallback', 'toxic', 'harmful',
          'toxic_or_harmful', 'unsafe', 'misunderstood', 'error_detected',
          'out_of_scope', 'not_fulfilled', 'not_relevant'
        ) THEN 1 ELSE NULL END),
      COUNT(*)
    ) AS issue_rate
FROM \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_feedbacks\` AS genai_langsmith_feedbacks
LEFT JOIN \`arched-photon-194421.DWH2_STAGE.st_genai_langsmith_runs\` AS st_genai_langsmith_runs
  ON genai_langsmith_feedbacks.trace_id = st_genai_langsmith_runs.trace_id
INNER JOIN \`arched-photon-194421.DWH2.accounts_vw_details\` AS vw_accounts_details
  ON (REPLACE(JSON_EXTRACT_SCALAR(st_genai_langsmith_runs.extra, '$.metadata.workflow_name'), '"', '')) = vw_accounts_details.bot_id
WHERE genai_langsmith_feedbacks.created_at >= TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.created_at < TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP(DATETIME_ADD(DATETIME(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY, 'Mexico/General'), 'Mexico/General'), INTERVAL -14 DAY), 'Mexico/General'), 'Mexico/General'), INTERVAL 15 DAY), 'Mexico/General')
  AND genai_langsmith_feedbacks.key IN (
      'agent_apology', 'assistant_error', 'knowledge_fallback',
      'misunderstanding', 'domain_safety', 'user_intent_fulfillment',
      'relevance', 'user_frustration', 'toxicity_and_harmfulness'
    )
  AND st_genai_langsmith_runs.langsmith_workspace_name = 'Oris'
  AND st_genai_langsmith_runs.langsmith_tracing_project_name = 'ml-gai-service-production'
  AND st_genai_langsmith_runs.id = st_genai_langsmith_runs.trace_id
  AND vw_accounts_details.bot_id IN (${botList})
GROUP BY 1, 2
ORDER BY 1, 5 DESC
  `;
}

export async function fetchFHSByBots(botIds: string[]): Promise<BotFHSResult[]> {
  const client = getBigQueryClient();

  const [orisJob, fbMap, uxMap, errorsMap, caMap] = await Promise.all([
    client.createQueryJob({ query: buildPerBotQuery(botIds), useLegacySql: false }),
    fetchFlowbuilderPerBot(client, botIds),
    fetchUXAnalysisPerBot(client, botIds),
    fetchErrorsPerBot(client, botIds),
    fetchCustomAgentPerBot(client, botIds),
  ]);
  const [rows] = await orisJob[0].getQueryResults();

  const botMetrics = new Map<string, LangSmithMetric[]>();
  for (const row of rows) {
    const botId = row.bot_id as string;
    if (!botMetrics.has(botId)) {
      botMetrics.set(botId, []);
    }
    botMetrics.get(botId)!.push({
      key: row.key,
      negativeCount: Number(row.negative_count),
      totalCount: Number(row.total_count),
      issueRate: Number(row.issue_rate),
    });
  }

  const results: BotFHSResult[] = [];
  for (const botId of botIds) {
    const metrics = botMetrics.get(botId) || [];
    const fb = fbMap.get(botId) || null;
    const ux = uxMap.get(botId) || null;
    const errs = errorsMap.get(botId) || null;
    const ca = caMap.get(botId) || null;
    results.push({
      botId,
      fhs: calculateFHS(metrics, fb, ux, errs, ca),
    });
  }

  return results;
}

export interface AccountFeatures {
  accountId: string;
  flowType: string;
  totalActivities: number;
  agentCount: number;
  webhookCount: number;
  moduleCount: number;
  purposes: string;
  modules: Record<string, boolean>;
}

const ACCOUNT_FEATURES_TABLE = "commerce-sandbox.DWH_STAGE.fhs_account_features";

const MODULE_COLUMNS = [
  "f_entry_point", "f_registro", "f_autenticacion", "f_catalogo", "f_pedidos",
  "f_metodos_pago", "f_soporte", "f_sales_desk",
  "f_one_chat_buy", "f_carrusel_atc", "f_webview_cart", "f_suggested_order",
  "f_order_reminder", "f_boleto",
  "f_loyalty", "f_cashback", "f_cupones", "f_concurso", "f_promociones",
  "f_voice_agent", "f_knowledge_genie", "f_sales_agent_ai", "f_yalo_force", "f_smalltalk",
  "f_perfilador", "f_subscribe", "f_optin", "f_tyc",
  "f_csat", "f_nps", "f_encuesta",
  "f_live_agent", "f_business_hours",
  "f_campaigns",
];

export async function fetchAccountFeatures(botIds?: string[]): Promise<AccountFeatures[]> {
  const client = getBigQueryClient();
  try {
    const moduleCols = MODULE_COLUMNS.join(", ");
    const whereClause = botIds && botIds.length > 0
      ? `AND account_id IN (${botIds.map(b => `'${b.replace(/'/g, "\\'")}'`).join(", ")})`
      : "";
    const query = `
SELECT
  account_id,
  flow_type,
  total_activities,
  agent_count,
  webhook_count,
  module_count,
  purposes,
  ${moduleCols}
FROM \`${ACCOUNT_FEATURES_TABLE}\`
WHERE fetched_date = (SELECT MAX(fetched_date) FROM \`${ACCOUNT_FEATURES_TABLE}\`)
  ${whereClause}
ORDER BY module_count DESC
    `;
    const [job] = await client.createQueryJob({ query, useLegacySql: false });
    const [rows] = await job.getQueryResults();
    return rows.map((r: any) => {
      const modules: Record<string, boolean> = {};
      for (const col of MODULE_COLUMNS) {
        modules[col] = Boolean(r[col]);
      }
      return {
        accountId: String(r.account_id || ""),
        flowType: String(r.flow_type || "deterministic"),
        totalActivities: Number(r.total_activities) || 0,
        agentCount: Number(r.agent_count) || 0,
        webhookCount: Number(r.webhook_count) || 0,
        moduleCount: Number(r.module_count) || 0,
        purposes: String(r.purposes || ""),
        modules,
      };
    });
  } catch (err) {
    console.error("Account features query error:", (err as Error).message?.substring(0, 200));
    return [];
  }
}

export async function fetchErrorDistribution(): Promise<ErrorDistribution[]> {
  const client = getBigQueryClient();
  const [job] = await client.createQueryJob({
    query: `
WITH latest_snapshot AS (
  SELECT MAX(fetched_date) AS max_date
  FROM \`${ERRORS_TABLE}\`
)
SELECT
  COALESCE(e.category, e.type) AS category,
  COUNT(*) AS unique_errors,
  SUM(e.occurrences) AS total_occurrences,
  COUNT(DISTINCT e.workflow) AS bots_affected,
  ROUND(SUM(e.occurrences) * 100.0 / SUM(SUM(e.occurrences)) OVER (), 1) AS pct_occurrences
FROM \`${ERRORS_TABLE}\` e
CROSS JOIN latest_snapshot ls
WHERE e.fetched_date = ls.max_date
GROUP BY category
ORDER BY total_occurrences DESC
    `,
    useLegacySql: false,
  });
  const [rows] = await job.getQueryResults();
  return rows.map((r: any) => ({
    type: r.category || 'Unknown',
    uniqueErrors: Number(r.unique_errors) || 0,
    totalOccurrences: Number(r.total_occurrences) || 0,
    botsAffected: Number(r.bots_affected) || 0,
    pctOccurrences: Number(r.pct_occurrences) || 0,
  }));
}


