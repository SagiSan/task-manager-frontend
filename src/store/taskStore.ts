import { create } from "zustand";
import {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getCategories,
  addComment,
  getComments,
} from "@/lib/api";
import {
  Category,
  Comment,
  CommentInput,
  CommentsRes,
  Task,
  TaskInput,
  TaskRes,
  TaskStatus,
} from "@/types";
import { ApiResponse } from "@/types";

interface TaskStore {
  tasks: Task[];
  total: number;
  categories: Category[];
  comments: Comment[];
  fetchCategories: () => Promise<ApiResponse<Category[]>>;
  fetchTasks: () => Promise<ApiResponse<TaskRes>>;
  fetchTask: (id: number) => Promise<ApiResponse<Task>>;
  addTask: (taskData: TaskInput) => Promise<ApiResponse<Task>>;
  updateTask: (
    id: number,
    taskData: Partial<TaskInput>
  ) => Promise<ApiResponse<null>>;
  deleteTask: (id: number) => Promise<ApiResponse<null>>;
  moveTask: (id: number, newStatus: TaskStatus) => Promise<ApiResponse<null>>;
  addComment: (commentData: CommentInput) => Promise<ApiResponse<Comment>>;
  fetchComments: (id: number) => Promise<ApiResponse<CommentsRes>>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  total: 0,
  categories: [],
  comments: [],
  fetchTasks: async () => {
    try {
      const response = await getTasks();
      if (response.success && response.data) {
        set({ tasks: response.data.tasks, total: response.data.total });
        return { success: true, data: response.data };
      } else {
        console.error("Failed to fetch tasks:", response.message);
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in fetchTasks:", errMsg);
      return { success: false, error: errMsg };
    }
  },

  fetchTask: async (taskId: number) => {
    try {
      const response = await getTaskById(taskId);
      if (response.success && response.data) {
        set({ tasks: [response.data], total: 1 });
        return { success: true, data: response.data };
      } else {
        console.error("Failed to fetch tasks:", response.message);
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in fetchTasks:", errMsg);
      return { success: false, error: errMsg };
    }
  },

  fetchCategories: async () => {
    try {
      const response = await getCategories();
      if (response.success && response.data) {
        set({ categories: response.data });
        return { success: true, data: response.data };
      } else {
        console.error("Failed to fetch tasks:", response.message);
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in fetchTasks:", errMsg);
      return { success: false, error: errMsg };
    }
  },

  addTask: async (taskData: TaskInput) => {
    const tempId = Date.now();
    const newTask: Task = {
      id: tempId,
      createdAt: new Date().toISOString(),
      ...taskData,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    try {
      const response = await addTask(taskData);
      if (response.success && response.data) {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === tempId ? response.data! : task
          ),
        }));
        return { success: true, data: response.data };
      } else {
        console.error("Failed to add task:", response.message);
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== tempId),
        }));
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in addTask:", errMsg);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== tempId),
      }));
      return { success: false, error: errMsg };
    }
  },

  updateTask: async (id: number, taskData: Partial<TaskInput>) => {
    const prevTasks = get().tasks;

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...taskData } : task
      ),
    }));

    console.log(taskData);
    try {
      const response = await updateTask(id, taskData);
      if (response.success) {
        return { success: true, data: null };
      } else {
        console.error("Failed to update task:", response.message);
        set({ tasks: prevTasks });
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in updateTask:", errMsg);
      set({ tasks: prevTasks });
      return { success: false, error: errMsg };
    }
  },

  deleteTask: async (id: number) => {
    const prevTasks = get().tasks;

    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));

    try {
      const response = await deleteTask(id);
      if (response.success) {
        return { success: true, data: null };
      } else {
        console.error("Failed to delete task:", response.message);
        set({ tasks: prevTasks });
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in deleteTask:", errMsg);
      set({ tasks: prevTasks });
      return { success: false, error: errMsg };
    }
  },

  moveTask: async (id: number, newStatus: TaskStatus) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      ),
    }));

    try {
      const response = await updateTask(id, { status: newStatus });
      if (response.success) {
        return { success: true, data: null };
      } else {
        console.error("Failed to update task status:", response.message);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status: TaskStatus.PENDING } : task
          ),
        }));
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in moveTask:", errMsg);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: TaskStatus.PENDING } : task
        ),
      }));
      return { success: false, error: errMsg };
    }
  },

  addComment: async (commentData: CommentInput) => {
    const tempId = Date.now();
    const newComment: Comment = {
      id: tempId,
      createdAt: new Date().toISOString(),
      content: commentData.content,
      taskId: commentData.taskId,
    };

    set((state) => ({ comments: [...state.comments, newComment] }));

    try {
      const response = await addComment(commentData);
      if (response.success && response.data) {
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === tempId ? response.data! : comment
          ),
        }));
        return { success: true, data: response.data };
      } else {
        console.error("Failed to add task:", response.message);
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== tempId),
        }));
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in addTask:", errMsg);
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== tempId),
      }));
      return { success: false, error: errMsg };
    }
  },

  fetchComments: async (taskId: number) => {
    try {
      const response = await getComments(taskId);
      if (response.success && response.data) {
        set({ comments: response.data.comments });
        return { success: true, data: response.data };
      } else {
        console.error("Failed to fetch tasks:", response.message);
        return {
          success: false,
          error: response.error,
          message: response.message,
        };
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unexpected error";
      console.error("Error in fetchTasks:", errMsg);
      return { success: false, error: errMsg };
    }
  },
}));
