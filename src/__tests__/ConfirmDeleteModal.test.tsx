import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

describe("ConfirmDeleteModal", () => {
  const onCloseMock = jest.fn();
  const onConfirmMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    onConfirmMock.mockClear();
  });

  test("does not render when isOpen is false", () => {
    render(
      <ConfirmDeleteModal
        isOpen={false}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
      />
    );
    expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
  });

  test("renders correctly when isOpen is true", () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
      />
    );
    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this task?")
    ).toBeInTheDocument();
  });

  test("calls onClose when Cancel is clicked", () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
      />
    );
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("calls onConfirm when Delete is clicked", () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
      />
    );
    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);
    expect(onConfirmMock).toHaveBeenCalled();
  });
});
