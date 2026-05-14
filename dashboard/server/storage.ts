import { db } from "./db";
import {
  projects, tasks,
  type Project, type InsertProject,
  type Task, type InsertTask
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  seedDemoData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    const allProjects = await db.select().from(projects);
    if (allProjects.length === 0) {
      await this.seedDemoData();
      return await db.select().from(projects);
    }
    return allProjects;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async seedDemoData(): Promise<void> {
    const demoProjects: InsertProject[] = [
      {
        name: "Bot Unilever Ecuador (ICE)",
        description: "Agente conversacional para atención al cliente",
        status: "completed",
        priority: "high",
        progress: 100,
        isLaunched: true,
        fhs: {
          overall: 74.2,
          components: {
            taskSuccess: 76.6, // user_intent_fulfillment
            friction: 48.1,    // user_frustration + knowledge_fallback
            quality: 78.3,     // relevance + misunderstanding
            reliability: 99.0, // assistant_error
            safety: 100.0      // toxicity_and_harmfulness + domain_safety
          }
        },
        healthHistory: [
          { date: "2024-12-15", overall: 68.5 },
          { date: "2024-12-22", overall: 70.8 },
          { date: "2024-12-29", overall: 72.3 },
          { date: "2025-01-05", overall: 73.1 },
          { date: "2025-01-12", overall: 74.2 }
        ]
      },
      {
        name: "Chatbot Bancolombia",
        description: "Asistente virtual para consultas bancarias",
        status: "completed",
        priority: "high",
        progress: 100,
        isLaunched: true,
        fhs: {
          overall: 88.5,
          components: {
            taskSuccess: 91.2,
            friction: 85.3,
            quality: 89.7,
            reliability: 98.5,
            safety: 100.0
          }
        }
      },
      {
        name: "Rediseño de Website",
        description: "Modernizar el sitio web corporativo",
        status: "in-progress",
        priority: "high",
        progress: 45,
        isLaunched: false,
        glrs: {
          overall: 85.5,
          status: "GO",
          pillars: { coverage: 88, robustness: 85, evals: 90, tech: 92, ops: 65 }
        }
      }
    ];

    for (const project of demoProjects) {
      await this.createProject(project);
    }
  }
}

export const storage = new DatabaseStorage();
