"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { TaskStatus, TaskPriority } from "@/types/task";
import { taskSchema } from "@/schemas/taskSchema";
import AnimatedModal from "@/app/components/AnimatedModal";

export default function AddTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addTask } = useTaskStore();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const newTask = { title, description, status, priority, dueDate };

    const parseResult = taskSchema.safeParse(newTask);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((err) => err.message)
        .join(", ");
      setError(errorMessages);
      setLoading(false);
      return;
    }

    const result = await addTask(newTask);

    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error || result.message || "Error occurred");
    }

    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-3 transition"
      >
        + Add Task
      </button>

      {isOpen && (
        <AnimatedModal>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Add New Task
              </h2>
              {error && <p className="text-red-500 text-center">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Description
                  </label>
                  <textarea
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
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="due-date"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Due Date
                  </label>
                  <input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="border p-2 w-full rounded-md focus:ring focus:ring-blue-300"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </AnimatedModal>
      )}
    </>
  );
}
