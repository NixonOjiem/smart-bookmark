import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardLayout from "@/app/dashboard/layout";

// --- MOCKS ---

// Mock Next.js Navigation
const mockPush = jest.fn();
const mockPathname = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));
// Define a specific type for the user
interface MockUser {
  name: string;
  email?: string;
  role: string;
}

// Shape the context returns
interface MockAuthContext {
  user: MockUser | null;
  isLoading: boolean;
  logout: jest.Mock;
}

const mockLogout = jest.fn();

// 3. Initialize with the correct type
let mockAuthReturn: MockAuthContext = {
  user: null,
  isLoading: true,
  logout: mockLogout,
};

jest.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock FontAwesome
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon">icon</span>,
}));

describe("DashboardLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Regular User, Not Loading, On Dashboard
    mockAuthReturn = {
      user: { name: "Test User", email: "test@example.com", role: "user" },
      isLoading: false,
      logout: mockLogout,
    };
    mockPathname.mockReturnValue("/dashboard");
  });

  // --- SCENARIO 1: LOADING ---
  it("renders loading spinner when checking auth", () => {
    mockAuthReturn = { ...mockAuthReturn, isLoading: true, user: null };

    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText(/verifying user privileges/i)).toBeInTheDocument();
    expect(screen.queryByText("Child Content")).not.toBeInTheDocument();
  });

  // --- SCENARIO 2: REDIRECT (NOT LOGGED IN) ---
  it("redirects to /auth if user is not logged in", () => {
    mockAuthReturn = { ...mockAuthReturn, isLoading: false, user: null };

    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    expect(mockPush).toHaveBeenCalledWith("/auth");
    // Should return null (nothing rendered)
    expect(screen.queryByText("SmartMarks")).not.toBeInTheDocument();
  });

  // --- SCENARIO 3: REGULAR USER (UI CHECKS) ---
  it("renders layout for authenticated regular user", () => {
    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    // 1. Check Sidebar Info
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // 2. Check Standard Links
    expect(screen.getAllByText("Dashboard")).toHaveLength(2);
    expect(screen.getAllByText("Bookmarks")).toHaveLength(2);
    expect(screen.getAllByText("Profile")).toHaveLength(2);

    // 3. Check Admin Link is MISSING
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();

    // 4. Check Children Rendered
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  // --- SCENARIO 4: ADMIN USER ---
  it("renders Admin link for admin users", () => {
    mockAuthReturn = {
      ...mockAuthReturn,

      user: { name: "Super User", role: "admin" },
    };

    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    expect(screen.getAllByText("Admin")).toHaveLength(2);
  });

  // --- SCENARIO 5: ACTIVE LINK HIGHLIGHTING ---
  it("highlights the active link based on pathname", () => {
    // Simulate being on the Bookmarks page
    mockPathname.mockReturnValue("/dashboard/bookmarks");

    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    // Find the Desktop Sidebar link for Bookmarks
    const bookmarkLinks = screen.getAllByRole("link", { name: /bookmarks/i });

    const activeLink = bookmarkLinks.find((link) =>
      link.className.includes("bg-blue-50")
    );
    expect(activeLink).toBeInTheDocument();

    // Ensure other links are NOT active
    const dashboardLink = screen.getAllByRole("link", {
      name: /dashboard/i,
    })[0];
    expect(dashboardLink).not.toHaveClass("bg-blue-50");
  });

  // --- SCENARIO 6: LOGOUT ---
  it("calls logout function when sign out is clicked", () => {
    render(
      <DashboardLayout>
        <div>Child Content</div>
      </DashboardLayout>
    );

    const logoutButtons = screen.getAllByRole("button", { name: /sign out/i });
    fireEvent.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalled();
  });
});
