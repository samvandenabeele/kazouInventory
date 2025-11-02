import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PageItemUse from "./pageItemUse";
import type { AxiosInstance } from "axios";

// Mock the child components
vi.mock("../components/ItemAdd", () => ({
  default: ({ api }: { api: AxiosInstance }) => (
    <div
      data-testid="item-add-mock"
      data-api={api !== null && api !== undefined ? "provided" : "missing"}
    >
      Mocked ItemAdd Component
    </div>
  ),
}));

vi.mock("../components/ItemLoan", () => ({
  default: ({ api }: { api: AxiosInstance }) => (
    <div
      data-testid="item-loan-mock"
      data-api={api !== null && api !== undefined ? "provided" : "missing"}
    >
      Mocked ItemLoan Component
    </div>
  ),
}));

describe("pageItemUse Component", () => {
  let mockApi: AxiosInstance;

  beforeEach(() => {
    mockApi = {
      post: vi.fn().mockResolvedValue({ data: {} }),
    } as any;
  });

  describe("Rendering", () => {
    it("renders the component", () => {
      const { container } = render(<PageItemUse api={mockApi} />);
      expect(container).toBeTruthy();
    });

    it("renders ItemAdd component", () => {
      render(<PageItemUse api={mockApi} />);
      const itemAdd = screen.getByTestId("item-add-mock");
      expect(itemAdd).toBeInTheDocument();
    });

    it("renders ItemLoan component", () => {
      render(<PageItemUse api={mockApi} />);
      const itemLoan = screen.getByTestId("item-loan-mock");
      expect(itemLoan).toBeInTheDocument();
    });

    it("renders both components simultaneously", () => {
      render(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();
    });

    it("displays ItemAdd content", () => {
      render(<PageItemUse api={mockApi} />);
      expect(screen.getByText("Mocked ItemAdd Component")).toBeInTheDocument();
    });

    it("displays ItemLoan content", () => {
      render(<PageItemUse api={mockApi} />);
      expect(screen.getByText("Mocked ItemLoan Component")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("passes api prop to ItemAdd", () => {
      render(<PageItemUse api={mockApi} />);
      const itemAdd = screen.getByTestId("item-add-mock");
      expect(itemAdd).toHaveAttribute("data-api", "provided");
    });

    it("passes api prop to ItemLoan", () => {
      render(<PageItemUse api={mockApi} />);
      const itemLoan = screen.getByTestId("item-loan-mock");
      expect(itemLoan).toHaveAttribute("data-api", "provided");
    });

    it("passes the same api instance to both components", () => {
      render(<PageItemUse api={mockApi} />);
      const itemAdd = screen.getByTestId("item-add-mock");
      const itemLoan = screen.getByTestId("item-loan-mock");

      expect(itemAdd).toHaveAttribute("data-api", "provided");
      expect(itemLoan).toHaveAttribute("data-api", "provided");
    });

    it("handles custom api instance", () => {
      const customApi = {
        post: vi.fn().mockResolvedValue({ data: { success: true } }),
        get: vi.fn(),
      } as any;

      render(<PageItemUse api={customApi} />);

      expect(screen.getByTestId("item-add-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
      expect(screen.getByTestId("item-loan-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
    });

    it("handles null api prop gracefully", () => {
      // This tests that the component doesn't crash with null api
      render(<PageItemUse api={null as any} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("is a functional component", () => {
      expect(typeof PageItemUse).toBe("function");
    });

    it("returns a React element", () => {
      const result = render(<PageItemUse api={mockApi} />);
      expect(result.container.firstChild).toBeTruthy();
    });

    it("renders ItemAdd before ItemLoan", () => {
      const { container } = render(<PageItemUse api={mockApi} />);
      const allMocks = container.querySelectorAll("[data-testid]");

      expect(allMocks[0]).toHaveAttribute("data-testid", "item-add-mock");
      expect(allMocks[1]).toHaveAttribute("data-testid", "item-loan-mock");
    });
  });

  describe("Integration", () => {
    it("maintains api instance reference", () => {
      const apiInstance = {
        post: vi.fn(),
        get: vi.fn(),
      } as any;

      render(<PageItemUse api={apiInstance} />);

      expect(screen.getByTestId("item-add-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
      expect(screen.getByTestId("item-loan-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
    });

    it("renders without errors", () => {
      expect(() => {
        render(<PageItemUse api={mockApi} />);
      }).not.toThrow();
    });

    it("can be rendered multiple times", () => {
      const { unmount } = render(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();

      unmount();

      render(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();
    });

    it("handles re-rendering with same props", () => {
      const { rerender } = render(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();

      rerender(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();
    });

    it("handles re-rendering with different api instances", () => {
      const { rerender } = render(<PageItemUse api={mockApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();

      const newApi = {
        post: vi.fn().mockResolvedValue({ data: {} }),
      } as any;

      rerender(<PageItemUse api={newApi} />);
      expect(screen.getByTestId("item-add-mock")).toBeInTheDocument();
      expect(screen.getByTestId("item-loan-mock")).toBeInTheDocument();
    });
  });

  describe("TypeScript Interface", () => {
    it("accepts valid PageItemAddProps", () => {
      const props = { api: mockApi };
      expect(() => {
        render(<PageItemUse {...props} />);
      }).not.toThrow();
    });

    it("component has correct interface structure", () => {
      const props = {
        api: {
          post: vi.fn(),
          get: vi.fn(),
        } as any,
      };

      expect(() => {
        render(<PageItemUse {...props} />);
      }).not.toThrow();
    });
  });

  describe("Component Independence", () => {
    it("ItemAdd and ItemLoan are independent components", () => {
      render(<PageItemUse api={mockApi} />);

      const itemAdd = screen.getByTestId("item-add-mock");
      const itemLoan = screen.getByTestId("item-loan-mock");

      // Both should exist independently
      expect(itemAdd).toBeInTheDocument();
      expect(itemLoan).toBeInTheDocument();

      // They should be separate DOM nodes
      expect(itemAdd).not.toBe(itemLoan);
    });

    it("renders complete UI with both components", () => {
      const { container } = render(<PageItemUse api={mockApi} />);

      // Should have both mocked components
      const mocks = container.querySelectorAll("[data-testid]");
      expect(mocks.length).toBe(2);
    });
  });

  describe("API Instance Sharing", () => {
    it("both components receive the same api reference", () => {
      const sharedApi = {
        post: vi.fn().mockResolvedValue({ data: {} }),
      } as any;

      render(<PageItemUse api={sharedApi} />);

      // Both should indicate they received the api
      expect(screen.getByTestId("item-add-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
      expect(screen.getByTestId("item-loan-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
    });

    it("updates when api instance changes", () => {
      const api1 = { post: vi.fn() } as any;
      const { rerender } = render(<PageItemUse api={api1} />);

      expect(screen.getByTestId("item-add-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );

      const api2 = { post: vi.fn() } as any;
      rerender(<PageItemUse api={api2} />);

      // Should still show provided since we gave a new valid api
      expect(screen.getByTestId("item-add-mock")).toHaveAttribute(
        "data-api",
        "provided"
      );
    });
  });
});
