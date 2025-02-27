import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTaskModal from "@/app/dashboard/components/AddTaskModal";
import { useTaskStore } from "@/store/taskStore";
import { TaskPriority, TaskStatus } from "@/types";

jest.mock("@/store/taskStore", () => ({
  useTaskStore: jest.fn(),
}));

describe("AddTaskModal", () => {
  let addTaskMock: jest.Mock;

  beforeEach(() => {
    addTaskMock = jest.fn().mockResolvedValue(undefined);

    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      addTask: addTaskMock,
    });
  });

  test("renders the Add Task button", () => {
    render(<AddTaskModal />);
    expect(screen.getByText("+ Add Task")).toBeInTheDocument();
  });

  test("opens the modal when clicking the Add Task button", () => {
    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));
    expect(screen.getByText("Add New Task")).toBeInTheDocument();
  });

  test("calls addTask function and closes modal on successful submit", async () => {
    addTaskMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        createdAt: new Date().toISOString(),
        title: "Test Task",
        description: "Task Details",
        status: "pending",
        priority: "medium",
        dueDate: "",
      },
    });

    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));

    fireEvent.change(screen.getByPlaceholderText("Enter task title"), {
      target: { value: "Test Task" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter task details"), {
      target: { value: "Task Details" },
    });

    fireEvent.click(screen.getByText("Add Task"));

    await waitFor(() => expect(addTaskMock).toHaveBeenCalledTimes(1));
    expect(addTaskMock).toHaveBeenCalledWith({
      title: "Test Task",
      description: "Task Details",
      status: "pending",
      priority: "medium",
      dueDate: "",
    });

    await waitFor(() =>
      expect(screen.queryByText("Add New Task")).not.toBeInTheDocument()
    );
  });

  test("allows user to change status, priority, and due date", () => {
    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));

    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, {
      target: { value: TaskStatus.IN_PROGRESS },
    });
    expect(statusSelect).toHaveValue(TaskStatus.IN_PROGRESS);

    const prioritySelect = screen.getByLabelText("Priority");
    fireEvent.change(prioritySelect, { target: { value: TaskPriority.HIGH } });
    expect(prioritySelect).toHaveValue(TaskPriority.HIGH);

    const dueDateInput = screen.getByLabelText("Due Date");
    fireEvent.change(dueDateInput, { target: { value: "2025-03-01" } });
    expect(dueDateInput).toHaveValue("2025-03-01");
  });

  test("closes modal when clicking Cancel", () => {
    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));
    expect(screen.getByText("Add New Task")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Add New Task")).not.toBeInTheDocument();
  });

  test("shows loading state on submit", async () => {
    let resolvePromise!: (value: unknown) => void;

    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    addTaskMock.mockReturnValueOnce(pendingPromise);

    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));

    fireEvent.change(screen.getByPlaceholderText("Enter task title"), {
      target: { value: "Loading Task" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter task details"), {
      target: { value: "Task Details" },
    });

    fireEvent.click(screen.getByText("Add Task"));

    expect(screen.getByText("Adding...")).toBeInTheDocument();

    resolvePromise({
      success: true,
      data: {
        id: 1,
        createdAt: new Date().toISOString(),
        title: "Loading Task",
        description: "Task Details",
        status: "pending",
        priority: "medium",
        dueDate: "",
      },
    });

    await waitFor(() =>
      expect(screen.queryByText("Add New Task")).not.toBeInTheDocument()
    );
  });

  test("displays error message when addTask fails", async () => {
    addTaskMock.mockResolvedValueOnce({
      success: false,
      error: "Failed to add task",
    });

    render(<AddTaskModal />);
    fireEvent.click(screen.getByText("+ Add Task"));

    fireEvent.change(screen.getByPlaceholderText("Enter task title"), {
      target: { value: "Test Task" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter task details"), {
      target: { value: "Task Details" },
    });

    fireEvent.click(screen.getByText("Add Task"));

    const errorMessage = await screen.findByText("Failed to add task");
    expect(errorMessage).toBeInTheDocument();
  });
});
