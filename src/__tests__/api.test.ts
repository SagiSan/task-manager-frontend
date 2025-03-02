import {
  API_BASE,
  getUserClient,
  registerUser,
  loginUser,
  logoutUser,
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getCategories,
  addComment,
  getComments,
} from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types";

describe("API functions", () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });

  function fakeResponse<T>(
    body: T,
    ok = true,
    contentType = "application/json",
    url = "test"
  ) {
    return {
      ok,
      headers: {
        get: () => contentType,
      },
      json: async () => body,
      statusText: "Error",
      url,
    } as unknown as Response;
  }

  describe("getUserClient", () => {
    it("should return user data when response is successful", async () => {
      const fakeUser = { id: 1, email: "test@example.com" };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeUser));

      const result = await getUserClient();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeUser);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
    });

    it("should return error when response is not ok", async () => {
      fetchMock.mockResolvedValueOnce(
        fakeResponse({ message: "Not found" }, false)
      );
      const result = await getUserClient();
      expect(result.success).toBe(false);
      expect(result.message).toBe("Not found");
    });
  });

  describe("registerUser", () => {
    it("should post to signup endpoint and return success", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse(null));
      const result = await registerUser("test@example.com", "password123");
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });

  describe("loginUser", () => {
    it("should post to login endpoint and return success", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse(null));
      const result = await loginUser("test@example.com", "password123");
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });

  describe("logoutUser", () => {
    it("should post to logout endpoint and return success", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse(null));
      const result = await logoutUser();
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    });
  });

  describe("getTasks", () => {
    it("should fetch tasks with given filters", async () => {
      const fakeTasks = { tasks: [{ id: 1, title: "Task 1" }] };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeTasks));
      const result = await getTasks("status=pending");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeTasks);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/tasks?status=pending`,
        {
          method: "GET",
          credentials: "include",
        }
      );
    });
  });

  describe("getTaskById", () => {
    it("should fetch a single task", async () => {
      const fakeTask = { id: 1, title: "Task 1" };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeTask));
      const result = await getTaskById(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeTask);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/tasks/1`, {
        method: "GET",
        credentials: "include",
      });
    });
  });

  describe("addTask", () => {
    it("should post new task data", async () => {
      const taskInput = {
        title: "New Task",
        description: "Test",
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: "2025-03-03",
      };
      const fakeTask = { id: 2, ...taskInput };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeTask));
      const result = await addTask(taskInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeTask);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskInput),
      });
    });
  });

  describe("updateTask", () => {
    it("should update a task", async () => {
      const updateData = { title: "Updated Task" };
      const fakeTask = { id: 1, title: "Updated Task" };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeTask));
      const result = await updateTask(1, updateData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeTask);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/tasks/1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete a task", async () => {
      fetchMock.mockResolvedValueOnce(fakeResponse(null));
      const result = await deleteTask(1);
      expect(result.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/tasks/1`, {
        method: "DELETE",
        credentials: "include",
      });
    });
  });

  describe("getCategories", () => {
    it("should fetch categories", async () => {
      const fakeCategories = [{ id: 1, name: "work" }];
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeCategories));
      const result = await getCategories();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeCategories);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/categories`, {
        method: "GET",
        credentials: "include",
      });
    });
  });

  describe("addComment", () => {
    it("should add a comment to a task", async () => {
      const commentInput = { taskId: 1, content: "Nice task!" };
      const fakeComment = {
        id: 1,
        content: "Nice task!",
        createdAt: new Date().toISOString(),
      };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeComment));
      const result = await addComment(commentInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeComment);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/comments/1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentInput.content }),
      });
    });
  });

  describe("getComments", () => {
    it("should fetch comments for a task", async () => {
      const fakeComments = {
        comments: [
          { id: 1, content: "Comment", createdAt: new Date().toISOString() },
        ],
      };
      fetchMock.mockResolvedValueOnce(fakeResponse(fakeComments));
      const result = await getComments(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(fakeComments);
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/comments/1`, {
        method: "GET",
        credentials: "include",
      });
    });
  });
});
