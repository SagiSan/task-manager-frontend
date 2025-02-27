"use server";

import { Task } from "@/types/task";
import { ApiResponse } from "@/types/api";
import { cookies } from "next/headers";

const API_BASE = "http://localhost:3000";

export interface User {
  id: number;
  email: string;
}

async function processServerResponse<T>(
  res: Response
): Promise<ApiResponse<T>> {
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
    console.error(`Server API Error (${res?.url ?? "[unknown URL]"}):`, error);
    return { success: false, message: (error as Error).message };
  }
}

export async function getUserServer(): Promise<ApiResponse<User>> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });
    return await processServerResponse(res);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function getTaskById(id: number): Promise<ApiResponse<Task>> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });
    return await processServerResponse(res);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
