import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditTaskModal from "@/app/dashboard/components/EditTaskModal";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";

jest.mock("@/store/taskStore", () => ({
  useTaskStore: jest.fn(),
}));

const dummyTask: Task = {
  id: 1,
  title: "Test Task",
  description: "Task description",
  dueDate: "2023-01-01",
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.PENDING,
  createdAt: "2022-12-31",
};

describe("EditTaskModal", () => {
  let updateTaskMock: jest.Mock;
  let onCloseMock: jest.Mock;

  beforeEach(() => {
    updateTaskMock = jest.fn().mockResolvedValue({ success: true });
    onCloseMock = jest.fn();
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      updateTask: updateTaskMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders with initial values", () => {
    render(<EditTaskModal task={dummyTask} onClose={onCloseMock} />);

    expect(screen.getByPlaceholderText(/Enter task title/i)).toHaveValue(
      dummyTask.title
    );

    expect(screen.getByPlaceholderText(/Enter task details/i)).toHaveValue(
      dummyTask.description
    );

    expect(screen.getByLabelText(/Due Date/i)).toHaveValue(dummyTask.dueDate);
  });

  test("calls updateTask and onClose on form submit", async () => {
    render(<EditTaskModal task={dummyTask} onClose={onCloseMock} />);

    const titleInput = screen.getByPlaceholderText(/Enter task title/i);
    const descriptionInput = screen.getByPlaceholderText(/Enter task details/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const submitButton = screen.getByRole("button", { name: /Save Changes/i });

    fireEvent.change(titleInput, { target: { value: "Updated Task Title" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Updated description" },
    });
    fireEvent.change(dueDateInput, { target: { value: "2023-02-02" } });

    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent(/Saving.../i);

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith(dummyTask.id, {
        title: "Updated Task Title",
        description: "Updated description",
        status: dummyTask.status,
        priority: dummyTask.priority,
        dueDate: "2023-02-02",
      });
    });

    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  test("calls onClose when Cancel button is clicked", () => {
    render(<EditTaskModal task={dummyTask} onClose={onCloseMock} />);
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("updates status and priority when select values change", async () => {
    render(<EditTaskModal task={dummyTask} onClose={onCloseMock} />);

    const statusSelect = screen.getByLabelText("Status");
    fireEvent.change(statusSelect, {
      target: { value: TaskStatus.IN_PROGRESS },
    });
    expect(statusSelect).toHaveValue(TaskStatus.IN_PROGRESS);

    const prioritySelect = screen.getByLabelText("Priority");
    fireEvent.change(prioritySelect, { target: { value: TaskPriority.HIGH } });
    expect(prioritySelect).toHaveValue(TaskPriority.HIGH);

    const submitButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith(
        dummyTask.id,
        expect.objectContaining({
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
        })
      );
    });
  });

  test("displays error message when updateTask fails", async () => {
    updateTaskMock.mockResolvedValueOnce({
      success: false,
      error: "Failed to update task",
    });

    render(<EditTaskModal task={dummyTask} onClose={onCloseMock} />);

    const submitButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText("Failed to update task");
    expect(errorMessage).toBeInTheDocument();
  });
});
