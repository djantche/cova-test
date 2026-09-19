import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { Task, TaskPayload } from "@/types";
import { STATUS_LABELS, STATUS_BADGE_VARIANT, STATUS_DOT_CLASS } from "@/lib/task-status";
import { TaskForm } from "./TaskForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, payload: TaskPayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

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
    <Card>
      <CardContent className="flex items-start justify-between gap-4 px-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_CLASS[task.status]}`} />
            <h3 className="truncate font-medium">{task.title}</h3>
            <Badge variant={STATUS_BADGE_VARIANT[task.status]}>{STATUS_LABELS[task.status]}</Badge>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground/70">
            Mis à jour le {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil /> Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              try {
                await onDelete(task.id);
              } finally {
                setDeleting(false);
              }
            }}
          >
            <Trash2 /> Supprimer
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 sm:hidden">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await onDelete(task.id);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <Trash2 /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
