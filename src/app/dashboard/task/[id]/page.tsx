"use client";

import React, { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskStatus, TaskPriority } from "@/types/task";
import Link from "next/link";
import { FaArrowLeft, FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import EditTaskModal from "../../components/EditTaskModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const taskId = parseInt(id as string, 10);
  const {
    tasks,
    categories,
    comments,
    fetchCategories,
    deleteTask,
    fetchTask,
    addComment,
    fetchComments,
  } = useTaskStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const getTaskAsync = async (id: number) => {
      await fetchTask(id);
      await fetchCategories();
      await fetchComments(id);
      setIsLoading(false);
    };
    if (!tasks.length) {
      getTaskAsync(taskId);
    } else setIsLoading(false);
  }, [tasks, taskId, fetchTask, fetchCategories, fetchComments]);

  const task = tasks.find((t) => t.id === taskId);
  const taskCategory = categories.find((c) => c.id === task?.categoryId);

  async function handleDelete() {
    setIsDeleting(true);
    const success = await deleteTask(task!.id);
    setIsDeleting(false);
    setShowConfirm(false);

    if (success) router.push("/dashboard");
  }

  const handleAddComment = async () => {
    if (commentText.trim() === "" || !task?.id) return;

    const result = await addComment({
      content: commentText,
      taskId: task.id,
    });

    if (result.success) {
      setCommentText("");
    } else console.log(result.error);
  };

  const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: "bg-yellow-300",
    [TaskStatus.IN_PROGRESS]: "bg-blue-400",
    [TaskStatus.COMPLETED]: "bg-green-500",
  };

  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: "bg-gray-400",
    [TaskPriority.MEDIUM]: "bg-orange-500",
    [TaskPriority.HIGH]: "bg-red-600",
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="animate-spin rounded-full border-t-4 border-blue-500 w-12 h-12"></div>
      </div>
    );
  } else if (!task) {
    return <p className="text-center mt-10 text-red-500">Task not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-300 mt-10">
      <Link
        href="/dashboard"
        className="flex items-center text-blue-600 hover:underline mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>

      <div className="flex justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">
            {task.title}
          </h1>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">
              Description
            </h2>
            <p className="text-gray-600">
              {task.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="w-1/3 space-y-4 text-right">
          <div>
            <span className="font-semibold text-gray-700 block">Status</span>
            <div
              className={`text-white text-sm px-3 py-1 rounded inline-block ${
                statusColors[task.status]
              }`}
            >
              {task.status.replace("_", " ")}
            </div>
          </div>

          <div>
            <span className="font-semibold text-gray-700 block">Priority</span>
            <div
              className={`text-white text-sm px-3 py-1 rounded inline-block ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </div>
          </div>

          {taskCategory && (
            <div>
              <span className="font-semibold text-gray-700 block">
                Category
              </span>
              <div className={`text-gray-500 text-sm text-right capitalize`}>
                {taskCategory.name}
              </div>
            </div>
          )}

          <div>
            <span className="font-semibold text-gray-700">Created</span>
            <div className="text-sm text-gray-500">
              {new Date(task.createdAt).toLocaleString()}
            </div>
          </div>

          {task.dueDate && (
            <div>
              <span className="font-semibold text-gray-700">Due Date</span>
              <div className="text-sm text-gray-500">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full border p-2 rounded-md focus:ring focus:ring-blue-300"
        />
        <div className="flex justify-end mt-2 mb-8">
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Comment
          </button>
        </div>
        <div className="mt-4 border rounded p-4 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start border-t border-gray-300 pt-2 mb-4"
            >
              <div className="mr-3">
                <FaUserCircle size={40} className="text-gray-400" />
              </div>

              <div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-gray-800">{comment.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 mt-16 justify-end">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <FaEdit /> Edit Task
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
        >
          {isDeleting ? (
            <span>Deleting...</span>
          ) : (
            <>
              <FaTrash /> Delete Task
            </>
          )}
        </button>
      </div>

      {isEditing && (
        <EditTaskModal
          task={task}
          categories={categories}
          onClose={() => setIsEditing(false)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
