import { Task, TaskInput, TaskRes } from "@/types/task";
import { ApiResponse } from "@/types/api";

export const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD
    : process.env.NEXT_PUBLIC_BACKEND_URL;

console.log(
  API_BASE,
  process.env.NODE_ENV,
  process.env.NEXT_PUBLIC_BACKEND_URL_PROD,
  process.env.NEXT_PUBLIC_BACKEND_URL
);

async function processResponse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!res.ok) {
      const errorMessage = isJson ? (await res.json()).message : res.statusText;
      throw new Error(errorMessage || "Unknown API error");
    }

    const data = isJson ? await res.json() : null;
    return { success: true, data };
  } catch (error) {
    console.error(`API Error (${res?.url ?? "[unknown URL]"}):`, error);
    return { success: false, message: (error as Error).message };
  }
}

export async function getUserClient(): Promise<
  ApiResponse<{ id: number; email: string }>
> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function registerUser(
  email: string,
  password: string
): Promise<ApiResponse<null>> {
  try {
    const res = await fetch(`${API_BASE}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<null>> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function logoutUser(): Promise<ApiResponse<null>> {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function getTasks(filters = ""): Promise<ApiResponse<TaskRes>> {
  try {
    const res = await fetch(`${API_BASE}/tasks?${filters}`, {
      method: "GET",
      credentials: "include",
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function addTask(taskData: TaskInput): Promise<ApiResponse<Task>> {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(taskData),
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function updateTask(
  id: number,
  taskData: Partial<TaskInput>
): Promise<ApiResponse<Task>> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(taskData),
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteTask(id: number): Promise<ApiResponse<null>> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await processResponse(res);
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, message: (error as Error).message };
  }
}
