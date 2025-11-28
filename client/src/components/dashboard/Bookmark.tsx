"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faExternalLinkAlt,
  faTag,
  faPlus,
  faSearch,
  faTimes,
  faAlignLeft, // Added icon for description
} from "@fortawesome/free-solid-svg-icons";

// Define Bookmark based on Backend
interface Bookmark {
  id: string;
  title?: string;
  url: string;
  description?: string;
  tags?: { id: number; name: string }[];
  createdAt: string;
}

function BookmarksPage() {
  const { token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. UPDATE STATE: Added description field
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
    tagString: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 2. UPDATE FILTER: Include description in search
  const filteredBookmarks = bookmarks.filter((b) => {
    const lowerTerm = searchTerm.toLowerCase();
    const matchTitle = b.title?.toLowerCase().includes(lowerTerm);
    const matchUrl = b.url.toLowerCase().includes(lowerTerm);
    const matchDesc = b.description?.toLowerCase().includes(lowerTerm); // Search description

    // Check if ANY of the tags match the search term
    const matchTags = b.tags?.some((t) =>
      t.name.toLowerCase().includes(lowerTerm)
    );

    return matchTitle || matchUrl || matchDesc || matchTags;
  });

  // Add bookmarks
  const handleSubmit = async (e: React.FormEvent) => {
    if (!formData.title && !formData.url) {
      alert("Enter title or URL");
    }
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
        // 3. UPDATE SUBMIT: Send description to backend
        body: JSON.stringify({
          url: formData.url,
          title: formData.title,
          description: formData.description,
          tags: tagsArray,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create bookmark");
      }

      const newBookmark = await res.json();
      setBookmarks([newBookmark, ...bookmarks]);
      // Reset form
      setFormData({ url: "", title: "", description: "", tagString: "" });
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

  //  Remove tag from bookmark
  const handleRemoveTag = async (bookmarkId: string, tagIdToRemove: number) => {
    const bookmark = bookmarks.find((b) => b.id === bookmarkId);
    if (!bookmark || !bookmark.tags) return;

    const remainingTags = bookmark.tags
      .filter((t) => t.id !== tagIdToRemove)
      .map((t) => t.name);

    // Update UI Optimistically
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === bookmarkId
          ? { ...b, tags: b.tags?.filter((t) => t.id !== tagIdToRemove) }
          : b
      )
    );

    try {
      const res = await fetch(`${baseUrl}/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tags: remainingTags,
        }),
      });

      if (!res.ok) throw new Error("Failed to update tags");
    } catch (err) {
      console.error(err);
      setError("Failed to remove tag. Please refresh.");
      fetchBookmarks();
    }
  };

  // Deleting a bookmark
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
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Library</h1>

      {/* --- SEARCH BAR --- */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-3.5 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by title, desc, url, or #tag..."
          className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- ADD FORM --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Add New Bookmark
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <input
              type="text"
              placeholder="Title (optional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 4. UPDATE UI: Description Input */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faAlignLeft}
              className="absolute left-3 top-3 text-gray-400"
            />
            <textarea
              placeholder="Description (optional notes...)"
              rows={2}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faTag}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tags (comma separated, e.g: design, productivity)"
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
        {filteredBookmarks.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">
            {searchTerm ? "No results found." : "No bookmarks yet."}
          </p>
        ) : (
          filteredBookmarks.map((bookmark) => (
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
                  className="text-sm text-blue-500 hover:underline mb-2 block truncate"
                >
                  {bookmark.url}{" "}
                  <FontAwesomeIcon
                    icon={faExternalLinkAlt}
                    className="text-xs ml-1"
                  />
                </a>

                {/* 5. UPDATE UI: Display Description */}
                {bookmark.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {bookmark.description}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                {bookmark.tags && bookmark.tags.length > 0 ? (
                  bookmark.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 group"
                    >
                      #{tag.name}
                      <button
                        onClick={() => handleRemoveTag(bookmark.id, tag.id)}
                        className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove tag"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
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
