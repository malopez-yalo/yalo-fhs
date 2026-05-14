import { z } from 'zod';
import { insertProjectSchema, insertTaskSchema, projects, tasks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const flowbuilderMetricsSchema = z.object({
  messages: z.number(),
  avgLatencyMs: z.number(),
  sessions: z.number(),
  fallbackSessions: z.number(),
  blockSessions: z.number(),
  recoverySessions: z.number(),
  errorFreeSessions: z.number(),
  users: z.number(),
}).nullable();

const fhsResultSchema = z.object({
  overall: z.number(),
  components: z.record(z.object({
    score: z.number(),
    weight: z.number(),
    label: z.string(),
    subComponents: z.record(z.object({
      score: z.number(),
      source: z.enum(["oris", "ux", "mixed", "flowbuilder", "cie", "manual", "custom_agent", "ca_blended"]),
      available: z.boolean(),
    })),
  })),
  rawMetrics: z.array(z.object({
    key: z.string(),
    negativeCount: z.number(),
    totalCount: z.number(),
    issueRate: z.number(),
  })),
  flowbuilderMetrics: flowbuilderMetricsSchema,
  uxMetrics: z.array(z.object({
    metricName: z.string(),
    evaluatedConversations: z.number(),
    passed: z.number(),
    failed: z.number(),
    successRatePct: z.number(),
    avgScore: z.number(),
    threshold: z.number(),
    status: z.string(),
  })).nullable(),
  hasOrisData: z.boolean(),
  hasUXData: z.boolean(),
  hasCustomAgentData: z.boolean(),
  dataWindowDays: z.number(),
  queriedAt: z.string(),
});

export const api = {
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial(),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  langsmith: {
    byBots: {
      method: 'GET' as const,
      path: '/api/langsmith/bots',
      responses: {
        200: z.array(z.object({
          botId: z.string(),
          fhs: fhsResultSchema,
        })),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    metrics: {
      method: 'GET' as const,
      path: '/api/langsmith/metrics',
      responses: {
        200: fhsResultSchema,
        500: errorSchemas.internal,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
