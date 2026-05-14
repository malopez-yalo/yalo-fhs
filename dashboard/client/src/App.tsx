import { useState, useMemo, useEffect, useRef, createContext, useContext } from 'react';
import { 
  Plus, Target, Search, Home, Info, Activity, RefreshCw, AlertTriangle, Database,
  CheckCircle2, Clock, Lightbulb, TrendingUp, ArrowRight, ShieldAlert, Sun, Moon, X, LogOut,
  ChevronDown, Cpu
} from 'lucide-react';
import { useAuth } from './hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Project } from '@shared/schema';
import { getBotInsightOverride, getBotType, botExpectsOris } from './bot-context';
import { type Lang, type Translations, getTranslations, t } from './i18n';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SubComponent {
  score: number;
  source: "oris" | "ux" | "cie" | "mixed" | "flowbuilder" | "manual" | "custom_agent" | "ca_blended";
  available: boolean;
}

interface FHSComponent {
  score: number;
  weight: number;
  label: string;
  subComponents: Record<string, SubComponent>;
}

interface FlowbuilderMetrics {
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

interface ErrorsData {
  errorLoadScore: number;
  activeErrors: number;
  unseenErrors: number;
  httpErrors: number;
  luaErrors: number;
  newThisWeek: number;
  categoryBreakdown?: Record<string, number>;
}

interface BotErrorDetail {
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

interface ErrorDistribution {
  type: string;
  uniqueErrors: number;
  totalOccurrences: number;
  botsAffected: number;
  pctOccurrences: number;
}

interface LiveMetrics {
  overall: number;
  components: Record<string, FHSComponent>;
  rawMetrics: Array<{ key: string; negativeCount: number; totalCount: number; issueRate: number }>;
  flowbuilderMetrics: FlowbuilderMetrics | null;
  errorsData?: ErrorsData | null;
  hasOrisData: boolean;
  hasUXData: boolean;
  hasCustomAgentData: boolean;
  customAgentMetrics?: Array<{ key: string; negativeCount: number; totalCount: number; issueRate: number }> | null;
  dataWindowDays: number;
  uxMetrics?: Array<{ metricName: string; successRatePct: number; passed: number; evaluatedConversations: number; avgScore: number; threshold: number; status: string }>;
  queriedAt: string;
}

const COMPONENT_ORDER = ["flowEffectiveness", "uxQuality", "stability", "recovery", "safety"];

const SUB_COMPONENT_LABELS: Record<string, string> = {
  closureRate: "Closure Rate",
  resolutionRate: "Resolution Rate",
  efficiencyLoops: "Efficiency & Loops",
  clarity: "Clarity",
  fallbackQuality: "Fallback Quality",
  friction: "Friction",
  errorFree: "Error-Free Execution",
  stabilityProxy: "Efficiency (CIE proxy)",
  latency: "Latency",
  errorLoadScore: "Error Load Score",
  recoverySuccessRate: "Recovery Success Rate",
  loopPrevention: "Loop Prevention",
  caNoApology: "CA: No Apology",
  proactiveAnticipation: "Proactive Anticipation",
  s1Manual: "S1 Manual",
  domainSafety: "Domain Safety",
  toxicity: "Toxicity & Harm",
};

const LangContext = createContext<{ lang: Lang; tr: Translations }>({ lang: "es", tr: getTranslations("es") });

function useLang() {
  return useContext(LangContext);
}

interface Insight {
  priority: "P0" | "P1" | "P2";
  component: string;
  subComponent: string;
  score: number;
  title: string;
  description: string;
  action: string;
  context?: string;
  missingData?: boolean;
}

function generateInsights(fhs: LiveMetrics, tr: Translations, lang: Lang, botId?: string): Insight[] {
  const insights: Insight[] = [];
  const comps = fhs.components;

  const expectsOris = botId ? botExpectsOris(botId) : true;

  if (!fhs.hasOrisData && expectsOris) {
    insights.push({
      priority: "P0",
      component: "General",
      subComponent: "ORIS",
      score: 0,
      title: tr.noOrisInsightTitle,
      description: tr.noOrisInsightDesc,
      action: tr.noOrisInsightAction,
      missingData: true,
    });
  }

  if (!fhs.hasUXData) {
    insights.push({
      priority: "P0",
      component: "General",
      subComponent: "CIE",
      score: 0,
      title: tr.noCieInsightTitle,
      description: tr.noCieInsightDesc,
      action: tr.noCieInsightAction,
      missingData: true,
    });
  }

  const allSubs: { comp: string; compLabel: string; key: string; sub: SubComponent }[] = [];
  for (const [compKey, comp] of Object.entries(comps)) {
    if (!comp || !comp.subComponents) continue;
    for (const [subKey, sub] of Object.entries(comp.subComponents)) {
      allSubs.push({ comp: compKey, compLabel: comp.label, key: subKey, sub: sub as SubComponent });
    }
  }

  const weakSubs = allSubs
    .filter(s => s.sub.available && s.sub.score < 75)
    .sort((a, b) => a.sub.score - b.sub.score);

  const insightKeys: Record<string, { titleKey: keyof Translations; descKey: keyof Translations; actionKey: keyof Translations }> = {
    closureRate: { titleKey: "insightClosureTitle", descKey: "insightClosureDesc", actionKey: "insightClosureAction" },
    resolutionRate: { titleKey: "insightResolutionTitle", descKey: "insightResolutionDesc", actionKey: "insightResolutionAction" },
    efficiencyLoops: { titleKey: "insightEfficiencyTitle", descKey: "insightEfficiencyDesc", actionKey: "insightEfficiencyAction" },
    clarity: { titleKey: "insightClarityTitle", descKey: "insightClarityDesc", actionKey: "insightClarityAction" },
    fallbackQuality: { titleKey: "insightFallbackTitle", descKey: "insightFallbackDesc", actionKey: "insightFallbackAction" },
    friction: { titleKey: "insightFrictionTitle", descKey: "insightFrictionDesc", actionKey: "insightFrictionAction" },
    errorFree: { titleKey: "insightErrorFreeTitle", descKey: "insightErrorFreeDesc", actionKey: "insightErrorFreeAction" },
    stabilityProxy: { titleKey: "insightStabilityTitle", descKey: "insightStabilityDesc", actionKey: "insightStabilityAction" },
    latency: { titleKey: "insightLatencyTitle", descKey: "insightLatencyDesc", actionKey: "insightLatencyAction" },
    proactiveAnticipation: { titleKey: "insightProactiveTitle", descKey: "insightProactiveDesc", actionKey: "insightProactiveAction" },
    loopPrevention: { titleKey: "insightLoopPreventionTitle", descKey: "insightLoopPreventionDesc", actionKey: "insightLoopPreventionAction" },
    errorLoadScore: { titleKey: "insightErrorLoadTitle", descKey: "insightErrorLoadDesc", actionKey: "insightErrorLoadAction" },
  };

  for (const ws of weakSubs) {
    const keys = insightKeys[ws.key];
    if (!keys) continue;
    const priority = ws.sub.score < 30 ? "P0" : ws.sub.score < 50 ? "P1" : ws.sub.score < 60 ? "P2" : "P2";

    const botOverride = botId ? getBotInsightOverride(botId, ws.key, lang) : null;

    insights.push({
      priority,
      component: ws.compLabel,
      subComponent: SUB_COMPONENT_LABELS[ws.key] || ws.key,
      score: ws.sub.score,
      title: tr[keys.titleKey],
      description: botOverride?.desc || tr[keys.descKey],
      action: botOverride?.action || tr[keys.actionKey],
      context: botOverride?.context,
    });
  }

  insights.sort((a, b) => {
    const pOrder = { P0: 0, P1: 1, P2: 2 };
    return pOrder[a.priority] - pOrder[b.priority] || a.score - b.score;
  });

  return insights;
}

function InsightsSection({ fhs, botId }: { fhs: LiveMetrics; botId?: string }) {
  const { tr, lang } = useLang();
  const botType = botId ? getBotType(botId, lang) : null;
  const insights = useMemo(() => generateInsights(fhs, tr, lang, botId), [fhs, tr, lang, botId]);

  if (insights.length === 0) return null;

  const priorityColors = {
    P0: "border-red-300 bg-red-50",
    P1: "border-yellow-300 bg-yellow-50",
    P2: "border-blue-300 bg-blue-50",
  };
  const priorityBadge = {
    P0: "bg-red-100 text-red-700",
    P1: "bg-yellow-100 text-yellow-700",
    P2: "bg-blue-100 text-blue-700",
  };
  const priorityLabel = {
    P0: tr.p0Critical,
    P1: tr.p1Important,
    P2: tr.p2Improvement,
  };

  return (
    <div className="border-t pt-3">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-bold text-muted-foreground uppercase">{tr.insightsTitle}</span>
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{insights.length}</Badge>
      </div>
      {botType && (
        <div className="mb-3 ml-6 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-muted-foreground italic">
          {botType}
        </div>
      )}
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className={`border rounded-lg px-3 py-2 text-xs ${priorityColors[insight.priority]}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-[9px] px-1.5 py-0 h-4 border-none font-bold ${priorityBadge[insight.priority]}`}>
                {insight.priority}
              </Badge>
              {!insight.missingData && (
                <span className="text-muted-foreground">{insight.subComponent}: {insight.score}%</span>
              )}
              {insight.missingData && (
                <span className="text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> {tr.missingDataLabel}</span>
              )}
            </div>
            <div className="flex items-start gap-1.5 text-foreground">
              <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span>{insight.action}</span>
            </div>
            {(insight.description || insight.context) && (
              <details className="mt-1.5">
                <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                  <Info className="h-3 w-3 flex-shrink-0" />
                  <span>{tr.contextLabel}</span>
                </summary>
                <div className="bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-2 mt-1 text-[11px] space-y-1.5">
                  {insight.description && (
                    <p className="text-foreground/80">{insight.description}</p>
                  )}
                  {insight.context && (
                    <p className="text-muted-foreground italic">{insight.context}</p>
                  )}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorDrilldown({ botId, errorsData }: { botId: string; errorsData: ErrorsData }) {
  const { tr } = useLang();
  const [showDetails, setShowDetails] = useState(false);
  const { data: errorDetails, isLoading: detailsLoading } = useQuery<BotErrorDetail[]>({
    queryKey: ['/api/langsmith/bot-errors', botId],
    queryFn: async () => {
      const res = await fetch(`/api/langsmith/bot-errors?bot=${encodeURIComponent(botId)}`);
      if (!res.ok) throw new Error('Failed to fetch error details');
      return res.json();
    },
    enabled: showDetails,
  });

  const scoreColor = errorsData.errorLoadScore >= 80 ? 'text-green-600' : errorsData.errorLoadScore >= 65 ? 'text-yellow-600' : 'text-red-600';
  const severityBadge: Record<string, string> = {
    URGENTE: 'bg-red-100 text-red-700',
    ATENCION: 'bg-yellow-100 text-yellow-700',
    PENDIENTE: 'bg-blue-100 text-blue-700',
    CRONICO: 'bg-slate-100 text-slate-700',
  };

  const categories = errorsData.categoryBreakdown
    ? Object.entries(errorsData.categoryBreakdown).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="border-t pt-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-bold text-muted-foreground uppercase">{tr.errorDrilldownTitle}</span>
        <span className="text-xs text-muted-foreground">Score:</span>
        <span className={`font-bold text-sm ${scoreColor}`}>{errorsData.errorLoadScore}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <div className="bg-red-50 dark:bg-red-950/30 rounded px-2 py-1.5 text-xs">
          <div className="text-muted-foreground">{tr.errorActiveErrors}</div>
          <div className="font-bold text-red-600">{errorsData.activeErrors}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1.5 text-xs">
          <div className="text-muted-foreground">{tr.errorUnseenErrors}</div>
          <div className="font-bold text-amber-600">{errorsData.unseenErrors}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-2 py-1.5 text-xs">
          <div className="text-muted-foreground">{tr.errorNewThisWeek}</div>
          <div className="font-bold text-blue-600">{errorsData.newThisWeek}</div>
        </div>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {categories.map(([cat, count]) => (
            <span key={cat} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 text-[10px] font-mono" data-testid={`badge-cat-${cat}`}>
              <span className="text-muted-foreground">{cat}</span>
              <span className="font-bold">{count}</span>
            </span>
          ))}
        </div>
      )}
      {errorsData.activeErrors > 0 && !showDetails && (
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowDetails(true)} data-testid={`button-error-details-${botId}`}>
          {tr.errorDrilldownDesc}
        </Button>
      )}
      {showDetails && detailsLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {tr.loading}
        </div>
      )}
      {showDetails && errorDetails && errorDetails.length > 0 && (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs border-collapse" data-testid={`table-errors-${botId}`}>
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{tr.errorColStep}</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{tr.errorColType}</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{tr.errorColSeverity}</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{tr.errorColDiagnosis}</th>
                <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{tr.errorColAction}</th>
                <th className="px-2 py-1.5 text-right font-medium text-muted-foreground">{tr.errorColOccurrences}</th>
                <th className="px-2 py-1.5 text-right font-medium text-muted-foreground">{tr.errorColAge}</th>
              </tr>
            </thead>
            <tbody>
              {errorDetails.map((err, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-2 py-1.5 font-mono max-w-[120px] truncate" title={err.step}>{err.step}</td>
                  <td className="px-2 py-1.5">{err.type}</td>
                  <td className="px-2 py-1.5">
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 border-none ${severityBadge[err.severity] || 'bg-slate-100 text-slate-700'}`}>
                      {err.severity}
                    </Badge>
                    {err.isNewThisWeek && <Badge className="ml-1 text-[8px] px-1 py-0 h-3.5 border-none bg-blue-100 text-blue-700">{tr.errorColNew}</Badge>}
                  </td>
                  <td className="px-2 py-1.5 max-w-[200px]" title={err.diagnosis}>{err.diagnosis}</td>
                  <td className="px-2 py-1.5 max-w-[200px]" title={err.recommendedAction}>{err.recommendedAction}</td>
                  <td className="px-2 py-1.5 text-right font-bold">{err.occurrences}</td>
                  <td className="px-2 py-1.5 text-right">{err.ageDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LanguageSelector({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const langs: Lang[] = ["es", "en", "pt"];
  const labels: Record<Lang, string> = { es: "ES", en: "EN", pt: "PT" };
  return (
    <div className="flex items-center gap-0" data-testid="language-selector">
      {langs.map((l, i) => (
        <div key={l} className="flex items-center">
          {i > 0 && <div className="w-px h-4 bg-border mx-1" />}
          <button
            onClick={() => setLang(l)}
            className={`text-sm font-bold px-1.5 py-0.5 rounded transition-colors ${lang === l ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            data-testid={`button-lang-${l}`}
          >
            {labels[l]}
          </button>
        </div>
      ))}
    </div>
  );
}

function KPIExplanation() {
  const { tr } = useLang();
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {tr.kpiGuide}
        </CardTitle>
        <CardDescription>
          {tr.kpiGuideDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="fhs">
            <AccordionTrigger className="text-sm font-bold uppercase tracking-wide">
              {tr.fhsPostLaunch}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm text-muted-foreground">
              <p>{tr.fhsExplanation}</p>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-primary/10 space-y-3">
                <div className="font-bold text-foreground">{tr.officialFormula}</div>
                <code className="text-[10px] block bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  FHS = 0.30 x A + 0.30 x B + 0.20 x C + 0.15 x D + 0.05 x E
                </code>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-foreground">A - Flow Effectiveness (30%)</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>50% Closure Rate (CIE)</li>
                      <li>30% Resolution Rate (70% CIE + 30% ORIS)</li>
                      <li>20% Blocking Error Rate (Flowbuilder)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-foreground">B - UX & Flow Quality (30%)</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>30% Efficiency & Loops (CIE: efficiency + loop_prevention)</li>
                      <li>30% Clarity (60% CIE + 40% ORIS)</li>
                      <li>20% Fallback Quality (ORIS: knowledge_fallback)</li>
                      <li>20% Friction (60% CIE + 25% ORIS frustration + 15% ORIS apology)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-foreground">C - Stability & Reliability (20%)</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>20% Error-Free (ORIS primary, Flowbuilder secondary)</li>
                      <li>30% Efficiency (CIE)</li>
                      <li>25% Latency P50 (Flowbuilder)</li>
                      <li>25% Error Load Score (Errors API)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-foreground">D - Recovery & Resilience (15%)</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>35% Fallback Quality (ORIS primary, Flowbuilder secondary)</li>
                      <li>30% Recovery Success Rate (Flowbuilder)</li>
                      <li>20% Loop Prevention (CIE)</li>
                      <li>15% Proactive Anticipation (CIE)</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-foreground">E - Safety (5%)</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs">
                    <li>{tr.s1Pending}</li>
                    <li>S2: domain_safety (ORIS)</li>
                    <li>S3: toxicity_and_harmfulness (ORIS)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="glrs">
            <AccordionTrigger className="text-sm font-bold uppercase tracking-wide">
              {tr.glrsPreLaunch}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm text-muted-foreground">
              <p>{tr.glrsExplanation}</p>
              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-primary/10">
                <div className="font-bold text-foreground">{tr.readinessPillars}</div>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li><strong>Coverage:</strong> {tr.coverageDesc}</li>
                  <li><strong>Robustness:</strong> {tr.robustnessDesc}</li>
                  <li><strong>Evals:</strong> {tr.evalsDesc}</li>
                  <li><strong>Tech & Ops:</strong> {tr.techOpsDesc}</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function ComponentScoreBar({ component, name }: { component: FHSComponent; name: string }) {
  const { tr } = useLang();
  const availableSubs = Object.values(component.subComponents).filter(s => s.available).length;
  const totalSubs = Object.values(component.subComponents).length;
  const color = component.score >= 60 ? 'bg-green-500' : component.score >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold">{component.label}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{Math.round(component.weight * 100)}%</span>
          <span className="text-sm font-bold">{component.score}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${component.score}%` }} />
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {availableSubs < totalSubs && (
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {totalSubs - availableSubs} {tr.subComponentPending}
          </span>
        )}
        {availableSubs === totalSubs && (
          <span className="flex items-center gap-0.5 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {tr.complete}
          </span>
        )}
      </div>
    </div>
  );
}

interface BotFHSResult {
  botId: string;
  fhs: LiveMetrics;
}

interface AccountFeature {
  accountId: string;
  flowType: string;
  totalActivities: number;
  agentCount: number;
  webhookCount: number;
  moduleCount: number;
  purposes: string;
  modules: Record<string, boolean>;
}

const MODULE_GROUPS: Record<string, { labelKey: string; modules: string[] }> = {
  structure: { labelKey: 'moduleGroupStructure', modules: ['f_entry_point', 'f_registro', 'f_autenticacion', 'f_catalogo', 'f_pedidos', 'f_metodos_pago', 'f_soporte', 'f_sales_desk'] },
  transactional: { labelKey: 'moduleGroupTransactional', modules: ['f_one_chat_buy', 'f_carrusel_atc', 'f_webview_cart', 'f_suggested_order', 'f_order_reminder', 'f_boleto'] },
  loyalty: { labelKey: 'moduleGroupLoyalty', modules: ['f_loyalty', 'f_cashback', 'f_cupones', 'f_concurso', 'f_promociones'] },
  ai: { labelKey: 'moduleGroupAI', modules: ['f_voice_agent', 'f_knowledge_genie', 'f_sales_agent_ai', 'f_yalo_force', 'f_smalltalk'] },
  profile: { labelKey: 'moduleGroupProfile', modules: ['f_perfilador', 'f_subscribe', 'f_optin', 'f_tyc'] },
  feedback: { labelKey: 'moduleGroupFeedback', modules: ['f_csat', 'f_nps', 'f_encuesta'] },
  human: { labelKey: 'moduleGroupHuman', modules: ['f_live_agent', 'f_business_hours'] },
  outbound: { labelKey: 'moduleGroupOutbound', modules: ['f_campaigns'] },
};

const MODULE_DISPLAY: Record<string, string> = {
  f_entry_point: 'Entry Point', f_registro: 'Registro', f_autenticacion: 'Auth', f_catalogo: 'Catalogo',
  f_pedidos: 'Pedidos', f_metodos_pago: 'Pagos', f_soporte: 'Soporte', f_sales_desk: 'Sales Desk',
  f_one_chat_buy: 'One Chat Buy', f_carrusel_atc: 'Carrusel ATC', f_webview_cart: 'Webview Cart',
  f_suggested_order: 'Suggested Order', f_order_reminder: 'Order Reminder', f_boleto: 'Boleto',
  f_loyalty: 'Loyalty', f_cashback: 'Cashback', f_cupones: 'Cupones', f_concurso: 'Concurso', f_promociones: 'Promo',
  f_voice_agent: 'Voice Agent', f_knowledge_genie: 'Knowledge Genie', f_sales_agent_ai: 'Sales Agent AI',
  f_yalo_force: 'Yalo Force', f_smalltalk: 'Smalltalk',
  f_perfilador: 'Perfilador', f_subscribe: 'Subscribe', f_optin: 'Opt-in', f_tyc: 'TyC',
  f_csat: 'CSAT', f_nps: 'NPS', f_encuesta: 'Encuesta',
  f_live_agent: 'Live Agent', f_business_hours: 'Business Hours',
  f_campaigns: 'Campaigns',
};

const GROUP_COLORS: Record<string, string> = {
  structure: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  transactional: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  loyalty: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ai: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  profile: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  feedback: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  human: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  outbound: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

function getComplexityTier(moduleCount: number): 'basic' | 'medium' | 'high' {
  if (moduleCount >= 18) return 'high';
  if (moduleCount >= 10) return 'medium';
  return 'basic';
}

function getComplexityLabel(tier: 'basic' | 'medium' | 'high', tr: any): string {
  if (tier === 'high') return tr.complexityHigh;
  if (tier === 'medium') return tr.complexityMedium;
  return tr.complexityBasic;
}

function getComplexityColor(tier: 'basic' | 'medium' | 'high'): string {
  if (tier === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (tier === 'medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
  return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
}

const TRACKED_BOTS = [
  { id: "wa-gr1916-grupolala", label: "LALA MX B2B" },
  { id: "wa-ba1758-bafar", label: "BAFAR MX B2B" },
  { id: "wa-po1804-postobon", label: "Postobon CO B2B" },
  { id: "ne1374-nespresso-wa-ng-br", label: "Nespresso BR" },
  { id: "wa-g-1948-greal-rmp", label: "Greal RMP" },
  { id: "wa-ke1770-kellanova", label: "Kellanova" },
  { id: "wa-g-1948-greal-disape", label: "Greal Disape" },
  { id: "compra-agora-ng-wa-br", label: "Compra Agora BR" },
  { id: "wa-fr1941-fruki-prd", label: "Fruki BR" },
  { id: "rommac-caboclo-wa-br", label: "Caboclo BR" },
  { id: "rommac-rommac-wa-br", label: "Rommac BR" },
  { id: "wa-ne1777-nestle-professional-production", label: "Nestle Professional" },
  { id: "nestle-mx-b2b", label: "Nestle MX B2B" },
  { id: "wa-ne1374-moment-n", label: "Moment N (Nespresso)" },
  { id: "ng-femsa-wae-br-prd", label: "FEMSA WAE BR" },
  { id: "nadro-mx-b2b", label: "Nadro MX B2B" },
  { id: "hbc-ng-b2b", label: "HBC B2B" },
  { id: "wa-cc1661-ccu-cl-b2b", label: "CCU Chile B2B" },
  { id: "wa-mo1662-ecuador-production", label: "Mondelez Ecuador" },
  { id: "mo1561-mondelez-peru-b2b", label: "Mondelez Peru B2B" },
  { id: "wa-mo1533-mondelez-argentina", label: "Mondelez Argentina" },
  { id: "wa-ga2103-gabrica-colombia", label: "Gabrica Colombia" },
  { id: "wa-mo1564-mondelez-uruguay", label: "Mondelez Uruguay" },
  { id: "wa-un1912-napolita-ecuador", label: "Napolita Ecuador" },
  { id: "mo1569-mondelezbr", label: "Mondelez BR" },
  { id: "unilever_b2b", label: "Unilever B2B" },
  { id: "wa-pe1814-penafiel-mx", label: "Penafiel MX" },
  { id: "alpina-wa-col-prd", label: "Alpina Colombia" },
  { id: "at1551-atacadao-wa-br", label: "Atacadao BR" },
  { id: "bepensa-mx-prd", label: "Bepensa MX" },
  { id: "bepensa-rd-prd", label: "Bepensa RD" },
  { id: "ism-dr-beverages", label: "ISM DR Beverages" },
  { id: "molitalia-pe-b2b", label: "Molitalia Peru B2B" },
  { id: "mondelez-mx-b2b", label: "Mondelez MX B2B" },
  { id: "nestle-chile-b2b", label: "Nestle Chile B2B" },
  { id: "nestle-jmc-prd", label: "Nestle JMC" },
  { id: "ng-femsa-wae-ar-prd", label: "FEMSA WAE AR" },
  { id: "ng-femsa-wae-co-prd", label: "FEMSA WAE CO" },
  { id: "ng-femsa-wae-cr-prd", label: "FEMSA WAE CR" },
  { id: "ng-femsa-wae-gt-prd", label: "FEMSA WAE GT" },
  { id: "ng-femsa-wae-ni-prd", label: "FEMSA WAE NI" },
  { id: "ng-femsa-wae-pa-prd", label: "FEMSA WAE PA" },
  { id: "ng-femsa-wae-uy-prd", label: "FEMSA WAE UY" },
  { id: "unilever-ecu-hpc-prd", label: "Unilever ECU HPC" },
  { id: "unilever-ecu-ic-prd", label: "Unilever ECU IC" },
  { id: "wa-bo1917-bowen-bowen-prod", label: "Bowen Bowen" },
  { id: "wa-ca1641-carozzi-ch", label: "Carozzi Chile" },
  { id: "wa-ce2212-cesar-iglesias-prod", label: "Cesar Iglesias" },
  { id: "wa-co2107-colgatepalmolive-prd", label: "Colgate Palmolive" },
  { id: "wa-di1984-diana-sv", label: "Diana SV" },
  { id: "wa-en1992-enex-chile", label: "Enex Chile" },
  { id: "wa-fe2082-feduro-panama", label: "Feduro Panama" },
  { id: "wa-gr1794-grupo-nieto", label: "Grupo Nieto" },
  { id: "wa-hb2210-hbc-egypt", label: "HBC Egypt" },
  { id: "wa-hi1949-hico-prod", label: "HICO" },
  { id: "wa-it1752-italcol", label: "Italcol" },
  { id: "wa-ju2133-jumex-prod", label: "Jumex" },
  { id: "wa-me1772-mercedes-b2c", label: "Mercedes B2C" },
  { id: "wa-mi1920-minsa-prod", label: "Minsa" },
  { id: "wa-mo1565-mondelez-col-b2b-prd", label: "Mondelez Colombia B2B" },
  { id: "wa-ne1614-nestle-ven", label: "Nestle Venezuela" },
  { id: "wa-ne2096-nestle-professional-chile", label: "Nestle Prof Chile" },
  { id: "wa-ne2120-nestle-professional-mx", label: "Nestle Prof MX" },
  { id: "wa-pd1665-pdc-codisa", label: "PDC Codisa" },
  { id: "wa-pd1665-pdc-codisa-el-salvador", label: "PDC Codisa SV" },
  { id: "wa-pd2191-pdc-lakasa-peru", label: "PDC Lakasa Peru" },
  { id: "pepsico-chile", label: "Pepsico Chile" },
  { id: "wa-pe1786-pepsico-col", label: "Pepsico Colombia" },
  { id: "wa-pe2101-pepsico-rep-dominicana", label: "Pepsico RD" },
  { id: "wa-pe2347-pepsico-peru-prd", label: "Pepsico Peru" },
  { id: "wa-pr1764-profarco-pgy", label: "Profarco Paraguay" },
  { id: "wa-pr1781-pronaca", label: "Pronaca" },
  { id: "wa-pr1905-proan", label: "Proan" },
  { id: "wa-ra1675-raizen-flow", label: "Raizen BR" },
  { id: "wa-ri1653-rica-mx-b2b", label: "Rica MX B2B" },
  { id: "wa-su1932-production-sukarnemx", label: "Sukarne MX" },
  { id: "wa-to2105-socios-tosticentro-mx-prd", label: "Tosticentro MX" },
  { id: "wa-si2185-sirvis-italy", label: "Sirvis Italy" },
  { id: "wa-un2089-blito", label: "Blito (Unilever)" },
  { id: "wa-un2089-kiki-production", label: "Kiki (Unilever)" },
  { id: "wa-un2093-unilever-ecu-ice-b2b2c", label: "Unilever ECU ICE" },
];

const BOT_LABELS: Record<string, string> = Object.fromEntries(TRACKED_BOTS.map(b => [b.id, b.label]));

function LoginPage() {
  const [theme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('projectflow-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xl">Y</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Yalo KPI Hub</h1>
          </div>
          <p className="text-white/70 text-sm uppercase font-bold tracking-widest">Flow Health & Readiness</p>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">AI Agent Flow Health Monitoring</h2>
          <p className="text-white/80 text-lg">Track FHS scores, monitor bot performance, and manage AI agent lifecycles across all accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-white/60" />
          <p className="text-white/60 text-xs">Internal Yalo platform</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">Y</div>
            <h1 className="text-2xl font-bold tracking-tight">Yalo KPI Hub</h1>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Iniciar sesion</h2>
            <p className="text-muted-foreground text-sm mt-2">Solo cuentas @yalo.com y @yalocontractor.com</p>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => { window.location.href = '/api/login'; }}
            data-testid="button-login"
          >
            Iniciar sesion con Google
          </Button>
          <p className="text-xs text-muted-foreground">Al iniciar sesion, confirmas que eres parte del equipo Yalo.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isLoading: authLoading, isAuthenticated: isAuthed, logout } = useAuth();
  const [viewMode, setViewMode] = useState<'dashboard' | 'preparation' | 'botFHS'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'atRisk' | 'critical'>('all');
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [botSelectorOpen, setBotSelectorOpen] = useState(false);
  const botSelectorRef = useRef<HTMLDivElement>(null);
  const [dashSearchTerm, setDashSearchTerm] = useState('');
  const [dashSearchOpen, setDashSearchOpen] = useState(false);
  const dashSearchRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('projectflow-lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'es';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('projectflow-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('projectflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (botSelectorRef.current && !botSelectorRef.current.contains(e.target as Node)) {
        setBotSelectorOpen(false);
      }
      if (dashSearchRef.current && !dashSearchRef.current.contains(e.target as Node)) {
        setDashSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tr = useMemo(() => getTranslations(lang), [lang]);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('projectflow-lang', l);
  };

  const localeMap: Record<Lang, string> = { es: 'es-MX', en: 'en-US', pt: 'pt-BR' };

  const { data: projects = [], isLoading } = useQuery<Project[]>({ 
    queryKey: ['/api/projects'] 
  });

  const { data: liveMetrics, isLoading: metricsLoading, error: metricsError } = useQuery<LiveMetrics>({
    queryKey: ['/api/langsmith/metrics'],
    enabled: viewMode === 'dashboard',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const botIds = TRACKED_BOTS.map(b => b.id).join(",");
  const { data: botFHSData, isLoading: botFHSLoading, error: botFHSError } = useQuery<BotFHSResult[]>({
    queryKey: ['/api/langsmith/bots', botIds],
    queryFn: () => fetch(`/api/langsmith/bots?bots=${encodeURIComponent(botIds)}`).then(r => { if (!r.ok) throw new Error('Error'); return r.json(); }),
    enabled: viewMode === 'botFHS' || viewMode === 'dashboard',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: errorDistData, isLoading: errorDistLoading } = useQuery<ErrorDistribution[]>({
    queryKey: ['/api/langsmith/error-distribution'],
    enabled: viewMode === 'dashboard',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: accountFeaturesData } = useQuery<AccountFeature[]>({
    queryKey: ['/api/langsmith/account-features'],
    queryFn: () => fetch('/api/langsmith/account-features').then(r => { if (!r.ok) throw new Error('Error'); return r.json(); }),
    enabled: viewMode === 'botFHS' || viewMode === 'dashboard',
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const accountFeaturesMap = useMemo(() => {
    const map = new Map<string, AccountFeature>();
    if (accountFeaturesData) {
      for (const af of accountFeaturesData) {
        map.set(af.accountId, af);
      }
    }
    return map;
  }, [accountFeaturesData]);

  const stats = useMemo(() => {
    const preLaunch = projects.filter(p => !p.isLaunched);
    const launched = projects.filter(p => p.isLaunched);
    return {
      total: projects.length,
      preLaunch: preLaunch.length,
      launched: launched.length,
      avgReadiness: Math.round(preLaunch.reduce((acc, p) => acc + (p.readinessScore || 0), 0) / (preLaunch.length || 1)),
      avgFHS: Math.round(launched.reduce((acc, p) => acc + ((p.fhs as any)?.overall || 0), 0) / (launched.length || 1)),
    };
  }, [projects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (viewMode === 'preparation') return matchesSearch && !p.isLaunched;
    return matchesSearch;
  });

  const filteredBots = useMemo(() => {
    if (!botFHSData) return [];
    let filtered = botFHSData;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bot => {
        const score = bot.fhs?.overall ?? 0;
        if (statusFilter === 'healthy') return score >= 80;
        if (statusFilter === 'atRisk') return score >= 65 && score < 80;
        return score < 65;
      });
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(bot =>
        bot.botId.toLowerCase().includes(q) ||
        (BOT_LABELS[bot.botId] || '').toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => (BOT_LABELS[a.botId] || a.botId).localeCompare(BOT_LABELS[b.botId] || b.botId));
  }, [botFHSData, searchTerm, statusFilter]);

  const selectedBot = useMemo(() => {
    if (!botFHSData) return null;
    if (selectedBotId) {
      const found = botFHSData.find(b => b.botId === selectedBotId);
      if (found) return found;
    }
    return filteredBots[0] || botFHSData[0] || null;
  }, [botFHSData, selectedBotId, filteredBots]);

  const getFHSStatus = (score: number) => {
    if (score >= 80) return { label: tr.healthy, color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 65) return { label: tr.atRisk, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: tr.critical, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const FHSCard = ({ project }: { project: Project }) => {
    const fhsData = project.fhs as any;
    const status = getFHSStatus(fhsData?.overall || 0);
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-fhs-${project.id}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge className={`${status.bg} ${status.color} border-none`}>{status.label}</Badge>
          </div>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold tracking-tight">{fhsData?.overall || 0}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Flow Health Score</div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries((fhsData?.components || {}) as Record<string, number>).map(([key, val]) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${val}%` }} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: {val}%</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const GLRSCard = ({ project }: { project: Project }) => {
    const glrsData = project.glrs as any;
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-glrs-${project.id}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant={glrsData?.status === 'GO' ? 'default' : 'secondary'}>{glrsData?.status || 'N/A'}</Badge>
          </div>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold tracking-tight">{glrsData?.overall || 0}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Readiness Score (GLRS)</div>
          </div>
          <Progress value={glrsData?.overall || 0} className="h-2" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries((glrsData?.pillars || {}) as Record<string, number>).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key}</span>
                <span className="font-bold">{val}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen">{tr.loading}</div>;

  if (!isAuthed) return <LoginPage />;

  if (isLoading) return <div className="flex items-center justify-center h-screen">{tr.loading}</div>;

  return (
    <LangContext.Provider value={{ lang, tr }}>
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex">
      <aside className="w-64 bg-white dark:bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">Y</div>
            <h1 className="text-xl font-bold tracking-tight">{tr.projectsTitle}</h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{tr.enterpriseManagement}</p>
        </div>
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight" data-testid="text-internal-disclaimer">{tr.internalOnly}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant={viewMode === 'dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => setViewMode('dashboard')} data-testid="button-nav-dashboard">
            <Home size={18} /> {tr.dashboard}
          </Button>
          <Button variant={viewMode === 'preparation' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => setViewMode('preparation')} data-testid="button-nav-glrs">
            <Target size={18} /> {tr.glrsPrep}
          </Button>
          <Button variant={viewMode === 'botFHS' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" onClick={() => setViewMode('botFHS')} data-testid="button-nav-bot-fhs">
            <Activity size={18} /> {tr.fhsPerBot}
          </Button>
        </nav>
        {isAuthed && user && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-2 px-2">
            {user.profileImageUrl && <img src={user.profileImageUrl} alt="" className="h-6 w-6 rounded-full" />}
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => logout()} data-testid="button-logout">
            <LogOut size={16} /> Cerrar sesion
          </Button>
        </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-card border-b flex items-center justify-between px-8">
          <div />
          <div className="flex items-center gap-4">
            <LanguageSelector lang={lang} setLang={handleSetLang} />
            <div className="w-px h-6 bg-border" />
            <Button size="icon" variant="outline" className="rounded-full" onClick={toggleTheme} data-testid="button-toggle-theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <div className="w-px h-6 bg-border" />
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-tighter">{tr.fhsLive}</div>
              <div className="text-lg font-black text-primary leading-none">{liveMetrics?.overall ?? '--'}</div>
            </div>
            <Button size="icon" variant="outline" className="rounded-full" data-testid="button-add"><Plus size={18} /></Button>
          </div>
        </header>

        <div className="p-8 overflow-auto space-y-8">
          {viewMode === 'dashboard' ? (
            <div className="space-y-8">
              {(botFHSLoading) && (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {tr.queryingBQ}
                </div>
              )}

              {botFHSData && (() => {
                const bots = botFHSData;
                const total = bots.length;
                const healthyBots = bots.filter((b: BotFHSResult) => b.fhs.overall >= 80);
                const atRiskBots = bots.filter((b: BotFHSResult) => b.fhs.overall >= 65 && b.fhs.overall < 80);
                const criticalBots = bots.filter((b: BotFHSResult) => b.fhs.overall < 65);
                const healthyPct = total ? Math.round((healthyBots.length / total) * 100) : 0;
                const atRiskPct = total ? Math.round((atRiskBots.length / total) * 100) : 0;
                const criticalPct = total ? 100 - healthyPct - atRiskPct : 0;
                const sorted = [...bots].sort((a: BotFHSResult, b: BotFHSResult) => a.fhs.overall - b.fhs.overall);
                const bottomCount = Math.min(5, total);
                const bottom5 = sorted.slice(0, bottomCount);

                return (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative w-80" ref={dashSearchRef}>
                        <button
                          className="w-full flex items-center justify-between border rounded-lg px-4 py-2.5 bg-white dark:bg-card text-sm hover:border-primary/50 transition-colors"
                          onClick={() => setDashSearchOpen(!dashSearchOpen)}
                          data-testid="button-dash-search"
                        >
                          <span className="text-muted-foreground">{tr.searchBotPlaceholder}</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dashSearchOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dashSearchOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border rounded-lg shadow-lg z-50 overflow-hidden" data-testid="dropdown-dash-search">
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                  placeholder={tr.searchBotPlaceholder}
                                  className="pl-8 h-8 text-sm"
                                  value={dashSearchTerm}
                                  onChange={(e) => setDashSearchTerm(e.target.value)}
                                  autoFocus
                                  data-testid="input-dash-search"
                                />
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {(() => {
                                const q = dashSearchTerm.toLowerCase();
                                const matches = [...TRACKED_BOTS]
                                  .sort((a, b) => a.label.localeCompare(b.label))
                                  .filter(b => !q || b.label.toLowerCase().includes(q) || b.id.toLowerCase().includes(q))
                                  .slice(0, 12);
                                if (matches.length === 0) return (
                                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">{tr.noBotsFound}</div>
                                );
                                return matches.map(b => {
                                  const botData = botFHSData?.find((bd: BotFHSResult) => bd.botId === b.id);
                                  const score = botData?.fhs.overall;
                                  const statusColor = score !== undefined ? (score >= 80 ? 'text-green-600' : score >= 65 ? 'text-yellow-600' : 'text-red-600') : 'text-muted-foreground';
                                  return (
                                    <button
                                      key={b.id}
                                      className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between text-sm"
                                      onClick={() => {
                                        setSelectedBotId(b.id);
                                        setSearchTerm('');
                                        setDashSearchTerm('');
                                        setDashSearchOpen(false);
                                        setViewMode('botFHS');
                                      }}
                                      data-testid={`dash-search-item-${b.id}`}
                                    >
                                      <div className="min-w-0">
                                        <div className="font-medium truncate">{b.label}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{b.id}</div>
                                      </div>
                                      {score !== undefined && (
                                        <span className={`text-xs font-bold ${statusColor} flex-shrink-0 ml-2`}>{score}</span>
                                      )}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/langsmith/bots', botIds] });
                        }}
                        disabled={botFHSLoading}
                        data-testid="button-refresh-dashboard"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${botFHSLoading ? 'animate-spin' : ''}`} />
                        {tr.refresh}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white border-none">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">{tr.totalLive}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-5xl font-black" data-testid="text-total-live">{total}</div>
                          <div className="text-xs opacity-60 mt-1">{tr.weeklyFhsTracking}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white border-none">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
                            {tr.healthy}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-5xl font-black text-green-600 dark:text-green-400" data-testid="text-healthy-count">{healthyBots.length}</div>
                          <div className="text-xs opacity-60 mt-1">{healthyPct}% — FHS &ge; 80</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white border-none">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 inline-block" />
                            {tr.atRisk}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-5xl font-black text-yellow-600 dark:text-yellow-400" data-testid="text-atrisk-count">{atRiskBots.length}</div>
                          <div className="text-xs opacity-60 mt-1">{atRiskPct}% — FHS 65–79</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white border-none">
                        <CardHeader className="pb-1">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                            {tr.critical}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-5xl font-black text-red-600 dark:text-red-400" data-testid="text-critical-count">{criticalBots.length}</div>
                          <div className="text-xs opacity-60 mt-1">{criticalPct}% — FHS &lt; 65</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tr.healthDistribution}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 rounded-full overflow-hidden flex" data-testid="bar-health-distribution">
                          {healthyPct > 0 && <div className="bg-green-500 transition-all" style={{ width: `${healthyPct}%` }} />}
                          {atRiskPct > 0 && <div className="bg-yellow-500 transition-all" style={{ width: `${atRiskPct}%` }} />}
                          {criticalPct > 0 && <div className="bg-red-500 transition-all" style={{ width: `${criticalPct}%` }} />}
                        </div>
                        <div className="flex gap-6 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> {tr.healthy} {healthyBots.length}/{total} ({healthyPct}%)</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" /> {tr.atRisk} {atRiskBots.length}/{total} ({atRiskPct}%)</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> {tr.critical} {criticalBots.length}/{total} ({criticalPct}%)</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {tr.bottomAccounts.replace('{count}', String(bottomCount))}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {bottom5.map((bot: BotFHSResult) => {
                            const status = getFHSStatus(bot.fhs.overall);
                            const pct = Math.min(100, Math.max(0, bot.fhs.overall));
                            const strokeColor = bot.fhs.overall >= 80 ? '#22c55e' : bot.fhs.overall >= 65 ? '#eab308' : '#ef4444';
                            const expectsOrisBot = botExpectsOris(bot.botId);
                            return (
                              <div key={bot.botId} className="flex items-center gap-4 py-2 border-b last:border-b-0" data-testid={`bottom-bot-${bot.botId}`}>
                                <div className="relative h-14 w-14 flex-shrink-0">
                                  <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                                    <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray={`${pct * 0.974} 100`} strokeLinecap="round" />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: strokeColor }}>
                                    {bot.fhs.overall}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm truncate">{BOT_LABELS[bot.botId] || bot.botId}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <span className="font-mono">{bot.botId.split('-').slice(-1)[0]}</span>
                                    {!bot.fhs.hasOrisData && !expectsOrisBot && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">No ORIS</Badge>
                                    )}
                                    {bot.fhs.hasCustomAgentData && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-purple-600 border-purple-300">CA</Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className={`${status.bg} ${status.color} border-none text-xs`}>{status.label}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {errorDistData && errorDistData.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tr.errorDistTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm" data-testid="table-error-distribution">
                              <thead>
                                <tr className="border-b border-slate-300 dark:border-slate-700 text-xs text-muted-foreground uppercase tracking-wider">
                                  <th className="text-left py-2 px-3 font-medium">{tr.errorDistType}</th>
                                  <th className="text-center py-2 px-3 font-medium">{tr.errorDistUniqueErrors}</th>
                                  <th className="text-center py-2 px-3 font-medium">{tr.errorDistOccurrences}</th>
                                  <th className="text-center py-2 px-3 font-medium">{tr.errorDistBotsAffected}</th>
                                  <th className="text-right py-2 px-3 font-medium">{tr.errorDistPct}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {errorDistData.map((row) => (
                                  <tr key={row.type} className="border-b last:border-b-0 border-slate-200 dark:border-slate-800" data-testid={`row-error-dist-${row.type}`}>
                                    <td className="py-2 px-3 font-medium">{row.type}</td>
                                    <td className="py-2 px-3 text-center tabular-nums">{row.uniqueErrors.toLocaleString()}</td>
                                    <td className="py-2 px-3 text-center tabular-nums">{row.totalOccurrences.toLocaleString()}</td>
                                    <td className="py-2 px-3 text-center tabular-nums">{row.botsAffected}</td>
                                    <td className="py-2 px-3 text-right tabular-nums">
                                      <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                          <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, row.pctOccurrences)}%` }} />
                                        </div>
                                        <span>{row.pctOccurrences}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {bots && bots.length > 0 && (() => {
                      const AI_MODULES = ['f_sales_agent_ai', 'f_knowledge_genie', 'f_voice_agent'];
                      const gaps: Array<{ botId: string; name: string; expectsOris: boolean; hasOris: boolean; expectsCA: boolean; hasCA: boolean; aiModules: string[] }> = [];
                      for (const bot of bots) {
                        const expectsOris = botExpectsOris(bot.botId);
                        const hasOris = bot.fhs.hasOrisData;
                        const af = accountFeaturesMap.get(bot.botId);
                        const aiModules = af ? AI_MODULES.filter(m => af.modules[m]) : [];
                        const expectsCA = aiModules.length > 0;
                        const hasCA = bot.fhs.hasCustomAgentData;
                        if ((expectsOris && !hasOris) || (expectsCA && !hasCA)) {
                          gaps.push({ botId: bot.botId, name: BOT_LABELS[bot.botId] || bot.botId, expectsOris, hasOris, expectsCA, hasCA, aiModules });
                        }
                      }
                      if (gaps.length === 0) return null;
                      return (
                        <Card className="border-amber-200 dark:border-amber-800" data-testid="card-data-gaps">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              <div>
                                <CardTitle className="text-lg font-bold">{tr.dataGapsTitle} ({gaps.length})</CardTitle>
                                <CardDescription className="text-xs">{tr.dataGapsDesc}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm" data-testid="table-data-gaps">
                                <thead>
                                  <tr className="border-b text-xs text-muted-foreground uppercase tracking-wider">
                                    <th className="text-left py-2 px-3 font-medium">{tr.dataGapsCol}</th>
                                    <th className="text-center py-2 px-3 font-medium">{tr.dataGapsColOris}</th>
                                    <th className="text-center py-2 px-3 font-medium">{tr.dataGapsColCA}</th>
                                    <th className="text-left py-2 px-3 font-medium">{tr.dataGapsColModules}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gaps.map(g => (
                                    <tr key={g.botId} className="border-b border-muted/30 hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedBotId(g.botId)} data-testid={`row-gap-${g.botId}`}>
                                      <td className="py-2 px-3">
                                        <div className="font-medium">{g.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{g.botId}</div>
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {g.expectsOris ? (
                                          g.hasOris ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> {tr.dataGapsPresent}</span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5" /> {tr.dataGapsMissing}</span>
                                          )
                                        ) : (
                                          <span className="text-xs text-muted-foreground">--</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        {g.expectsCA ? (
                                          g.hasCA ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> {tr.dataGapsPresent}</span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5" /> {tr.dataGapsMissing}</span>
                                          )
                                        ) : (
                                          <span className="text-xs text-muted-foreground">--</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3">
                                        <div className="flex flex-wrap gap-1">
                                          {g.aiModules.map(m => (
                                            <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{MODULE_DISPLAY[m] || m}</span>
                                          ))}
                                          {g.aiModules.length === 0 && <span className="text-xs text-muted-foreground">--</span>}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    <Card className="bg-slate-100 dark:bg-slate-900 text-foreground dark:text-white border-none">
                      <CardHeader className="pb-2">
                        <div>
                          <CardTitle className="text-lg font-bold">{tr.liveAccountsTitle}</CardTitle>
                          <CardDescription className="text-muted-foreground text-xs">{tr.liveAccountsDesc}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" data-testid="table-live-accounts">
                            <thead>
                              <tr className="border-b border-slate-300 dark:border-slate-700 text-xs text-muted-foreground uppercase tracking-wider">
                                <th className="text-left py-2 px-4 font-medium">{tr.colAccount}</th>
                                <th className="text-center py-2 px-2 font-medium w-16">{tr.colScore}</th>
                                <th className="text-center py-2 px-2 font-medium">{tr.colEffectiveness}</th>
                                <th className="text-center py-2 px-2 font-medium">{tr.colUX}</th>
                                <th className="text-center py-2 px-2 font-medium">{tr.colStability}</th>
                                <th className="text-center py-2 px-2 font-medium">{tr.colRecovery}</th>
                                <th className="text-center py-2 px-2 font-medium">{tr.colSafety}</th>
                                <th className="text-center py-2 px-2 font-medium hidden xl:table-cell">{tr.colModules}</th>
                                <th className="text-right py-2 px-4 font-medium">{tr.colStatus}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...bots].sort((a: BotFHSResult, b: BotFHSResult) => b.fhs.overall - a.fhs.overall).map((bot: BotFHSResult) => {
                                const s = bot.fhs.overall;
                                const scoreColor = s >= 80 ? 'text-green-600 dark:text-green-400' : s >= 65 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
                                const statusLabel = s >= 80 ? tr.healthy : s >= 65 ? tr.atRisk : tr.critical;
                                const statusBg = s >= 80 ? 'bg-green-600/20 text-green-700 dark:text-green-400' : s >= 65 ? 'bg-yellow-600/20 text-yellow-700 dark:text-yellow-400' : 'bg-red-600/20 text-red-700 dark:text-red-400';
                                const comps = bot.fhs.components;
                                const barData = [
                                  { key: 'A', score: comps?.flowEffectiveness?.score ?? 0 },
                                  { key: 'B', score: comps?.uxQuality?.score ?? 0 },
                                  { key: 'C', score: comps?.stability?.score ?? 0 },
                                  { key: 'D', score: comps?.recovery?.score ?? 0 },
                                  { key: 'E', score: comps?.safety?.score ?? 0 },
                                ];
                                const af = accountFeaturesMap.get(bot.botId);
                                return (
                                  <tr key={bot.botId} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors" data-testid={`row-account-${bot.botId}`}>
                                    <td className="py-2.5 px-4">
                                      <div className="font-semibold text-sm">{BOT_LABELS[bot.botId] || bot.botId}</div>
                                    </td>
                                    <td className={`text-center py-2.5 px-2 font-black text-base ${scoreColor}`}>{s}</td>
                                    {barData.map(bd => {
                                      const barColor = bd.score >= 80 ? 'bg-green-500' : bd.score >= 65 ? 'bg-yellow-500' : bd.score < 1 ? 'bg-slate-300 dark:bg-slate-700' : 'bg-red-500';
                                      return (
                                        <td key={bd.key} className="py-2.5 px-2">
                                          <div className="w-full h-3 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden" title={`${bd.key}: ${bd.score}`}>
                                            <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.max(bd.score, 2)}%` }} />
                                          </div>
                                        </td>
                                      );
                                    })}
                                    <td className="py-2.5 px-2 hidden xl:table-cell">
                                      {af ? (
                                        <div className="flex flex-col gap-0.5 items-start text-left">
                                          {af.modules.f_sales_agent_ai && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Sales Agent AI</span>}
                                          {af.modules.f_live_agent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">Live Agent</span>}
                                          {af.modules.f_suggested_order && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Suggested Order</span>}
                                          {af.modules.f_knowledge_genie && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">Knowledge Genie</span>}
                                          <span className="text-[9px] text-muted-foreground">{af.moduleCount} total</span>
                                        </div>
                                      ) : (
                                        <span className="text-[9px] text-muted-foreground">--</span>
                                      )}
                                    </td>
                                    <td className="text-right py-2.5 px-4">
                                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBg}`}>{statusLabel}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {botFHSData.length > 0 && (
                      <div className="text-[10px] text-muted-foreground text-right">
                        {tr.queried}: {new Date(botFHSData[0].fhs.queriedAt).toLocaleString(localeMap[lang])}
                      </div>
                    )}
                  </>
                );
              })()}

              {(botFHSError) && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {tr.bqError}
                </div>
              )}
            </div>
          ) : viewMode === 'botFHS' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold">FHS — {tr.fhsPerBotTitle}</h2>
                  <p className="text-xs text-muted-foreground">{tr.fhsPerBotDesc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative" ref={botSelectorRef}>
                    <Button
                      variant="outline"
                      className="min-w-[260px] justify-between text-sm"
                      onClick={() => setBotSelectorOpen(!botSelectorOpen)}
                      data-testid="button-bot-selector"
                    >
                      <span className="truncate">
                        {selectedBot ? (BOT_LABELS[selectedBot.botId] || selectedBot.botId) : tr.selectBot}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                    </Button>
                    {botSelectorOpen && botFHSData && (
                      <div className="absolute right-0 top-full mt-1 w-[340px] bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto" data-testid="bot-selector-dropdown">
                        <div className="p-2 border-b sticky top-0 bg-background">
                          <Input
                            placeholder={tr.searchBotPlaceholder}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="h-8 text-xs"
                            data-testid="input-bot-search"
                          />
                        </div>
                        <div className="flex gap-1 p-2 border-b sticky top-[48px] bg-background" data-testid="status-filter-bar">
                          {(() => {
                            const allBots = botFHSData as BotFHSResult[];
                            const hCount = allBots.filter(b => b.fhs.overall >= 80).length;
                            const rCount = allBots.filter(b => b.fhs.overall >= 65 && b.fhs.overall < 80).length;
                            const cCount = allBots.filter(b => b.fhs.overall < 65).length;
                            return (
                              <>
                                <button onClick={() => setStatusFilter('all')} className={`text-[10px] px-2 py-0.5 rounded-full border ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}`} data-testid="filter-all">{tr.all} ({allBots.length})</button>
                                <button onClick={() => setStatusFilter('healthy')} className={`text-[10px] px-2 py-0.5 rounded-full border ${statusFilter === 'healthy' ? 'bg-green-600 text-white' : 'text-green-600 border-green-300'}`} data-testid="filter-healthy">{tr.healthy} ({hCount})</button>
                                <button onClick={() => setStatusFilter('atRisk')} className={`text-[10px] px-2 py-0.5 rounded-full border ${statusFilter === 'atRisk' ? 'bg-yellow-600 text-white' : 'text-yellow-600 border-yellow-300'}`} data-testid="filter-at-risk">{tr.atRisk} ({rCount})</button>
                                <button onClick={() => setStatusFilter('critical')} className={`text-[10px] px-2 py-0.5 rounded-full border ${statusFilter === 'critical' ? 'bg-red-600 text-white' : 'text-red-600 border-red-300'}`} data-testid="filter-critical">{tr.critical} ({cCount})</button>
                              </>
                            );
                          })()}
                        </div>
                        {filteredBots.map(bot => {
                          const st = getFHSStatus(bot.fhs.overall);
                          return (
                            <button
                              key={bot.botId}
                              className={`w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between text-sm ${selectedBotId === bot.botId ? 'bg-accent' : ''}`}
                              onClick={() => { setSelectedBotId(bot.botId); setBotSelectorOpen(false); }}
                              data-testid={`option-bot-${bot.botId}`}
                            >
                              <div>
                                <div className="font-medium text-xs">{BOT_LABELS[bot.botId] || bot.botId}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{bot.botId}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{bot.fhs.overall}</span>
                                <Badge className={`${st.bg} ${st.color} border-none text-[9px] px-1.5`}>{st.label}</Badge>
                              </div>
                            </button>
                          );
                        })}
                        {filteredBots.length === 0 && (
                          <div className="px-3 py-4 text-center text-xs text-muted-foreground">{tr.noBotsFound}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/langsmith/bots', botIds] })}
                    disabled={botFHSLoading}
                    data-testid="button-refresh-bot-fhs"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${botFHSLoading ? 'animate-spin' : ''}`} />
                    {tr.refresh}
                  </Button>
                </div>
              </div>

              {botFHSLoading && (
                <div className="flex items-center gap-2 text-muted-foreground py-8">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t(tr, "queryingBots", { count: TRACKED_BOTS.length })}
                </div>
              )}

              {botFHSError && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {tr.botFhsError}
                </div>
              )}

              {botFHSData && !selectedBot && !botFHSLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{tr.noBotsFound}</p>
                </div>
              )}

              {selectedBot && (() => {
                const bot = selectedBot;
                const status = getFHSStatus(bot.fhs.overall);
                const fb = bot.fhs.flowbuilderMetrics;
                const radarData = COMPONENT_ORDER.map(key => {
                  const comp = bot.fhs.components[key];
                  const shortLabels: Record<string, string> = {
                    flowEffectiveness: "Flow Eff",
                    uxQuality: "UX Qua",
                    stability: "Stability",
                    recovery: "Recovery",
                    safety: "Safety",
                  };
                  return { dimension: shortLabels[key] || key, score: comp?.score ?? 0, fullMark: 100 };
                });
                return (
                  <div className="space-y-6">
                    <Card className="border-t-4" style={{ borderTopColor: bot.fhs.overall >= 80 ? '#22c55e' : bot.fhs.overall >= 65 ? '#eab308' : '#ef4444' }} data-testid={`card-bot-${bot.botId}`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-bold truncate">{BOT_LABELS[bot.botId] || bot.botId}</h3>
                          <Badge className={`${status.bg} ${status.color} border-none flex-shrink-0`}>{status.label}</Badge>
                          <div className="flex flex-wrap gap-1.5 ml-auto">
                            {!bot.fhs.hasOrisData && !bot.fhs.flowbuilderMetrics && !bot.fhs.hasUXData && !bot.fhs.errorsData && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded" data-testid="warning-no-data">
                                <AlertTriangle className="h-3 w-3" />
                                {t(tr, "noDataDays", { days: bot.fhs.dataWindowDays })}
                              </div>
                            )}
                            {!bot.fhs.hasOrisData && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded" data-testid="warning-no-oris">
                                <AlertTriangle className="h-3 w-3" />
                                {tr.noOrisPartial}
                              </div>
                            )}
                            {!bot.fhs.hasUXData && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded" data-testid="warning-no-cie">
                                <Info className="h-3 w-3" />
                                {tr.noCiePartial}
                              </div>
                            )}
                            {!bot.fhs.flowbuilderMetrics && (bot.fhs.hasOrisData || bot.fhs.hasUXData) && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded" data-testid="warning-no-fb">
                                <Info className="h-3 w-3" />
                                {tr.noFlowbuilderPartial}
                              </div>
                            )}
                            {bot.fhs.hasCustomAgentData ? (
                              <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded" data-testid="badge-custom-agent">
                                <Cpu className="h-3 w-3" />
                                {tr.hasCustomAgentData}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded" data-testid="warning-no-ca">
                                <Info className="h-3 w-3" />
                                {tr.noCustomAgentPartial}
                              </div>
                            )}
                          </div>
                        </div>
                        {(() => {
                          const af = accountFeaturesMap.get(bot.botId);
                          if (!af) return null;
                          const tier = getComplexityTier(af.moduleCount);
                          return (
                            <div className="flex flex-wrap items-center gap-2 mt-1 mb-1" data-testid="complexity-indicators">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getComplexityColor(tier)}`}>
                                {tr.complexityLabel}: {getComplexityLabel(tier, tr)} ({af.moduleCount})
                              </span>
                              <span className="text-[10px] text-muted-foreground">{tr.flowTypeLabel}: {af.flowType}</span>
                              <span className="text-[10px] text-muted-foreground">{tr.activitiesLabel}: {af.totalActivities}</span>
                              {af.agentCount > 0 && <span className="text-[10px] text-purple-600 dark:text-purple-400">{tr.agentsLabel}: {af.agentCount}</span>}
                              {af.webhookCount > 0 && <span className="text-[10px] text-muted-foreground">{tr.webhooksLabel}: {af.webhookCount}</span>}
                            </div>
                          );
                        })()}
                        <p className="text-[10px] text-muted-foreground font-mono mb-3">{bot.botId}</p>
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                          <div className="flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-40 h-40">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-slate-700" />
                              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="5" strokeLinecap="round"
                                stroke={bot.fhs.overall >= 80 ? '#22c55e' : bot.fhs.overall >= 65 ? '#eab308' : '#ef4444'}
                                strokeDasharray={`${(bot.fhs.overall / 100) * 264} 264`}
                                transform="rotate(-90 50 50)"
                              />
                              <text x="50" y="48" textAnchor="middle" className="text-2xl font-black fill-foreground">{bot.fhs.overall}</text>
                              <text x="50" y="62" textAnchor="middle" className="text-[9px] fill-muted-foreground">Score FHS</text>
                            </svg>
                          </div>
                          <div className="flex-1 w-full lg:w-auto">
                            <div className="text-xs font-medium text-muted-foreground mb-1 text-center">{tr.radarTitle}</div>
                            <ResponsiveContainer width="100%" height={180}>
                              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="FHS" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                              </RadarChart>
                            </ResponsiveContainer>
                            <div className="text-center text-xs text-muted-foreground">{tr.globalScore}: {bot.fhs.overall}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="detail-fhs-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{BOT_LABELS[bot.botId] || bot.botId} - {tr.detailFhs}</CardTitle>
                        <CardDescription>
                          {tr.componentBreakdown}: {[bot.fhs.hasOrisData && 'ORIS', bot.fhs.hasUXData && 'CIE', bot.fhs.flowbuilderMetrics && 'Flowbuilder', bot.fhs.hasCustomAgentData && 'Custom Agent'].filter(Boolean).join(' + ') || tr.noData}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!bot.fhs.hasOrisData && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>{t(tr, "noOrisWarning", { days: bot.fhs.dataWindowDays })}</span>
                          </div>
                        )}
                        <div className="space-y-3">
                          {COMPONENT_ORDER.map(key => {
                            const comp = bot.fhs.components[key];
                            if (!comp) return null;
                            return <ComponentScoreBar key={key} component={comp} name={key} />;
                          })}
                        </div>

                        <InsightsSection fhs={bot.fhs} botId={bot.botId} />

                        {(() => {
                          const af = accountFeaturesMap.get(bot.botId);
                          if (!af) return null;
                          const activeModulesByGroup: { group: string; groupKey: string; modules: string[] }[] = [];
                          for (const [groupKey, groupDef] of Object.entries(MODULE_GROUPS)) {
                            const active = groupDef.modules.filter(m => af.modules[m]);
                            if (active.length > 0) {
                              activeModulesByGroup.push({ group: (tr as any)[groupDef.labelKey] || groupKey, groupKey, modules: active });
                            }
                          }
                          const tier = getComplexityTier(af.moduleCount);
                          const peerBots = accountFeaturesData?.filter(f => getComplexityTier(f.moduleCount) === tier) || [];
                          const peerBotIds = new Set(peerBots.map(p => p.accountId));
                          const peerFHSScores = (botFHSData || []).filter(b => peerBotIds.has(b.botId) && b.botId !== bot.botId).map(b => b.fhs.overall);
                          const peerAvg = peerFHSScores.length > 0 ? Math.round(peerFHSScores.reduce((a, b) => a + b, 0) / peerFHSScores.length) : null;
                          const diff = peerAvg !== null ? bot.fhs.overall - peerAvg : null;
                          return (
                            <div className="border-t pt-3 space-y-3" data-testid="modules-section">
                              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{tr.modulesTitle} ({af.moduleCount})</div>
                              <div className="space-y-2">
                                {activeModulesByGroup.map(g => (
                                  <div key={g.groupKey} className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground w-28 flex-shrink-0">{g.group}</span>
                                    {g.modules.map(m => (
                                      <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GROUP_COLORS[g.groupKey] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`} data-testid={`module-chip-${m}`}>
                                        {MODULE_DISPLAY[m] || m.replace('f_', '')}
                                      </span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {peerAvg !== null && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mt-2" data-testid="benchmark-section">
                                  <div className="text-[11px] font-semibold mb-2">{tr.benchmarkTitle}</div>
                                  <div className="text-[10px] text-muted-foreground mb-2">{tr.benchmarkDesc}</div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-muted-foreground">{tr.benchmarkAvg} ({getComplexityLabel(tier, tr)})</span>
                                        <span className="font-bold">{peerAvg}</span>
                                      </div>
                                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                        <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: `${Math.max(peerAvg, 2)}%` }} />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-muted-foreground">{tr.benchmarkThisBot}</span>
                                        <span className={`font-bold ${bot.fhs.overall >= 80 ? 'text-green-600' : bot.fhs.overall >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>{bot.fhs.overall}</span>
                                      </div>
                                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${bot.fhs.overall >= 80 ? 'bg-green-500' : bot.fhs.overall >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.max(bot.fhs.overall, 2)}%` }} />
                                      </div>
                                    </div>
                                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded ${diff !== null && diff >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                      {diff !== null && diff >= 0 ? '+' : ''}{diff !== null ? Math.round(diff * 10) / 10 : diff} — {diff !== null && diff >= 0 ? tr.benchmarkAbove : tr.benchmarkBelow}
                                    </div>
                                  </div>
                                  <div className="text-[9px] text-muted-foreground mt-1">{peerFHSScores.length} bots in group</div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {bot.fhs.errorsData && (
                          <ErrorDrilldown botId={bot.botId} errorsData={bot.fhs.errorsData} />
                        )}

                        {fb && (
                          <div className="border-t pt-3">
                            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{tr.flowbuilderMetrics}</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.messages} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpMessages}</span></span></div>
                                <div className="font-bold text-lg">{fb.messages.toLocaleString()}</div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.latencyAvg} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpLatency}</span></span></div>
                                <div className="font-bold text-lg">{fb.p50LatencySec.toFixed(1)}s</div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.sessions} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpSessions}</span></span></div>
                                <div className="font-bold text-lg">{fb.sessions.toLocaleString()}</div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.users} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpUsers}</span></span></div>
                                <div className="font-bold text-lg">{fb.users.toLocaleString()}</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.errorFree} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpErrorFree}</span></span></div>
                                <div className="font-bold">{fb.sessions > 0 ? ((fb.errorFreeSessions / fb.sessions) * 100).toFixed(1) : 0}%</div>
                                <div className="text-[10px] text-muted-foreground">{fb.errorFreeSessions.toLocaleString()}/{fb.sessions.toLocaleString()}</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.blocked} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpBlocked}</span></span></div>
                                <div className={`font-bold ${fb.blockSessions > 0 ? 'text-red-600' : 'text-green-600'}`}>{fb.sessions > 0 ? ((fb.blockSessions / fb.sessions) * 100).toFixed(2) : 0}%</div>
                                <div className="text-[10px] text-muted-foreground">{fb.blockSessions.toLocaleString()}</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.recovery} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpRecovery}</span></span></div>
                                <div className="font-bold">{(fb.sessions - fb.errorFreeSessions) > 0 ? ((fb.recoverySessions / (fb.sessions - fb.errorFreeSessions)) * 100).toFixed(1) : 0}%</div>
                                <div className="text-[10px] text-muted-foreground">{fb.recoverySessions.toLocaleString()} {tr.ofProblematic}</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded px-3 py-2 text-xs">
                                <div className="text-muted-foreground flex items-center gap-1">{tr.fallback} <span className="relative group/tip"><Info className="h-3 w-3 cursor-help opacity-50 group-hover/tip:opacity-100 transition-opacity" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded shadow-lg w-48 text-center hidden group-hover/tip:block z-50 pointer-events-none">{tr.helpFallback}</span></span></div>
                                <div className={`font-bold ${fb.fallbackSessions > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{fb.sessions > 0 ? ((fb.fallbackSessions / fb.sessions) * 100).toFixed(2) : 0}%</div>
                                <div className="text-[10px] text-muted-foreground">{fb.fallbackSessions.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {bot.fhs.uxMetrics && bot.fhs.uxMetrics.length > 0 && (
                          <div className="border-t pt-3">
                            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{tr.uxAnalysis}</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {bot.fhs.uxMetrics.map((m) => (
                                <div key={m.metricName} className="bg-purple-50 dark:bg-purple-950/30 px-3 py-2 rounded text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-muted-foreground font-medium">{m.metricName}</span>
                                    <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 border-none ${m.status === 'On Track' ? 'bg-green-100 text-green-700' : m.status === 'Needs Attention' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {m.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className={`font-bold text-sm ${m.successRatePct >= 85 ? 'text-green-600' : m.successRatePct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {m.successRatePct}%
                                    </span>
                                    <span className="text-muted-foreground">{m.passed}/{m.evaluatedConversations}</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    Avg: {m.avgScore.toFixed(4)} | Threshold: {m.threshold}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!bot.fhs.hasUXData && (
                          <div className="border-t pt-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Database className="h-3 w-3" />
                              {tr.uxNoData}
                            </div>
                          </div>
                        )}

                        {bot.fhs.rawMetrics.length > 0 && (
                          <div className="border-t pt-3">
                            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{tr.orisEvaluators}</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {bot.fhs.rawMetrics.map((m) => (
                                <div key={m.key} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded text-xs">
                                  <span className="text-muted-foreground">{m.key}</span>
                                  <div className="text-right">
                                    <span className={`font-bold ${m.issueRate > 0.3 ? 'text-red-600' : m.issueRate > 0.1 ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {(m.issueRate * 100).toFixed(1)}%
                                    </span>
                                    <span className="text-muted-foreground ml-1">({m.negativeCount}/{m.totalCount})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground text-right">
                          {tr.queried}: {new Date(bot.fhs.queriedAt).toLocaleString(localeMap[lang])}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-8">
              <KPIExplanation />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(p => p.isLaunched ? <FHSCard key={p.id} project={p} /> : <GLRSCard key={p.id} project={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </LangContext.Provider>
  );
}
