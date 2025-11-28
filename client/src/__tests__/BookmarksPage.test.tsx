import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import BookmarksPage from "../components/dashboard/Bookmark";

// --- TYPES ---
interface Tag {
  id: number;
  name: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: Tag[];
  createdAt: string;
}

// --- MOCKS ---
const mockToken = "fake-jwt-token";
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ token: mockToken }),
}));

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon">icon</span>,
}));

// Mock Global Fetch
global.fetch = jest.fn() as unknown as jest.Mock;

describe("BookmarksPage", () => {
  let confirmSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  // Added descriptions to mock data
  const mockBookmarks: Bookmark[] = [
    {
      id: "1",
      title: "React Docs",
      url: "https://react.dev",
      description: "The official library for web and native user interfaces",
      tags: [{ id: 101, name: "frontend" }],
      createdAt: "2023-01-01",
    },
    {
      id: "2",
      title: "Next.js Docs",
      url: "https://nextjs.org",
      description: "The React Framework for the Web",
      tags: [{ id: 102, name: "backend" }],
      createdAt: "2023-01-02",
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock window methods securely
    confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    // Fetch Implementation
    (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
      const method = options?.method ? options.method.toUpperCase() : "GET";

      // Handle DELETE
      if (method === "DELETE") {
        return { ok: true, json: async () => ({ success: true }) };
      }

      // Handle POST
      if (method === "POST") {
        // Parse the body to echo back the description
        const body = JSON.parse(options.body);
        return {
          ok: true,
          json: async () => ({
            id: "99",
            title: body.title || "New Site",
            url: body.url,
            description: body.description,
            tags: [],
            createdAt: new Date().toISOString(),
          }),
        };
      }

      // Handle PATCH (Remove Tag)
      if (method === "PATCH") {
        return { ok: true, json: async () => ({ success: true }) };
      }

      // Default: GET (Return List)
      return { ok: true, json: async () => mockBookmarks };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Loading & Display
  it("fetches and displays bookmarks with descriptions on load", async () => {
    render(<BookmarksPage />);
    expect(screen.getByText(/loading your library/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("React Docs")).toBeInTheDocument();
      // Check if description renders
      expect(
        screen.getByText(
          "The official library for web and native user interfaces"
        )
      ).toBeInTheDocument();
    });
  });

  // Searching
  it("filters bookmarks by search term", async () => {
    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText("React Docs")).toBeInTheDocument()
    );

    const searchInput = screen.getByPlaceholderText(/search by title, desc/i);
    fireEvent.change(searchInput, { target: { value: "frontend" } });

    expect(screen.getByText("React Docs")).toBeInTheDocument();
    expect(screen.queryByText("Next.js Docs")).not.toBeInTheDocument();
  });

  // Adding Bookmark
  it("successfully adds a new bookmark with description", async () => {
    // Override mock strictly for this test to start with empty list
    (global.fetch as jest.Mock).mockImplementationOnce(async () => ({
      ok: true,
      json: async () => [],
    }));

    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText(/no bookmarks yet/i)).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "New Site" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste url/i), {
      target: { value: "https://new.com" },
    });

    // Fill the description textarea
    fireEvent.change(screen.getByPlaceholderText(/description/i), {
      target: { value: "My custom notes" },
    });

    fireEvent.change(screen.getByPlaceholderText(/tags/i), {
      target: { value: "cool" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText("New Site")).toBeInTheDocument();
      // Verify description appears
      expect(screen.getByText("My custom notes")).toBeInTheDocument();
    });
  });

  // Deleting Bookmark
  it("deletes a bookmark after confirmation", async () => {
    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText("React Docs")).toBeInTheDocument()
    );

    const titleElement = screen.getByText("React Docs");
    // Find the closest card container
    const card = titleElement.closest(".bg-white") as HTMLElement;
    // The trash button is inside the card
    const deleteBtn = within(card).getAllByRole("button")[0];

    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/bookmarks/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("React Docs")).not.toBeInTheDocument();
    });
  });

  // Removing Tag
  it("removes a tag from a bookmark", async () => {
    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText("#frontend")).toBeInTheDocument()
    );

    const tagElement = screen.getByText("#frontend");
    const removeBtn = within(
      tagElement.closest("span") as HTMLElement
    ).getByRole("button");

    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText("#frontend")).not.toBeInTheDocument();
    });
  });
});
