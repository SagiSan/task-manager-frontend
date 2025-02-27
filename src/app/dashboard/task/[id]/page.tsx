"use client";

import React from "react";
import { useTaskStore } from "@/store/taskStore";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskStatus, TaskPriority } from "@/types/task";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import EditTaskModal from "../../components/EditTaskModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const taskId = parseInt(id as string, 10);
  const { tasks, deleteTask } = useTaskStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  if (!task)
    return <p className="text-center mt-10 text-red-500">Task not found.</p>;

  async function handleDelete() {
    setIsDeleting(true);
    const success = await deleteTask(task!.id);
    setIsDeleting(false);
    setShowConfirm(false);

    if (success) router.push("/dashboard");
  }

  const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: "bg-yellow-500",
    [TaskStatus.IN_PROGRESS]: "bg-blue-500",
    [TaskStatus.COMPLETED]: "bg-green-500",
  };

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "bg-gray-400",
    [TaskPriority.MEDIUM]: "bg-orange-500",
    [TaskPriority.HIGH]: "bg-red-600",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-300 mt-10">
      <Link
        href="/dashboard"
        className="flex items-center text-blue-600 hover:underline mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-4 text-gray-800">{task.title}</h1>

      <div className="flex items-center gap-3 mb-6">
        <span
          className={`text-white text-sm px-3 py-1 rounded-full ${
            statusColors[task.status]
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
        <span
          className={`text-white text-sm px-3 py-1 rounded-full ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          Description
        </h2>
        <p className="text-gray-600">
          {task.description || "No description provided."}
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
        </p>
        {task.dueDate && (
          <p>
            <strong>Due Date:</strong>{" "}
            {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Edit Task
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          {isDeleting ? "Deleting..." : "Delete Task"}
        </button>
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
