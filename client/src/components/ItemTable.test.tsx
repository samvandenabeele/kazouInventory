import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ItemTable from "./ItemTable";
import type { AxiosInstance } from "axios";

describe("ItemTable Component", () => {
  let mockApi: AxiosInstance;
  const mockInventoryData = [
    { description: "Blue Pens", quantity: 100, loaned: 10 },
    { description: "Red Pens", quantity: 80, loaned: 5 },
    { description: "Notebooks", quantity: 50, loaned: 0 },
    { description: "Erasers", quantity: 200, loaned: 20 },
    { description: "Rulers", quantity: 150, loaned: 15 },
    { description: "Pencils", quantity: 300, loaned: 30 },
    { description: "Markers", quantity: 120, loaned: 12 },
    { description: "Staplers", quantity: 40, loaned: 4 },
    { description: "Scissors", quantity: 60, loaned: 6 },
    { description: "Tape", quantity: 90, loaned: 9 },
    { description: "Glue", quantity: 110, loaned: 11 },
    { description: "Paper Clips", quantity: 500, loaned: 50 },
    { description: "Binders", quantity: 70, loaned: 7 },
    { description: "Folders", quantity: 130, loaned: 13 },
    { description: "Highlighters", quantity: 85, loaned: 8 },
  ];

  beforeEach(() => {
    mockApi = {
      get: vi.fn().mockResolvedValue({
        data: { inventory: mockInventoryData },
      }),
    } as any;
  });

  describe("Rendering", () => {
    it("renders the table", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });
    });

    it("renders table headers correctly", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Total Amount")).toBeInTheDocument();
        expect(screen.getByText("Amount Loaned")).toBeInTheDocument();
      });
    });

    it("renders pagination controls", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /previous/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /next/i })
        ).toBeInTheDocument();
      });
    });

    it("displays page information", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("fetches inventory data on mount", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith("/api/get_inventory");
      });
    });

    it("displays fetched data in table", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    it("handles empty inventory data", async () => {
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: [] } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        const tbody = screen.getByRole("table").querySelector("tbody");
        expect(tbody?.children.length).toBe(0);
      });
    });

    it("handles API errors gracefully", async () => {
      mockApi.get = vi.fn().mockRejectedValue(new Error("API Error")) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalled();
      });
    });

    it("extracts inventory from response correctly", async () => {
      const customData = [
        { description: "Test Item", quantity: 42, loaned: 7 },
      ];
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: customData } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Test Item")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination Logic", () => {
    it("displays first 10 items on first page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
        expect(screen.getByText("Tape")).toBeInTheDocument();
        expect(screen.queryByText("Glue")).not.toBeInTheDocument();
      });
    });

    it("shows correct total pages", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it("navigates to next page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Glue")).toBeInTheDocument();
        expect(screen.queryByText("Blue Pens")).not.toBeInTheDocument();
      });
    });

    it("navigates to previous page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Glue")).toBeInTheDocument();
      });

      const prevButton = screen.getByRole("button", { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
        expect(screen.queryByText("Glue")).not.toBeInTheDocument();
      });
    });

    it("displays correct page number after navigation", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
      });
    });
  });

  describe("Pagination Button States", () => {
    it("disables previous button on first page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        const prevButton = screen.getByRole("button", { name: /previous/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it("enables previous button on second page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const prevButton = screen.getByRole("button", { name: /previous/i });
        expect(prevButton).not.toBeDisabled();
      });
    });

    it("disables next button on last page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(nextButton).toBeDisabled();
      });
    });

    it("enables next button on first page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        const nextButton = screen.getByRole("button", { name: /next/i });
        expect(nextButton).not.toBeDisabled();
      });
    });

    it("does not navigate beyond first page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });

      const prevButton = screen.getByRole("button", { name: /previous/i });
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it("does not navigate beyond last page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles exactly 10 items (1 page)", async () => {
      const tenItems = mockInventoryData.slice(0, 10);
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: tenItems } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
        const nextButton = screen.getByRole("button", { name: /next/i });
        expect(nextButton).toBeDisabled();
      });
    });

    it("handles single item", async () => {
      const singleItem = [mockInventoryData[0]];
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: singleItem } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });
    });

    it("handles large datasets", async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        description: `Item ${i}`,
        quantity: i * 10,
        loaned: i,
      }));
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: largeDataset } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 10/)).toBeInTheDocument();
      });
    });

    it("handles items with zero loaned", async () => {
      const zeroLoanedData = [
        { description: "Item A", quantity: 100, loaned: 0 },
      ];
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: zeroLoanedData } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Item A")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("handles items with all items loaned", async () => {
      const allLoanedData = [
        { description: "Item B", quantity: 50, loaned: 50 },
      ];
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: allLoanedData } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Item B")).toBeInTheDocument();
        const cells = screen.getAllByText("50");
        expect(cells.length).toBe(2);
      });
    });

    it("handles special characters in descriptions", async () => {
      const specialCharsData = [
        { description: "Item with & < > ' \"", quantity: 10, loaned: 1 },
      ];
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: specialCharsData } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Item with & < > ' \"")).toBeInTheDocument();
      });
    });

    it("renders rows with unique keys", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        const tbody = screen.getByRole("table").querySelector("tbody");
        const rows = tbody?.querySelectorAll("tr");
        expect(rows?.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Pagination Calculations", () => {
    it("calculates total pages correctly for 15 items", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it("calculates total pages correctly for 11 items", async () => {
      const elevenItems = mockInventoryData.slice(0, 11);
      mockApi.get = vi
        .fn()
        .mockResolvedValue({ data: { inventory: elevenItems } }) as any;

      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
      });
    });

    it("displays correct number of items on last page", async () => {
      render(<ItemTable api={mockApi} />);

      await waitFor(() => {
        expect(screen.getByText("Blue Pens")).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const tbody = screen.getByRole("table").querySelector("tbody");
        const rows = tbody?.querySelectorAll("tr");
        expect(rows?.length).toBe(5); // 15 items total, 10 on first page, 5 on last
      });
    });
  });
});
