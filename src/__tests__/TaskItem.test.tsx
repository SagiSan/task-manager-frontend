import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskItem from "@/app/dashboard/components/TaskItem";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { EditTaskModalProps } from "@/app/dashboard/components/EditTaskModal";
import { ConfirmDeleteModalProps } from "@/app/components/ConfirmDeleteModal";

jest.mock("@/store/taskStore", () => ({
  useTaskStore: jest.fn(),
}));

jest.mock("@/app/dashboard/components/EditTaskModal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  const EditTaskModal: React.FC<EditTaskModalProps> = (props) => {
    return React.createElement(
      "div",
      { "data-testid": "edit-task-modal" },
      "EditTaskModal",
      React.createElement("button", { onClick: props.onClose }, "Close Edit")
    );
  };

  EditTaskModal.displayName = "EditTaskModal";
  return EditTaskModal;
});

jest.mock("@/app/components/ConfirmDeleteModal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = (props) => {
    if (!props.isOpen) return null;
    return React.createElement(
      "div",
      { "data-testid": "confirm-delete-modal" },
      "ConfirmDeleteModal",
      React.createElement("button", { onClick: props.onConfirm }, "Confirm"),
      React.createElement("button", { onClick: props.onClose }, "Close Confirm")
    );
  };

  ConfirmDeleteModal.displayName = "ConfirmDeleteModal";
  return ConfirmDeleteModal;
});

const mockDeleteTask = jest.fn();

beforeEach(() => {
  (useTaskStore as unknown as jest.Mock).mockReturnValue({
    deleteTask: mockDeleteTask,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const dummyTask: Task = {
  id: 1,
  title: "Sample Task",
  description: "This is a sample task",
  dueDate: "2023-01-01T00:00:00.000Z",
  priority: TaskPriority.MEDIUM,
  createdAt: "2022-12-31T00:00:00.000Z",
  status: TaskStatus.PENDING,
};

test("renders task information", () => {
  render(<TaskItem task={dummyTask} />);

  const link = screen.getByRole("link", { name: dummyTask.title });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href", `/dashboard/task/${dummyTask.id}`);

  expect(screen.getByText(dummyTask.description!)).toBeInTheDocument();

  const expectedDate = new Date(dummyTask.dueDate!).toLocaleDateString();
  expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();

  expect(screen.getByText(dummyTask.priority)).toBeInTheDocument();
});

test("opens edit modal when edit button is clicked", () => {
  render(<TaskItem task={dummyTask} />);

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  fireEvent.click(editButton);

  expect(screen.getByTestId("edit-task-modal")).toBeInTheDocument();
});

test("opens confirm delete modal when delete button is clicked", () => {
  render(<TaskItem task={dummyTask} />);

  const buttons = screen.getAllByRole("button");
  const deleteButton = buttons[1];
  fireEvent.click(deleteButton);

  expect(screen.getByTestId("confirm-delete-modal")).toBeInTheDocument();
});

test("calls deleteTask when confirm delete is triggered", async () => {
  mockDeleteTask.mockResolvedValueOnce({ success: true });

  render(<TaskItem task={dummyTask} />);

  const buttons = screen.getAllByRole("button");
  const deleteButton = buttons[1];
  fireEvent.click(deleteButton);

  expect(screen.getByTestId("confirm-delete-modal")).toBeInTheDocument();

  const confirmButton = screen.getByText("Confirm");
  fireEvent.click(confirmButton);

  await waitFor(() => {
    expect(mockDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockDeleteTask).toHaveBeenCalledWith(dummyTask.id);
  });
});

test("shows loading state on delete (button shows '...')", async () => {
  let resolveDelete!: (value: unknown) => void;
  const pendingDelete = new Promise((resolve) => {
    resolveDelete = resolve;
  });
  mockDeleteTask.mockReturnValueOnce(pendingDelete);

  render(<TaskItem task={dummyTask} />);

  const buttons = screen.getAllByRole("button");
  const deleteButton = buttons[1];
  fireEvent.click(deleteButton);

  const confirmButton = screen.getByText("Confirm");
  fireEvent.click(confirmButton);

  expect(screen.getByText("...")).toBeInTheDocument();

  resolveDelete({ success: true });

  await waitFor(() =>
    expect(screen.queryByTestId("confirm-delete-modal")).not.toBeInTheDocument()
  );
});

test("displays 'No Due Date' when task.dueDate is undefined", () => {
  const taskWithoutDueDate = {
    ...dummyTask,
    dueDate: undefined,
  };
  render(<TaskItem task={taskWithoutDueDate} />);

  expect(screen.getByText("No Due Date")).toBeInTheDocument();
});

test("does not render modals by default", () => {
  render(<TaskItem task={dummyTask} />);
  expect(screen.queryByTestId("edit-task-modal")).not.toBeInTheDocument();
  expect(screen.queryByTestId("confirm-delete-modal")).not.toBeInTheDocument();
});

test("opens edit modal when edit button is clicked", () => {
  render(<TaskItem task={dummyTask} />);
  const [editButton] = screen.getAllByRole("button");
  fireEvent.click(editButton);
  expect(screen.getByTestId("edit-task-modal")).toBeInTheDocument();
});

test("opens confirm delete modal when delete button is clicked", () => {
  render(<TaskItem task={dummyTask} />);
  const buttons = screen.getAllByRole("button");
  const deleteButton = buttons[1];
  fireEvent.click(deleteButton);
  expect(screen.getByTestId("confirm-delete-modal")).toBeInTheDocument();
});

test("closes modals correctly via their onClose callbacks", async () => {
  render(<TaskItem task={dummyTask} />);

  const [editButton] = screen.getAllByRole("button");
  fireEvent.click(editButton);
  expect(screen.getByTestId("edit-task-modal")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Close Edit"));
  await waitFor(() =>
    expect(screen.queryByTestId("edit-task-modal")).not.toBeInTheDocument()
  );

  const buttons = screen.getAllByRole("button");
  const deleteButton = buttons[1];
  fireEvent.click(deleteButton);
  expect(screen.getByTestId("confirm-delete-modal")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Close Confirm"));
  await waitFor(() =>
    expect(screen.queryByTestId("confirm-delete-modal")).not.toBeInTheDocument()
  );
});
