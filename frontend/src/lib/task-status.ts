import type { TaskStatus } from "@/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
};

export const STATUS_BADGE_VARIANT: Record<TaskStatus, "secondary" | "default" | "outline"> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
};

export const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-amber-500",
  DONE: "bg-emerald-500",
};
