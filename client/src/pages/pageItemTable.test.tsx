import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PageItemTable from "./pageItemTable";
import type { AxiosInstance } from "axios";

// Mock the ItemTable component
vi.mock("../components/ItemTable", () => ({
  default: ({ api }: { api: AxiosInstance }) => (
    <div
      data-testid="item-table-mock"
      data-api={api !== null && api !== undefined ? "provided" : "missing"}
    >
      Mocked ItemTable Component
    </div>
  ),
}));

describe("pageItemTable Component", () => {
  let mockApi: AxiosInstance;

  beforeEach(() => {
    mockApi = {
      get: vi.fn().mockResolvedValue({ data: { inventory: [] } }),
    } as any;
  });

  describe("Rendering", () => {
    it("renders the component", () => {
      const { container } = render(<PageItemTable api={mockApi} />);
      expect(container).toBeTruthy();
    });

    it("renders ItemTable component", () => {
      render(<PageItemTable api={mockApi} />);
      const itemTable = screen.getByTestId("item-table-mock");
      expect(itemTable).toBeInTheDocument();
    });

    it("passes api prop to ItemTable", () => {
      render(<PageItemTable api={mockApi} />);
      const itemTable = screen.getByTestId("item-table-mock");
      expect(itemTable).toHaveAttribute("data-api", "provided");
    });

    it("displays ItemTable content", () => {
      render(<PageItemTable api={mockApi} />);
      expect(
        screen.getByText("Mocked ItemTable Component")
      ).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("receives and forwards api instance", () => {
      const customApi = {
        get: vi.fn().mockResolvedValue({ data: {} }),
      } as any;

      render(<PageItemTable api={customApi} />);
      const itemTable = screen.getByTestId("item-table-mock");
      expect(itemTable).toHaveAttribute("data-api", "provided");
    });

    it("handles null api prop gracefully", () => {
      // This tests type safety - in real use, api should never be null
      // But we test the component doesn't crash
      render(<PageItemTable api={null as any} />);
      const itemTable = screen.getByTestId("item-table-mock");
      expect(itemTable).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("is a functional component", () => {
      expect(typeof PageItemTable).toBe("function");
    });

    it("returns a React element", () => {
      const result = render(<PageItemTable api={mockApi} />);
      expect(result.container.firstChild).toBeTruthy();
    });

    it("does not render additional wrapper elements", () => {
      const { container } = render(<PageItemTable api={mockApi} />);
      // Should only contain the ItemTable component
      expect(container.firstChild).toBe(screen.getByTestId("item-table-mock"));
    });
  });

  describe("Integration", () => {
    it("maintains api instance reference", () => {
      const apiInstance = {
        get: vi.fn(),
        post: vi.fn(),
      } as any;

      render(<PageItemTable api={apiInstance} />);
      const itemTable = screen.getByTestId("item-table-mock");
      expect(itemTable).toHaveAttribute("data-api", "provided");
    });

    it("renders without errors", () => {
      expect(() => {
        render(<PageItemTable api={mockApi} />);
      }).not.toThrow();
    });

    it("can be rendered multiple times", () => {
      const { unmount } = render(<PageItemTable api={mockApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();

      unmount();

      render(<PageItemTable api={mockApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();
    });

    it("handles re-rendering with same props", () => {
      const { rerender } = render(<PageItemTable api={mockApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();

      rerender(<PageItemTable api={mockApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();
    });

    it("handles re-rendering with different api instances", () => {
      const { rerender } = render(<PageItemTable api={mockApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();

      const newApi = {
        get: vi.fn().mockResolvedValue({ data: {} }),
      } as any;

      rerender(<PageItemTable api={newApi} />);
      expect(screen.getByTestId("item-table-mock")).toBeInTheDocument();
    });
  });

  describe("TypeScript Interface", () => {
    it("accepts valid PageItemTableProps", () => {
      const props = { api: mockApi };
      expect(() => {
        render(<PageItemTable {...props} />);
      }).not.toThrow();
    });

    it("component has correct interface structure", () => {
      // This is more of a compilation check, but we can verify runtime
      const props = {
        api: {
          get: vi.fn(),
        } as any,
      };

      expect(() => {
        render(<PageItemTable {...props} />);
      }).not.toThrow();
    });
  });
});
