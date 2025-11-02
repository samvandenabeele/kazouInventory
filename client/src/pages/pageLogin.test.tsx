import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import pageLogin from "./pageLogin";
import type { AxiosInstance } from "axios";

// Wrap component in router for tests
const PageLogin = pageLogin;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("pageLogin Component", () => {
  let mockApi: AxiosInstance;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockApi = {
      post: vi.fn().mockResolvedValue({ data: {} }),
    } as any;
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("renders the login form", () => {
      renderWithRouter(<PageLogin api={mockApi} />);
      const form = document.querySelector("#loginForm");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "loginForm");
    });

    it("renders username input field", () => {
      renderWithRouter(<PageLogin api={mockApi} />);
      const usernameInput = screen.getByPlaceholderText("username");
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toHaveAttribute("name", "username");
    });

    it("renders password input field", () => {
      renderWithRouter(<PageLogin api={mockApi} />);
      const passwordInput = screen.getByPlaceholderText("password");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(passwordInput).toHaveAttribute("name", "password");
    });

    it("renders submit button", () => {
      renderWithRouter(<PageLogin api={mockApi} />);
      const submitButton = screen.getByRole("button", { name: "Log in" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Form Submission", () => {
    it("prevents default form submission", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);
      const form = document.querySelector("#loginForm") as HTMLFormElement;
      const mockPreventDefault = vi.fn();

      const event = new Event("submit", { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;

      fireEvent(form, event);

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("submits login form with correct data", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(passwordInput, { target: { value: "testpass123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "testuser",
          password: "testpass123",
        });
      });
    });

    it("logs form data to console", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "john" } });
      fireEvent.change(passwordInput, { target: { value: "secret" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith({
          username: "john",
          password: "secret",
        });
      });
    });

    it("handles empty form submission", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const submitButton = screen.getByRole("button", { name: "Log in" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "",
          password: "",
        });
      });
    });

    it("handles form with only username", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "useronly" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "useronly",
          password: "",
        });
      });
    });

    it("handles form with only password", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(passwordInput, { target: { value: "passonly" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "",
          password: "passonly",
        });
      });
    });
  });

  describe("API Integration", () => {
    it("calls correct login endpoint", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "test" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", expect.any(Object));
      });
    });

    it("handles successful login", async () => {
      mockApi.post = vi
        .fn()
        .mockResolvedValue({ data: { success: true } }) as any;

      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully", async () => {
      const errorMessage = "Invalid credentials";
      mockApi.post = vi.fn().mockRejectedValue(new Error(errorMessage)) as any;

      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "wronguser" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error logging in:",
          expect.any(Error)
        );
      });
    });

    it("handles network errors", async () => {
      mockApi.post = vi
        .fn()
        .mockRejectedValue(new Error("Network Error")) as any;

      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it("handles 401 unauthorized error", async () => {
      const error401 = {
        response: { status: 401, data: { message: "Unauthorized" } },
      };
      mockApi.post = vi.fn().mockRejectedValue(error401) as any;

      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });

  describe("Input Validation", () => {
    it("handles special characters in username", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, {
        target: { value: "user@domain.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "pass123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "user@domain.com",
          password: "pass123",
        });
      });
    });

    it("handles special characters in password", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(passwordInput, {
        target: { value: "p@ss!#$%^&*()" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "testuser",
          password: "p@ss!#$%^&*()",
        });
      });
    });

    it("handles very long username", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const longUsername = "a".repeat(100);
      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: longUsername } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: longUsername,
          password: "password",
        });
      });
    });

    it("handles very long password", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const longPassword = "p".repeat(100);
      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "user",
          password: longPassword,
        });
      });
    });

    it("handles whitespace in inputs", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      fireEvent.change(usernameInput, { target: { value: "  user  " } });
      fireEvent.change(passwordInput, { target: { value: "  pass  " } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "  user  ",
          password: "  pass  ",
        });
      });
    });
  });

  describe("Multiple Submissions", () => {
    it("handles multiple form submissions", async () => {
      renderWithRouter(<PageLogin api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "Log in" });

      // First submission
      fireEvent.change(usernameInput, { target: { value: "user1" } });
      fireEvent.change(passwordInput, { target: { value: "pass1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "user1",
          password: "pass1",
        });
      });

      // Second submission
      fireEvent.change(usernameInput, { target: { value: "user2" } });
      fireEvent.change(passwordInput, { target: { value: "pass2" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/login", {
          username: "user2",
          password: "pass2",
        });
      });

      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });
  });
});
