import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskList from "@/app/dashboard/components/TaskList";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { DropResult } from "@hello-pangea/dnd";

const dummyTasks: Task[] = [
  {
    id: 1,
    title: "Pending Task",
    description: "A pending task",
    dueDate: "2023-01-01T00:00:00.000Z",
    priority: TaskPriority.LOW,
    createdAt: "2022-12-31T00:00:00.000Z",
    status: TaskStatus.PENDING,
  },
  {
    id: 2,
    title: "In Progress Task",
    description: "An in progress task",
    dueDate: "2023-02-01T00:00:00.000Z",
    priority: TaskPriority.MEDIUM,
    createdAt: "2023-01-01T00:00:00.000Z",
    status: TaskStatus.IN_PROGRESS,
  },
  {
    id: 3,
    title: "Completed Task",
    description: "A completed task",
    dueDate: "2023-03-01T00:00:00.000Z",
    priority: TaskPriority.HIGH,
    createdAt: "2023-02-01T00:00:00.000Z",
    status: TaskStatus.COMPLETED,
  },
];

let fetchTasksMock: jest.Mock, moveTaskMock: jest.Mock;

jest.mock("@/store/taskStore", () => ({
  useTaskStore: jest.fn(),
}));

beforeEach(() => {
  fetchTasksMock = jest.fn();
  moveTaskMock = jest.fn();
  (useTaskStore as unknown as jest.Mock).mockReturnValue({
    tasks: dummyTasks,
    fetchTasks: fetchTasksMock,
    moveTask: moveTaskMock,
  });
});
afterEach(() => {
  jest.clearAllMocks();
});

describe("TaskList", () => {
  test("calls fetchTasks on mount", () => {
    render(<TaskList />);
    expect(fetchTasksMock).toHaveBeenCalled();
  });

  test("displays correct progress bar", () => {
    render(<TaskList />);

    expect(screen.getByText(/Progress: 33%/i)).toBeInTheDocument();

    const container = document.getElementById("progress-bar");
    expect(container).toBeInTheDocument();

    const outerBar = container?.querySelector(
      "div.w-full.bg-gray-200.h-4.rounded-lg.overflow-hidden"
    );
    expect(outerBar).toBeInTheDocument();

    const innerBar = outerBar?.firstElementChild as HTMLElement;
    expect(innerBar).toBeInTheDocument();

    expect(innerBar.style.width).toBe("33%");
  });

  test("toggles filter dropdown when Filters button clicked and closes when clicking outside", async () => {
    render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    expect(screen.queryByText("Status")).not.toBeInTheDocument();

    fireEvent.click(filtersButton);
    expect(screen.getByText("Status")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Status")).not.toBeInTheDocument();
    });
  });

  test("applies and clears filters", async () => {
    render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);

    const pendingFilterButton = screen.getByTestId("status-filter-pending");
    fireEvent.click(pendingFilterButton);

    expect(screen.getByTestId("status-tag")).toBeInTheDocument();

    const clearStatusIcon = screen.getByTestId("status-tag");
    fireEvent.click(clearStatusIcon);

    await waitFor(() => {
      expect(screen.queryByTestId("status-tag")).not.toBeInTheDocument();
    });

    const clearAllButton = screen.getByTestId("clear-all");
    fireEvent.click(clearAllButton);
    expect(screen.queryByTestId("status-tag")).not.toBeInTheDocument();
  });

  test("renders tasks in correct columns", () => {
    render(<TaskList />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    expect(screen.getByText("Pending Task")).toBeInTheDocument();
    expect(screen.getByText("In Progress Task")).toBeInTheDocument();
    expect(screen.getByText("Completed Task")).toBeInTheDocument();
  });

  test("calls moveTask on drag end", () => {
    render(<TaskList />);
    const fakeDropResult: DropResult = {
      draggableId: "1",
      destination: { droppableId: TaskStatus.IN_PROGRESS, index: 0 },
      source: { droppableId: TaskStatus.PENDING, index: 0 },
      type: "DEFAULT",
      reason: "DROP",
      mode: "FLUID",
      combine: null,
    };

    moveTaskMock.mockClear();
    moveTaskMock(
      Number(fakeDropResult.draggableId),
      fakeDropResult.destination!.droppableId as TaskStatus
    );

    expect(moveTaskMock).toHaveBeenCalledWith(1, TaskStatus.IN_PROGRESS);
  });

  test("filters tasks by due date", () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: "Early Task",
        description: "Task due early",
        dueDate: "2023-01-01T00:00:00.000Z",
        priority: TaskPriority.MEDIUM,
        createdAt: "2022-12-31T00:00:00.000Z",
        status: TaskStatus.PENDING,
      },
      {
        id: 2,
        title: "Late Task",
        description: "Task due late",
        dueDate: "2023-05-01T00:00:00.000Z",
        priority: TaskPriority.MEDIUM,
        createdAt: "2023-01-01T00:00:00.000Z",
        status: TaskStatus.PENDING,
      },
    ];

    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks,
      fetchTasks: jest.fn(),
      moveTask: jest.fn(),
    });

    const { container } = render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);

    const dueDateInput = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    expect(dueDateInput).toBeInTheDocument();

    fireEvent.change(dueDateInput, { target: { value: "2023-02-01" } });

    expect(screen.getByText("Early Task")).toBeInTheDocument();
    expect(screen.queryByText("Late Task")).not.toBeInTheDocument();
  });

  test("closes filter dropdown when clicking outside", async () => {
    render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);
    expect(screen.getByText("Status")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Status")).not.toBeInTheDocument();
    });
  });

  test("applies and clears priority filter", async () => {
    render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);

    const highPriorityButton = screen.getByTestId("high-button");
    fireEvent.click(highPriorityButton);

    expect(screen.getByTestId("priority-tag")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("priority-tag"));
    await waitFor(() => {
      expect(screen.queryByTestId("priority-tag")).not.toBeInTheDocument();
    });
  });

  test("clear all filters resets status, priority, and due date filters", async () => {
    render(<TaskList />);
    const filtersButton = screen.getByRole("button", { name: /Filters/i });
    fireEvent.click(filtersButton);

    const statusFilterButton = screen.getByTestId("status-filter-pending");
    fireEvent.click(statusFilterButton);
    expect(screen.getByTestId("status-tag")).toBeInTheDocument();

    const highPriorityButton = screen.getByRole("button", { name: /HIGH/i });
    fireEvent.click(highPriorityButton);
    expect(screen.getByTestId("priority-tag")).toBeInTheDocument();

    const clearAllButton = screen.getByTestId("clear-all");
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(screen.queryByTestId("status-tag")).not.toBeInTheDocument();
      expect(screen.queryByTestId("priority-tag")).not.toBeInTheDocument();
      expect(screen.queryByTestId("duedate-tag")).not.toBeInTheDocument();
    });
  });

  test("renders empty column when no tasks for a status", () => {
    const tasks: Task[] = [
      {
        id: 1,
        title: "Pending Task",
        description: "Pending description",
        dueDate: "2023-01-01T00:00:00.000Z",
        priority: TaskPriority.LOW,
        status: TaskStatus.PENDING,
        createdAt: "2022-12-31T00:00:00.000Z",
      },
      {
        id: 2,
        title: "In Progress Task",
        description: "In progress description",
        dueDate: "2023-02-01T00:00:00.000Z",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    ];
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks,
      fetchTasks: jest.fn(),
      moveTask: jest.fn(),
    });
    render(<TaskList />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.queryByText("Completed Task")).not.toBeInTheDocument();
  });
});
