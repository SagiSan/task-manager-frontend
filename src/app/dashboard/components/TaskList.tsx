"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskStore } from "@/store/taskStore";
import { TaskStatus, TaskPriority } from "@/types/task";
import TaskItem from "./TaskItem";
import { FaFilter, FaTimes } from "react-icons/fa";
import AddTaskModal from "./AddTaskModal";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

export default function TaskList() {
  const { tasks, fetchTasks, moveTask } = useTaskStore();
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterDueDate, setFilterDueDate] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatus.COMPLETED
  ).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const clearFilter = (type: "status" | "priority" | "dueDate") => {
    if (type === "status") setFilterStatus("");
    if (type === "priority") setFilterPriority("");
    if (type === "dueDate") setFilterDueDate("");
  };

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterPriority("");
    setFilterDueDate("");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = Number(result.draggableId);
    const newStatus = result.destination.droppableId as TaskStatus;

    moveTask(taskId, newStatus);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesPriority = filterPriority
      ? task.priority === filterPriority
      : true;
    const matchesDueDate = filterDueDate
      ? task.dueDate && new Date(task.dueDate) <= new Date(filterDueDate)
      : true;
    return matchesStatus && matchesPriority && matchesDueDate;
  });

  const renderColumn = (status: TaskStatus, bgColor: string) => (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${bgColor} p-4 rounded-lg shadow min-h-[300px]`}
        >
          <h2 className="text-lg font-bold mb-4">
            {status.replace("_", " ").charAt(0).toUpperCase() +
              status.replace("_", " ").slice(1)}
          </h2>{" "}
          {filteredTasks
            .filter((task) => task.status === status)
            .map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskItem task={task} />
                  </div>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="w-full">
      <div id="progress-bar" className="mb-6">
        <p className="text-gray-700 font-semibold">
          Progress: {progressPercentage}%
        </p>
        <div className="w-full bg-gray-200 h-4 rounded-lg overflow-hidden">
          <div
            className={`h-full ${
              progressPercentage === 100
                ? "bg-green-500"
                : progressPercentage >= 50
                ? "bg-blue-500"
                : "bg-red-500"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <AddTaskModal />
        <div className="relative mb-6" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700"
          >
            <FaFilter className="inline-block mr-2" />
            Filters
          </button>

          {isFilterOpen && (
            <div className="absolute mt-2 w-64 bg-white shadow-lg rounded-lg p-3 border">
              <div>
                <p className="text-gray-600 font-semibold">Status</p>
                <button
                  onClick={() => setFilterStatus("")}
                  className={`block w-full text-left px-2 py-1 rounded mt-1 ${
                    filterStatus === ""
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {Object.values(TaskStatus).map((status) => (
                  <button
                    key={status}
                    data-testid={`status-filter-${status}`}
                    onClick={() => setFilterStatus(status)}
                    className={`block w-full text-left px-2 py-1 rounded mt-1 ${
                      filterStatus === status
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <p className="text-gray-600 font-semibold">Priority</p>
                <button
                  onClick={() => setFilterPriority("")}
                  className={`block w-full text-left px-2 py-1 rounded mt-1 ${
                    filterPriority === ""
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {Object.values(TaskPriority).map((priority) => (
                  <button
                    data-testid={`${priority}-button`}
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`block w-full text-left px-2 py-1 rounded mt-1 ${
                      filterPriority === priority
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <p className="text-gray-600 font-semibold">Due Date</p>
                <input
                  data-testid="date-input"
                  type="date"
                  className="w-full px-2 py-1 border rounded mt-1"
                  onChange={(e) => setFilterDueDate(e.target.value)}
                />
              </div>

              <button
                data-testid="clear-all"
                onClick={clearAllFilters}
                className="mt-4 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filterStatus && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
            {filterStatus}
            <FaTimes
              data-testid="status-tag"
              onClick={() => clearFilter("status")}
              className="ml-2 cursor-pointer hover:text-red-500"
            />
          </span>
        )}
        {filterPriority && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
            {filterPriority}
            <FaTimes
              data-testid="priority-tag"
              onClick={() => clearFilter("priority")}
              className="ml-2 cursor-pointer hover:text-red-500"
            />
          </span>
        )}
        {filterDueDate && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
            Due: {new Date(filterDueDate).toLocaleDateString()}
            <FaTimes
              data-testid="duedate-tag"
              onClick={() => clearFilter("dueDate")}
              className="ml-2 cursor-pointer hover:text-red-500"
            />
          </span>
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn(TaskStatus.PENDING, "bg-blue-100")}
          {renderColumn(TaskStatus.IN_PROGRESS, "bg-yellow-100")}
          {renderColumn(TaskStatus.COMPLETED, "bg-green-100")}
        </div>
      </DragDropContext>
    </div>
  );
}
