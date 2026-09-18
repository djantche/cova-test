import { useState } from "react";
import type { Task, TaskPayload } from "../types";
import { TaskForm, STATUS_LABELS } from "./TaskForm";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, payload: TaskPayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const STATUS_STYLES: Record<Task["status"], string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-green-100 text-green-700",
};

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (editing) {
    return (
      <TaskForm
        initialTask={task}
        onCancel={() => setEditing(false)}
        onSubmit={async (payload) => {
          await onUpdate(task.id, payload);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-slate-900 truncate">{task.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
        <p className="text-xs text-slate-400 mt-2">
          Mis à jour le {new Date(task.updatedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Modifier
        </button>
        <button
          disabled={deleting}
          onClick={async () => {
            setDeleting(true);
            try {
              await onDelete(task.id);
            } finally {
              setDeleting(false);
            }
          }}
          className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
