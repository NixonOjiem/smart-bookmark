import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthComponent from "@/components/auth/AuthComponent";

// --- TYPES ---
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  access_token?: string;
  user?: UserData;
  message?: string;
}

// --- MOCKS ---

//Mock the AuthContext
const mockLogin = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock global fetch
// We cast to 'unknown' first to bypass the native fetch type signature,
// then to 'jest.Mock' so we can use .mockResolvedValue
global.fetch = jest.fn() as unknown as jest.Mock;

describe("AuthComponent", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockClear();
  });

  it("renders the login form by default", () => {
    render(<AuthComponent />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();

    expect(screen.queryByPlaceholderText(/full name/i)).not.toBeInTheDocument();
  });

  it("switches to signup form when toggle button is clicked", () => {
    render(<AuthComponent />);

    const toggleButton = screen.getByText(/need an account\? sign up/i);
    fireEvent.click(toggleButton);

    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    const mockResponse: AuthResponse = {
      access_token: "fake_token_123",
      user: {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
    };

    // Cast global.fetch to jest.Mock to access mock methods
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<AuthComponent />);

    // Cast the elements to HTMLInputElement to ensure 'target.value' is valid type-wise
    const emailInput = screen.getByPlaceholderText(
      /email/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      /password/i
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByRole("button", { name: /processing/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });

    expect(mockLogin).toHaveBeenCalledWith(
      mockResponse.access_token,
      mockResponse.user
    );
  });

  it("handles successful signup", async () => {
    const mockResponse: AuthResponse = {
      access_token: "fake_token_456",
      user: {
        id: "2",
        name: "New User",
        email: "new@example.com",
        role: "user",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<AuthComponent />);

    fireEvent.click(screen.getByText(/need an account\? sign up/i));

    const nameInput = screen.getByPlaceholderText(
      /full name/i
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(
      /email/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      /password/i
    ) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "New User" } });
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/auth/signup`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "New User",
            email: "new@example.com",
            password: "password123",
          }),
        })
      );
    });

    expect(mockLogin).toHaveBeenCalledWith(
      mockResponse.access_token,
      mockResponse.user
    );
  });

  it("displays error message on failed request", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(<AuthComponent />);

    const emailInput = screen.getByPlaceholderText(
      /email/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      /password/i
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
