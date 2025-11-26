"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faTags,
  faChartLine,
  faExternalLinkAlt,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Tag {
  id: number;
  name: string;
}

interface Bookmark {
  id: string;
  title?: string;
  url: string;
  tags?: Tag[];
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconProp;
  color: string;
}

function Dashboard() {
  const { user, token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([]);
  const [topTags, setTopTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState({ totalBookmarks: 0, totalTags: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Parallel Fetching: Get Bookmarks and Tags at the same time
      const [bookmarksRes, tagsRes] = await Promise.all([
        fetch(`${baseUrl}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (bookmarksRes.ok && tagsRes.ok) {
        const bookmarksData: Bookmark[] = await bookmarksRes.json();
        const tagsData: Tag[] = await tagsRes.json();

        // Calculate Stats
        setStats({
          totalBookmarks: bookmarksData.length,
          totalTags: tagsData.length,
        });

        // Get Recent (Last 5, assuming backend returns sorted or we slice end)
        const sorted = [...bookmarksData].reverse();
        setRecentBookmarks(sorted.slice(0, 5));

        // Get Top Tags (For now just taking the first 5, later you can calculate usage)
        setTopTags(tagsData.slice(0, 5));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {user?.name}
          </h1>
          <p className="text-gray-500">
            Here is what is happening with your bookmarks.
          </p>
        </div>
        <Link
          href="/dashboard/bookmarks"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add New Bookmark
        </Link>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Bookmarks"
          value={stats.totalBookmarks}
          icon={faBookmark}
          color="bg-blue-500"
        />
        <StatCard
          title="Smart Tags"
          value={stats.totalTags}
          icon={faTags}
          color="bg-purple-500"
        />
        <StatCard
          title="Avg. Items / Week"
          value="N/A"
          icon={faChartLine}
          color="bg-green-500"
        />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COL: Recent Bookmarks (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <Link
              href="/dashboard/bookmarks"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {recentBookmarks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                You haven`&apos;`t saved anything yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
                  >
                    {/* Icon Placeholder */}
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <FontAwesomeIcon icon={faBookmark} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {bm.title || "Untitled Bookmark"}
                      </h3>
                      <a
                        href={bm.url}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-blue-500 truncate block"
                      >
                        {bm.url}
                      </a>
                      {/* Mini Tags */}
                      <div className="flex gap-2 mt-2">
                        {bm.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a
                      href={bm.url}
                      target="_blank"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL: Top Tags (Takes up 1 col) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Top Categories</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {topTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags generated yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                These are automatically generated by our AI based on the content
                you save.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Helper Component for Stats
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div
        className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shadow-md`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
