import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListChecks, LogOut, Search, Inbox, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/errors";
import { STATUS_LABELS } from "@/lib/task-status";
import * as tasksApi from "@/api/tasks";
import type { Task, TaskPayload, TaskStatus } from "@/types";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL_STATUSES = "ALL";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TaskStatus | typeof ALL_STATUSES>(ALL_STATUSES);
  const [search, setSearch] = useState("");

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await tasksApi.fetchTasks(status === ALL_STATUSES ? "" : status, search);
      setTasks(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
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
      toast.success("Tâche ajoutée");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleUpdate(id: number, payload: TaskPayload) {
    try {
      const updated = await tasksApi.updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Tâche mise à jour");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tâche supprimée");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ListChecks className="size-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Task Manager</h1>
              <p className="text-xs leading-tight text-muted-foreground">Bonjour, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {initial}
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <TaskForm onSubmit={handleCreate} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus | typeof ALL_STATUSES)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>Tous les statuts</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <p className="text-sm">Chargement des tâches...</p>
            </div>
          )}
          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
              <Inbox className="size-8" />
              <p className="text-sm">Aucune tâche pour le moment.</p>
            </div>
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
