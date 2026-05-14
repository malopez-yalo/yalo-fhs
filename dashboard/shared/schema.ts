import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planning"),
  priority: text("priority").notNull().default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  progress: integer("progress").notNull().default(0),
  isLaunched: boolean("is_launched").notNull().default(false),
  readinessScore: integer("readiness_score"),
  glrs: jsonb("glrs"),
  fhs: jsonb("fhs"), // New column
  healthHistory: jsonb("health_history"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  assignee: text("assignee"),
  dueDate: timestamp("due_date"),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export * from "./models/auth";
