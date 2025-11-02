import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ItemAdd from "./ItemAdd";
import type { AxiosInstance } from "axios";

describe("ItemAdd Component", () => {
  let mockApi: AxiosInstance;

  beforeEach(() => {
    mockApi = {
      post: vi.fn().mockResolvedValue({ data: {} }),
    } as any;
  });

  describe("Rendering", () => {
    it("renders the heading", () => {
      render(<ItemAdd api={mockApi} />);
      const headings = screen.getAllByText("Item(s) toevoegen");
      expect(headings[0]).toBeInTheDocument();
    });

    it("renders the form with correct id", () => {
      const { container } = render(<ItemAdd api={mockApi} />);
      const form = container.querySelector("#addItemForm");
      expect(form).toHaveAttribute("id", "addItemForm");
    });

    it("renders description input field", () => {
      render(<ItemAdd api={mockApi} />);
      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput).toHaveAttribute("type", "text");
      expect(descriptionInput).toHaveAttribute("name", "description");
    });

    it("renders quantity input field", () => {
      render(<ItemAdd api={mockApi} />);
      const quantityInput = screen.getByPlaceholderText("120");
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveAttribute("type", "number");
      expect(quantityInput).toHaveAttribute("name", "quantity");
      expect(quantityInput).toHaveAttribute("min", "1");
    });

    it("renders submit button", () => {
      render(<ItemAdd api={mockApi} />);
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Form Submission", () => {
    it("prevents default form submission", async () => {
      const { container } = render(<ItemAdd api={mockApi} />);
      const form = container.querySelector("#addItemForm");
      const mockPreventDefault = vi.fn();

      const event = new Event("submit", { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;

      fireEvent(form!, event);

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("submits form with correct data", async () => {
      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Red pens" },
      });
      fireEvent.change(quantityInput, { target: { value: "50" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item", {
          description: "Red pens",
          quantity: 50,
        });
      });
    });

    it("converts quantity to number", async () => {
      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Notebooks" } });
      fireEvent.change(quantityInput, { target: { value: "100" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item", {
          description: "Notebooks",
          quantity: 100,
        });
      });

      const callArgs = (mockApi.post as any).mock.calls[0][1];
      expect(typeof callArgs.quantity).toBe("number");
    });

    it("resets form after successful submission", async () => {
      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText(
        "blauwe stylo's"
      ) as HTMLInputElement;
      const quantityInput = screen.getByPlaceholderText(
        "120"
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test item" } });
      fireEvent.change(quantityInput, { target: { value: "10" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(descriptionInput.value).toBe("");
        expect(quantityInput.value).toBe("");
      });
    });

    it("resets form even on API error", async () => {
      const errorMessage = "Network error";
      mockApi.post = vi.fn().mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText(
        "blauwe stylo's"
      ) as HTMLInputElement;
      const quantityInput = screen.getByPlaceholderText(
        "120"
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test item" } });
      fireEvent.change(quantityInput, { target: { value: "10" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(descriptionInput.value).toBe("");
        expect(quantityInput.value).toBe("");
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("handles API errors gracefully", async () => {
      const errorMessage = "Failed to add item";
      mockApi.post = vi.fn().mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test" } });
      fireEvent.change(quantityInput, { target: { value: "5" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error adding item:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("logs form data to console", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test item" } });
      fireEvent.change(quantityInput, { target: { value: "25" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith({
          description: "Test item",
          quantity: "25",
        });
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty form submission", async () => {
      render(<ItemAdd api={mockApi} />);

      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).not.toHaveBeenCalled();
      });
    });

    it("handles very large quantity values", async () => {
      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Bulk items" } });
      fireEvent.change(quantityInput, { target: { value: "999999" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item", {
          description: "Bulk items",
          quantity: 999999,
        });
      });
    });

    it("handles special characters in description", async () => {
      render(<ItemAdd api={mockApi} />);

      const descriptionInput = screen.getByPlaceholderText("blauwe stylo's");
      const quantityInput = screen.getByPlaceholderText("120");
      const submitButton = screen.getByRole("button", {
        name: "Item(s) toevoegen",
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Test & <special> 'chars'" },
      });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item", {
          description: "Test & <special> 'chars'",
          quantity: 1,
        });
      });
    });
  });
});
