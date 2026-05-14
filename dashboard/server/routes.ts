import type { Express } from "express";
import type { Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { fetchLangSmithMetrics, fetchFHSByBots, fetchBotErrorDetails, fetchErrorDistribution, fetchAccountFeatures } from "./bigquery";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";

const BOT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const bigQueryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many data requests, please try again later." },
});

async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    const project1 = await storage.createProject({
      name: "Website Redesign",
      description: "Overhaul the company website with new branding.",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });

    const project2 = await storage.createProject({
      name: "Mobile App Launch",
      description: "Prepare for the iOS and Android launch.",
      status: "active",
      startDate: new Date(),
    });

    await storage.createTask({
      projectId: project1.id,
      title: "Design Mockups",
      description: "Create Figma mockups for homepage.",
      status: "done",
      priority: "high",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      assignee: "Alice",
    });

    await storage.createTask({
      projectId: project1.id,
      title: "Frontend Implementation",
      description: "Implement the React components.",
      status: "in_progress",
      priority: "high",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      assignee: "Bob",
    });

    await storage.createTask({
      projectId: project2.id,
      title: "App Store Submission",
      description: "Submit binaries to Apple.",
      status: "todo",
      priority: "high", 
      assignee: "Charlie",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.use("/api", apiLimiter);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  seedDatabase().catch(console.error);

  // Projects
  app.get(api.projects.list.path, isAuthenticated, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, isAuthenticated, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.post(api.projects.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.projects.update.path, isAuthenticated, async (req, res) => {
     try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProject(Number(req.params.id));
    res.status(204).send();
  });

  // Tasks
  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post(api.tasks.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.langsmith.metrics.path, isAuthenticated, bigQueryLimiter, async (_req, res) => {
    try {
      const result = await fetchLangSmithMetrics();
      res.json(result);
    } catch (err: any) {
      console.error("BigQuery error:", err);
      res.status(500).json({ message: "Error al obtener metricas de LangSmith. Verifica la configuracion." });
    }
  });

  app.get(api.langsmith.byBots.path, isAuthenticated, bigQueryLimiter, async (req, res) => {
    try {
      const botsParam = req.query.bots as string;
      if (!botsParam) {
        return res.status(400).json({ message: "Parametro 'bots' requerido (separados por coma)." });
      }
      const botIds = botsParam.split(",").map(b => b.trim()).filter(Boolean);
      if (botIds.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos un bot_id." });
      }
      if (botIds.length > 100) {
        return res.status(400).json({ message: "Maximo 100 bot_ids por consulta." });
      }
      const invalidBot = botIds.find(id => !BOT_ID_PATTERN.test(id) || id.length > 100);
      if (invalidBot) {
        return res.status(400).json({ message: "Formato de bot_id invalido." });
      }
      const results = await fetchFHSByBots(botIds);
      res.json(results);
    } catch (err: any) {
      console.error("BigQuery per-bot error:", err);
      res.status(500).json({ message: "Error al obtener FHS por bot. Verifica la configuracion." });
    }
  });

  app.get("/api/langsmith/error-distribution", isAuthenticated, bigQueryLimiter, async (req, res) => {
    try {
      const data = await fetchErrorDistribution();
      res.json(data);
    } catch (err: any) {
      console.error("Error distribution query error:", err);
      res.status(500).json({ message: "Error al obtener distribucion de errores." });
    }
  });

  app.get("/api/langsmith/account-features", isAuthenticated, bigQueryLimiter, async (req, res) => {
    try {
      const botsParam = req.query.bots as string | undefined;
      let botIds: string[] | undefined;
      if (botsParam) {
        botIds = botsParam.split(",").map(b => b.trim()).filter(Boolean);
        if (botIds.length > 100) {
          return res.status(400).json({ message: "Maximo 100 bot_ids por consulta." });
        }
        const invalidBot = botIds.find(id => !BOT_ID_PATTERN.test(id) || id.length > 100);
        if (invalidBot) {
          return res.status(400).json({ message: "Formato de bot_id invalido." });
        }
      }
      const data = await fetchAccountFeatures(botIds);
      res.json(data);
    } catch (err: any) {
      console.error("Account features error:", err);
      res.status(500).json({ message: "Error al obtener features de cuenta." });
    }
  });

  app.get("/api/langsmith/bot-errors", isAuthenticated, bigQueryLimiter, async (req, res) => {
    try {
      const botId = req.query.bot as string;
      if (!botId) {
        return res.status(400).json({ message: "Parametro 'bot' requerido." });
      }
      if (!BOT_ID_PATTERN.test(botId) || botId.length > 100) {
        return res.status(400).json({ message: "Formato de bot_id invalido." });
      }
      const details = await fetchBotErrorDetails(botId);
      res.json(details);
    } catch (err: any) {
      console.error("Bot error details error:", err);
      res.status(500).json({ message: "Error al obtener detalles de errores." });
    }
  });

  return httpServer;
}
