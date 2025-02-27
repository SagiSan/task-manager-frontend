import { z } from "zod";
import { TaskPriority, TaskStatus } from "@/types";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum([
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
  ]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  dueDate: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
