import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast, extractErrorMessage } from "../context/ToastContext";
import * as tasksApi from "../api/tasks";
import type { Task, TaskPayload, TaskStatus } from "../types";
import { TaskForm } from "../components/TaskForm";
import { TaskItem } from "../components/TaskItem";

const STATUS_FILTERS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "TODO", label: "À faire" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "DONE", label: "Terminée" },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [search, setSearch] = useState("");

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await tasksApi.fetchTasks(status, search);
      setTasks(data);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadTasks, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function handleCreate(payload: TaskPayload) {
    try {
      const created = await tasksApi.createTask(payload);
      setTasks((prev) => [created, ...prev]);
      showToast("Tâche ajoutée", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  }

  async function handleUpdate(id: number, payload: TaskPayload) {
    try {
      const updated = await tasksApi.updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast("Tâche mise à jour", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  }

  async function handleDelete(id: number) {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Tâche supprimée", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-900">Task Manager</h1>
            <p className="text-sm text-slate-500">Bonjour, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <TaskForm onSubmit={handleCreate} />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Rechercher une tâche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {loading && <p className="text-sm text-slate-400 text-center py-8">Chargement des tâches...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Aucune tâche pour le moment.</p>
          )}
          {!loading &&
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
        </div>
      </main>
    </div>
  );
}
