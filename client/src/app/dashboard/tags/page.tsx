"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faCheck,
  faTimes,
  faPlus,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

interface Tag {
  id: number;
  name: string;
}

export default function TagsPage() {
  const { token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create State
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // 1. Fetch Tags
  useEffect(() => {
    if (token) fetchTags();
  }, [token]);

  const fetchTags = async () => {
    try {
      const res = await fetch(`${baseUrl}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tags.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Create Tag
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsCreating(true);

    try {
      const res = await fetch(`${baseUrl}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTagName }),
      });

      if (!res.ok) throw new Error("Failed to create tag");

      const createdTag = await res.json();
      setTags([...tags, createdTag]);
      setNewTagName("");
    } catch (err) {
      alert("Could not create tag");
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Delete Tag
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Delete this tag? Bookmarks using it will strictly lose this tag."
      )
    )
      return;

    try {
      const res = await fetch(`${baseUrl}/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTags(tags.filter((t) => t.id !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // 4. Start Editing
  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  // 5. Save Edit
  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`${baseUrl}/tags/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      if (!res.ok) throw new Error("Update failed");

      // Update local state
      setTags(tags.map((t) => (t.id === id ? { ...t, name: editName } : t)));
      setEditingId(null);
    } catch (err) {
      alert("Could not update tag name");
    }
  };

  if (loading) return <div className="p-8">Loading tags...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Tags</h1>
      <p className="text-gray-500 mb-8">
        Rename or delete tags to keep your library organized.
      </p>

      {/* --- CREATE SECTION --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleCreate} className="flex gap-4">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faTag}
              className="absolute left-3 top-3.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Create a new tag name..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !newTagName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create
          </button>
        </form>
      </div>

      {/* --- TAGS LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {tags.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No tags found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                {/* LEFT SIDE: Name or Edit Input */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                    <FontAwesomeIcon icon={faTag} />
                  </div>

                  {editingId === tag.id ? (
                    // EDIT MODE
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(tag.id)}
                        className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        <FontAwesomeIcon icon={faCheck} size="xs" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                      </button>
                    </div>
                  ) : (
                    // VIEW MODE
                    <span className="font-medium text-gray-700">
                      {tag.name}
                    </span>
                  )}
                </div>

                {/* RIGHT SIDE: Actions */}
                {editingId !== tag.id && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
