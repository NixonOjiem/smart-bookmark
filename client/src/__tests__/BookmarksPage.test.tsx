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

global.fetch = jest.fn() as unknown as jest.Mock;
global.confirm = jest.fn(() => true);

describe("BookmarksPage", () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const mockBookmarks: Bookmark[] = [
    {
      id: "1",
      title: "React Docs",
      url: "https://react.dev",
      tags: [{ id: 101, name: "frontend" }],
      createdAt: "2023-01-01",
    },
    {
      id: "2",
      title: "Next.js Docs",
      url: "https://nextjs.org",
      tags: [{ id: 102, name: "backend" }],
      createdAt: "2023-01-02",
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
      const method = options?.method || "GET";

      // Handle DELETE
      if (method === "DELETE") {
        return { ok: true, json: async () => ({ success: true }) };
      }

      // Handle POST
      if (method === "POST") {
        // Return a dummy new bookmark
        return {
          ok: true,
          json: async () => ({
            id: "99",
            title: "New Site",
            url: "https://new.com",
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

  // TEST 1: Loading & Display
  it("fetches and displays bookmarks on load", async () => {
    render(<BookmarksPage />);
    expect(screen.getByText(/loading your library/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("React Docs")).toBeInTheDocument();
      expect(screen.getByText("Next.js Docs")).toBeInTheDocument();
    });
  });

  // TEST 2: Searching
  it("filters bookmarks by search term", async () => {
    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText("React Docs")).toBeInTheDocument()
    );

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: "frontend" } });

    expect(screen.getByText("React Docs")).toBeInTheDocument();
    expect(screen.queryByText("Next.js Docs")).not.toBeInTheDocument();
  });

  // TEST 3: Adding Bookmark
  it("successfully adds a new bookmark", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(async () => ({
      ok: true,
      json: async () => [],
    }));

    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText(/no bookmarks yet/i)).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("Title (Optional)"), {
      target: { value: "New Site" },
    });
    fireEvent.change(screen.getByPlaceholderText(/paste url/i), {
      target: { value: "https://new.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/tags/i), {
      target: { value: "cool" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add bookmark/i }));

    await waitFor(() => {
      expect(screen.getByText("New Site")).toBeInTheDocument();
    });
  });

  // TEST 4: Deleting Bookmark
  it("deletes a bookmark after confirmation", async () => {
    render(<BookmarksPage />);
    await waitFor(() =>
      expect(screen.getByText("React Docs")).toBeInTheDocument()
    );

    // Locate the Delete button inside the card
    const titleElement = screen.getByText("React Docs");
    const card = titleElement.closest(".bg-white") as HTMLElement;
    const deleteBtn = within(card).getAllByRole("button")[0];

    fireEvent.click(deleteBtn);

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText("React Docs")).not.toBeInTheDocument();
    });
  });

  // TEST 5: Removing Tag
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
