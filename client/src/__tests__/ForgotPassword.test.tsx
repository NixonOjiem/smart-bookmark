import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ForgotPassword from "@/components/auth/ForgotPassword";

// --- TYPES ---
interface ResetResponse {
  access_token?: string;
  user?: { id: string; email: string };
  message?: string;
}

// --- MOCKS ---

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock Next.js Navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Fetch
global.fetch = jest.fn() as unknown as jest.Mock;

describe("ForgotPassword Component", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Step 1 (Email Input) by default", () => {
    render(<ForgotPassword />);

    // Check Header
    expect(
      screen.getByRole("heading", { name: /reset password/i })
    ).toBeInTheDocument();

    // Check Inputs
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();

    // Check Buttons
    expect(
      screen.getByRole("button", { name: /send code/i })
    ).toBeInTheDocument();

    // Step 2 inputs are hidden
    expect(screen.queryByPlaceholderText(/123456/i)).not.toBeInTheDocument();
  });

  it("handles Step 1 submission successfully (Request Code)", async () => {
    // Mock success response for /auth/forgot-password
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Code sent" }),
    });

    render(<ForgotPassword />);

    // Type Email
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    // Check Loading State
    expect(
      screen.getByRole("button", { name: /sending/i })
    ).toBeInTheDocument();

    // Verify API Call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        }
      );
    });

    // Check Success Message
    expect(
      screen.getByText(/check your email for the code/i)
    ).toBeInTheDocument();

    // Verify Transition to Step 2
    expect(screen.getByPlaceholderText(/123456/i)).toBeInTheDocument(); // Code input
    expect(screen.getByPlaceholderText(/••••••/i)).toBeInTheDocument(); // Password input
  });

  it("displays error when Request Code fails", async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network Error")
    );

    render(<ForgotPassword />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "fail@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    // Ensure stay on step one
    expect(screen.queryByPlaceholderText(/123456/i)).not.toBeInTheDocument();
  });

  it("handles Step 2 submission successfully (Reset & Login)", async () => {
    // Success for "Request Code"
    // Success for "Reset Password"
    const mockLoginResponse: ResetResponse = {
      access_token: "new_token_789",
      user: { id: "1", email: "test@example.com" },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockLoginResponse });

    render(<ForgotPassword />);

    // --- COMPLETE STEP 1 FIRST ---
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    // Wait for Step 2 to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456/i)).toBeInTheDocument();
    });

    // --- PERFORM STEP 2 ---
    const codeInput = screen.getByPlaceholderText(/123456/i);
    const passwordInput = screen.getByPlaceholderText(/••••••/i);

    fireEvent.change(codeInput, { target: { value: "999999" } });
    fireEvent.change(passwordInput, { target: { value: "newPassword123" } });

    // Click Reset
    fireEvent.click(screen.getByRole("button", { name: /reset & login/i }));

    // Verify Second API Call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            code: "999999",
            newPassword: "newPassword123",
          }),
        }
      );
    });

    // Verify Auto-Login
    expect(mockLogin).toHaveBeenCalledWith(
      mockLoginResponse.access_token,
      mockLoginResponse.user
    );
  });

  it("allows user to go back from Step 2 to Step 1", async () => {
    // Mock Step 1 success
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ForgotPassword />);

    // Move to Step 2
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/123456/i)).toBeInTheDocument();
    });

    // Click "Wrong email? Go back"
    fireEvent.click(screen.getByText(/wrong email\? go back/i));

    // Verify back on Step 1
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/123456/i)).not.toBeInTheDocument();
  });
});
