"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { taskSchema } from "@/schemas/taskSchema";
import { Category } from "@/types";

export interface EditTaskModalProps {
  task: Task;
  categories?: Category[];
  onClose: () => void;
}

export default function EditTaskModal({
  task,
  categories,
  onClose,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    task.categoryId
  );
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { updateTask } = useTaskStore();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const updatedTask = {
      title,
      description,
      status,
      priority,
      dueDate,
      categoryId,
    };

    const parseResult = taskSchema.safeParse(updatedTask);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((err) => err.message)
        .join(", ");
      setError(errorMessages);
      setLoading(false);
      return;
    }

    const result = await updateTask(task.id, updatedTask);

    if (result.error) {
      setError(result.error || result.message || "Error occurred");
    } else {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Task</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="block text-gray-700 font-medium mb-1"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-gray-700 font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="task-description"
              placeholder="Enter task details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label
              htmlFor="task-status"
              className="block text-gray-700 font-medium mb-1"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
            >
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="block text-gray-700 font-medium mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
            >
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-duedate"
              className="block text-gray-700 font-medium mb-1"
            >
              Due Date
            </label>
            <input
              id="task-duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
            />
          </div>

          {categories && categories.length > 0 && (
            <div>
              <label
                htmlFor="task-category"
                className="block text-gray-700 font-medium mb-1"
              >
                Category
              </label>
              <select
                id="task-category"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
