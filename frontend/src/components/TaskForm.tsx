import { useEffect, useState, type FormEvent } from "react";
import type { Task, TaskPayload, TaskStatus } from "../types";

interface TaskFormProps {
  initialTask?: Task | null;
  onSubmit: (payload: TaskPayload) => Promise<void>;
  onCancel?: () => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
};

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTask?.title ?? "");
    setDescription(initialTask?.description ?? "");
    setStatus(initialTask?.status ?? "TODO");
  }, [initialTask]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
      if (!initialTask) {
        setTitle("");
        setDescription("");
        setStatus("TODO");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Préparer la démo"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Détails de la tâche (optionnel)"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Statut</label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {initialTask ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </form>
  );
}

export { STATUS_LABELS };
