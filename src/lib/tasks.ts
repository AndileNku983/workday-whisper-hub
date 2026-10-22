import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export const PRIORITIES: TaskPriority[] = ["urgent", "high", "medium", "low"];
export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Open tasks first, then by priority, then earliest due date. */
export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const doneA = a.status === "done" ? 1 : 0;
    const doneB = b.status === "done" ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;
    const p = (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9);
    if (p !== 0) return p;
    return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
  });
}

export function isOverdue(task: Pick<Task, "due_date" | "status">, now = new Date()) {
  return task.status !== "done" && !!task.due_date && new Date(task.due_date) < now;
}

export function taskStats(tasks: Task[], now = new Date()) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => isOverdue(t, now)).length;
  const in48h = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.due_date &&
      new Date(t.due_date) >= now &&
      new Date(t.due_date).getTime() - now.getTime() <= 48 * 3600_000,
  ).length;
  return { total, done, open: total - done, overdue, dueSoon: in48h, completion: total ? Math.round((done / total) * 100) : 0 };
}
