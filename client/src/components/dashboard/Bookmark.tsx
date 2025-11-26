"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faExternalLinkAlt,
  faTag,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

// Define Bookmark based of Backend
interface Bookmark {
  id: string;
  title?: string;
  url: string;
  description?: string;
  tags?: { id: number; name: string }[];
  createdAt: string;
}

function BookmarksPage() {
  // Get token from UseAUth
  const { token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    tagString: "", // comma seperated
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Bookmarks on Mount
  useEffect(() => {
    if (token) fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`${baseUrl}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      console.error(err);
      setError("Could not load bookmarks.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Create Bookmark
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Convert "react, css, frontend" -> ["react", "css", "frontend"]
    const tagsArray = formData.tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      const res = await fetch(`${baseUrl}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: formData.url,
          title: formData.title,
          tags: tagsArray, // sending array of strings
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create bookmark");
      }

      const newBookmark = await res.json();

      // Update UI immediately (Optimistic UI or re-fetch)
      setBookmarks([newBookmark, ...bookmarks]);

      // Reset Form
      setFormData({ url: "", title: "", tagString: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    try {
      const res = await fetch(`${baseUrl}/bookmarks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading your library...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Library</h1>

      {/* ---  FORM --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-10">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Add New Bookmark
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* URL Input */}
            <input
              type="url"
              placeholder="Paste URL here (https://...)"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
            {/* Title Input */}
            <input
              type="text"
              placeholder="Title (Optional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Tags Input */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faTag}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tags (comma separated, e.g: design, productivity, ai)"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.tagString}
              onChange={(e) =>
                setFormData({ ...formData, tagString: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} /> Add Bookmark
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- BOOKMARK LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">
            No bookmarks yet. Add your first one above!
          </p>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-lg text-gray-800 line-clamp-2"
                    title={bookmark.title}
                  >
                    {bookmark.title || bookmark.url}
                  </h3>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline mb-4 block truncate"
                >
                  {bookmark.url}{" "}
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className="text-xs ml-1"
                  />
                </a>
              </div>

              {/* Tags Section */}
              <div className="mt-4 flex flex-wrap gap-2">
                {bookmark.tags && bookmark.tags.length > 0 ? (
                  bookmark.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium"
                    >
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No tags</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
