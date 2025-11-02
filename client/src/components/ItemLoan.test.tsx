import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ItemLoan from "./ItemLoan";
import type { AxiosInstance } from "axios";

describe("ItemLoan Component", () => {
  let mockApi: AxiosInstance;

  beforeEach(() => {
    mockApi = {
      post: vi.fn().mockResolvedValue({ data: {} }),
    } as any;
  });

  describe("Rendering", () => {
    it("renders the loan heading", () => {
      render(<ItemLoan api={mockApi} />);
      expect(
        screen.getByRole("heading", { name: "Item uitlenen" })
      ).toBeInTheDocument();
    });

    it("renders the end loan heading", () => {
      render(<ItemLoan api={mockApi} />);
      expect(
        screen.getByRole("heading", { name: "lening beëindigen" })
      ).toBeInTheDocument();
    });

    it("renders both forms", () => {
      render(<ItemLoan api={mockApi} />);
      const loanForm = document.getElementById("itemLoanForm");
      expect(loanForm).toBeInTheDocument();

      const endLoanForm = document.getElementById("itemEndLoanForm");
      expect(endLoanForm).toBeInTheDocument();
    });

    it("renders loan form inputs", () => {
      render(<ItemLoan api={mockApi} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it("renders quantity inputs with min attribute", () => {
      render(<ItemLoan api={mockApi} />);
      const quantityInputs = screen.getAllByRole("spinbutton");
      quantityInputs.forEach((input) => {
        expect(input).toHaveAttribute("min", "1");
      });
    });

    it("renders loan submit button", () => {
      render(<ItemLoan api={mockApi} />);
      const loanButton = screen.getByRole("button", { name: "Item uitlenen" });
      expect(loanButton).toBeInTheDocument();
      expect(loanButton).toHaveAttribute("type", "submit");
    });

    it("renders end loan submit button", () => {
      render(<ItemLoan api={mockApi} />);
      const endLoanButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });
      expect(endLoanButton).toBeInTheDocument();
      expect(endLoanButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Loan Form Submission", () => {
    it("prevents default on loan form submission", () => {
      render(<ItemLoan api={mockApi} />);
      const form = document.getElementById("itemLoanForm");
      const mockPreventDefault = vi.fn();

      const event = new Event("submit", { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;

      fireEvent(form!, event);
      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("submits loan form with correct data", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Laptops" } });
      fireEvent.change(quantityInput, { target: { value: "5" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item_loan", {
          description: "Laptops",
          quantity: "5",
        });
      });
    });

    it("handles loan form with empty values", async () => {
      render(<ItemLoan api={mockApi} />);

      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item_loan", {
          description: "",
          quantity: "",
        });
      });
    });

    it("handles special characters in loan description", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Test & <script> alert('xss')" },
      });
      fireEvent.change(quantityInput, { target: { value: "3" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item_loan", {
          description: "Test & <script> alert('xss')",
          quantity: "3",
        });
      });
    });

    it("handles large quantity values in loan form", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Many items" } });
      fireEvent.change(quantityInput, { target: { value: "999999" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item_loan", {
          description: "Many items",
          quantity: "999999",
        });
      });
    });
  });

  describe("End Loan Form Submission", () => {
    it("prevents default on end loan form submission", () => {
      render(<ItemLoan api={mockApi} />);
      const form = document.getElementById("itemEndLoanForm");
      const mockPreventDefault = vi.fn();

      const event = new Event("submit", { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;

      fireEvent(form!, event);
      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("submits end loan form with correct data", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemEndLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Projectors" } });
      fireEvent.change(quantityInput, { target: { value: "2" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/end_item_loan", {
          description: "Projectors",
          quantity: "2",
        });
      });
    });

    it("handles end loan form with empty values", async () => {
      render(<ItemLoan api={mockApi} />);

      const submitButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/end_item_loan", {
          description: "",
          quantity: "",
        });
      });
    });

    it("handles special characters in end loan description", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemEndLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });

      fireEvent.change(descriptionInput, {
        target: { value: "Items with ñ, é, and ü" },
      });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/end_item_loan", {
          description: "Items with ñ, é, and ü",
          quantity: "1",
        });
      });
    });
  });

  describe("API Integration", () => {
    it("calls correct endpoint for loan", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test" } });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/api/add_item_loan",
          expect.any(Object)
        );
      });
    });

    it("calls correct endpoint for end loan", async () => {
      render(<ItemLoan api={mockApi} />);

      const form = document.getElementById("itemEndLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test" } });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/api/end_item_loan",
          expect.any(Object)
        );
      });
    });

    it("handles API errors gracefully on loan", async () => {
      const errorApi = {
        post: vi.fn().mockRejectedValue(new Error("API Error")),
      } as any;

      render(<ItemLoan api={errorApi} />);

      const form = document.getElementById("itemLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "Item uitlenen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test" } });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(errorApi.post).toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully on end loan", async () => {
      const errorApi = {
        post: vi.fn().mockRejectedValue(new Error("API Error")),
      } as any;

      render(<ItemLoan api={errorApi} />);

      const form = document.getElementById("itemEndLoanForm");
      const descriptionInput = form?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const quantityInput = form?.querySelector(
        'input[name="quantity"]'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: "lening beëindigen",
      });

      fireEvent.change(descriptionInput, { target: { value: "Test" } });
      fireEvent.change(quantityInput, { target: { value: "1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(errorApi.post).toHaveBeenCalled();
      });
    });
  });

  describe("Form Independence", () => {
    it("loan form submission does not affect end loan form", async () => {
      render(<ItemLoan api={mockApi} />);

      const loanForm = document.getElementById("itemLoanForm");
      const loanDescInput = loanForm?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const loanSubmit = screen.getByRole("button", { name: "Item uitlenen" });

      fireEvent.change(loanDescInput, { target: { value: "Item A" } });
      fireEvent.click(loanSubmit);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/add_item_loan", {
          description: "Item A",
          quantity: "",
        });
      });

      expect(mockApi.post).not.toHaveBeenCalledWith(
        "/api/end_item_loan",
        expect.any(Object)
      );
    });

    it("end loan form submission does not affect loan form", async () => {
      render(<ItemLoan api={mockApi} />);

      const endLoanForm = document.getElementById("itemEndLoanForm");
      const endLoanDescInput = endLoanForm?.querySelector(
        'input[name="description"]'
      ) as HTMLInputElement;
      const endLoanSubmit = screen.getByRole("button", {
        name: "lening beëindigen",
      });

      fireEvent.change(endLoanDescInput, { target: { value: "Item B" } });
      fireEvent.click(endLoanSubmit);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/api/end_item_loan", {
          description: "Item B",
          quantity: "",
        });
      });

      const calls = (mockApi.post as any).mock.calls;
      const loanCalls = calls.filter(
        (call: any) => call[0] === "/api/add_item_loan"
      );
      expect(loanCalls.length).toBe(0);
    });
  });
});
