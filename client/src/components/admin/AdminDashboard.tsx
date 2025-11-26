"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBookmark,
  faTags,
  faServer,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface SystemStats {
  totalUsers: number;
  totalBookmarks: number;
  totalTags: number;
  uptime: string; // Optional fun stat
}
interface DashboardCard {
  title: string;
  value: string | number;
  icon: IconProp;
  color: string;
  loading: boolean;
}

function AdminDashboard() {
  const { token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalBookmarks: 0,
    totalTags: 0,
    uptime: "Online",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // We will create this endpoint in Part 2
      const res = await fetch(`${baseUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load system stats");

      const data = await res.json();
      setStats(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "Could not load stats. Ensure Backend AdminController is setup."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">System Overview</h1>
          <p className="text-gray-500">Real-time platform metrics</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors bg-white rounded-lg border border-gray-200 shadow-sm"
          title="Refresh Data"
        >
          <FontAwesomeIcon icon={faSync} spin={isLoading} />
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={faUsers}
          color="bg-blue-500"
          loading={isLoading}
        />
        <DashboardCard
          title="Total Bookmarks"
          value={stats.totalBookmarks}
          icon={faBookmark}
          color="bg-indigo-500"
          loading={isLoading}
        />
        <DashboardCard
          title="Total Tags"
          value={stats.totalTags}
          icon={faTags}
          color="bg-purple-500"
          loading={isLoading}
        />
        <DashboardCard
          title="System Status"
          value={stats.uptime}
          icon={faServer}
          color="bg-green-500"
          loading={isLoading}
        />
      </div>

      {/* Placeholder for future charts/tables */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center h-64">
        <div className="text-gray-300 text-5xl mb-4">
          <FontAwesomeIcon icon={faServer} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          More analytics coming soon
        </h3>
        <p className="text-gray-500 max-w-sm mt-2">
          The next phase of ML integration will display content categorization
          accuracy here.
        </p>
      </div>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, value, icon, color, loading }: DashboardCard) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div
          className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shadow-lg`}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
