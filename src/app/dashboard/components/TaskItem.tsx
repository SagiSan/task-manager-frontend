"use client";

import { Task, TaskPriority } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import Link from "next/link";
import EditTaskModal from "./EditTaskModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { deleteTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await deleteTask(task.id);
    setIsDeleting(false);
    setShowConfirm(false);
  }

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "bg-gray-400",
    [TaskPriority.MEDIUM]: "bg-orange-500",
    [TaskPriority.HIGH]: "bg-red-600",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No Due Date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg border border-gray-300 mb-3">
      <div className="flex justify-between items-center">
        <Link
          href={`/dashboard/task/${task.id}`}
          className="text-lg font-semibold hover:underline"
        >
          {task.title}
        </Link>
        <div className="flex gap-2">
          <span
            className={`text-white text-sm px-2 py-1 rounded ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 mt-2">{task.description}</p>
      )}

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600 mt-1">
          <strong>Due:</strong> {formatDate(task.dueDate)}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit size={18} />
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800"
          >
            {isDeleting ? "..." : <FaTrash size={18} />}
          </button>
        </div>
      </div>

      {isEditing && (
        <EditTaskModal task={task} onClose={() => setIsEditing(false)} />
      )}

      <ConfirmDeleteModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
