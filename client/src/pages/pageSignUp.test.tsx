import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PageSignUp from "./pageSignUp";
import type { AxiosInstance } from "axios";

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Helper to get email input
const getEmailInput = () =>
  document.querySelector('input[name="email"]') as HTMLInputElement;

describe("pageSignUp Component", () => {
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
    it("renders the signup form", () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const form = document.getElementById("loginForm");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("id", "loginForm");
    });

    it("renders username input field", () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const usernameInput = screen.getByPlaceholderText("username");
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toHaveAttribute("name", "username");
    });

    it("renders password input field", () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const passwordInput = screen.getByPlaceholderText("password");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(passwordInput).toHaveAttribute("name", "password");
    });

    it("renders email input field", () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const emailInput = getEmailInput();
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
    });

    it("renders submit button", () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const submitButton = screen.getByRole("button", { name: "sign up" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Form Submission", () => {
    it("prevents default form submission", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);
      const form = document.getElementById("loginForm")!;
      const mockPreventDefault = vi.fn();

      const event = new Event("submit", { bubbles: true, cancelable: true });
      event.preventDefault = mockPreventDefault;

      fireEvent(form, event);

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("submits signup form with correct data", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(passwordInput, { target: { value: "newpass123" } });
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "newuser",
          password: "newpass123",
          email: "user@example.com",
        });
      });
    });

    it("logs form data to console", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "john" } });
      fireEvent.change(passwordInput, { target: { value: "secret" } });
      fireEvent.change(emailInput, { target: { value: "john@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith({
          username: "john",
          password: "secret",
          email: "john@test.com",
        });
      });
    });

    it("handles empty form submission", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const submitButton = screen.getByRole("button", { name: "sign up" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "",
          password: "",
          email: "",
        });
      });
    });

    it("handles partial form data (missing email)", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user",
          password: "pass",
          email: "",
        });
      });
    });

    it("handles partial form data (missing username)", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(passwordInput, { target: { value: "pass123" } });
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "",
          password: "pass123",
          email: "test@test.com",
        });
      });
    });

    it("handles partial form data (missing password)", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(emailInput, { target: { value: "user@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "testuser",
          password: "",
          email: "user@test.com",
        });
      });
    });
  });

  describe("API Integration", () => {
    it("calls correct signup endpoint", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "test" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/signup",
          expect.any(Object)
        );
      });
    });

    it("handles successful signup", async () => {
      mockApi.post = vi
        .fn()
        .mockResolvedValue({ data: { success: true } }) as any;

      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "newuser" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.change(emailInput, { target: { value: "new@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully", async () => {
      const errorMessage = "User already exists";
      mockApi.post = vi.fn().mockRejectedValue(new Error(errorMessage)) as any;

      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "existinguser" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "existing@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error signing up:",
          expect.any(Error)
        );
      });
    });

    it("handles network errors", async () => {
      mockApi.post = vi
        .fn()
        .mockRejectedValue(new Error("Network Error")) as any;

      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "user@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it("handles 409 conflict error (duplicate user)", async () => {
      const error409 = {
        response: { status: 409, data: { message: "User exists" } },
      };
      mockApi.post = vi.fn().mockRejectedValue(error409) as any;

      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "duplicate" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "dup@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it("handles 400 validation error", async () => {
      const error400 = {
        response: {
          status: 400,
          data: { message: "Invalid email" },
        },
      };
      mockApi.post = vi.fn().mockRejectedValue(error400) as any;

      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "invalidemail" } });
      fireEvent.click(submitButton);

      expect(mockApi.post).not.toHaveBeenCalled();
    });
  });

  describe("Email Validation", () => {
    it("handles valid email format", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user",
          password: "pass",
          email: "valid@email.com",
        });
      });
    });

    it("handles email with plus sign", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, {
        target: { value: "user+tag@example.com" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user",
          password: "pass",
          email: "user+tag@example.com",
        });
      });
    });

    it("handles email with subdomain", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(emailInput, {
        target: { value: "user@mail.example.com" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user",
          password: "pass",
          email: "user@mail.example.com",
        });
      });
    });
  });

  describe("Special Characters and Edge Cases", () => {
    it("handles special characters in username", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "user_name-123" } });
      fireEvent.change(passwordInput, { target: { value: "pass123" } });
      fireEvent.change(emailInput, { target: { value: "user@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user_name-123",
          password: "pass123",
          email: "user@test.com",
        });
      });
    });

    it("handles special characters in password", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(passwordInput, {
        target: { value: "P@ssw0rd!#$%^&*()" },
      });
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "testuser",
          password: "P@ssw0rd!#$%^&*()",
          email: "test@test.com",
        });
      });
    });

    it("handles very long inputs", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const longString = "a".repeat(100);
      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: longString } });
      fireEvent.change(passwordInput, { target: { value: longString } });
      fireEvent.change(emailInput, {
        target: { value: `${longString}@test.com` },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: longString,
          password: longString,
          email: `${longString}@test.com`,
        });
      });
    });

    it("handles whitespace in inputs", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      fireEvent.change(usernameInput, { target: { value: "  user  " } });
      fireEvent.change(passwordInput, { target: { value: "  pass  " } });
      fireEvent.change(emailInput, { target: { value: "  email@test.com  " } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user",
          password: "pass",
          email: "email@test.com",
        });
      });
    });
  });

  describe("Multiple Submissions", () => {
    it("handles multiple form submissions", async () => {
      renderWithRouter(<PageSignUp api={mockApi} />);

      const usernameInput = screen.getByPlaceholderText("username");
      const passwordInput = screen.getByPlaceholderText("password");
      const emailInput = getEmailInput();
      const submitButton = screen.getByRole("button", { name: "sign up" });

      // First submission
      fireEvent.change(usernameInput, { target: { value: "user1" } });
      fireEvent.change(passwordInput, { target: { value: "pass1" } });
      fireEvent.change(emailInput, { target: { value: "user1@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user1",
          password: "pass1",
          email: "user1@test.com",
        });
      });

      // Second submission
      fireEvent.change(usernameInput, { target: { value: "user2" } });
      fireEvent.change(passwordInput, { target: { value: "pass2" } });
      fireEvent.change(emailInput, { target: { value: "user2@test.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/signup", {
          username: "user2",
          password: "pass2",
          email: "user2@test.com",
        });
      });

      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });
  });
});
