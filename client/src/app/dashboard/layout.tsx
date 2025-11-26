"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1. Import FontAwesome components and specific icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBookmark,
  faBolt,
  faGauge,
  faSignOutAlt, // <--- Imported Logout Icon
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Get logout function from Context
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Protect the /dashboard route
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p>Verifying User Privileges...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // RENDER DASHBOARD
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SmartMarks</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 flex flex-col">
          {/* Dashboard Link */}
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={<FontAwesomeIcon icon={faGauge} className="w-5 h-5" />}
          />

          {/* Profile Link */}
          <SidebarLink
            href="/dashboard/profile"
            label="Profile"
            icon={<FontAwesomeIcon icon={faUser} className="w-5 h-5" />}
          />

          {/* Bookmarks Link */}
          <SidebarLink
            href="/dashboard/bookmarks"
            label="Bookmarks"
            icon={<FontAwesomeIcon icon={faBookmark} className="w-5 h-5" />}
          />

          {/* Admin Link - Only show if role is admin */}
          {user.role === "admin" && (
            <SidebarLink
              href="/admin"
              label="Admin Panel"
              icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5" />}
            />
          )}

          {/* Spacer to push logout to bottom (Optional) */}
          <div className="flex-1"></div>

          {/* --- LOGOUT BUTTON --- */}
          <button
            onClick={logout}
            className="flex items-center px-4 py-3 w-full text-left text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="mr-3 flex items-center justify-center w-6">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
            </span>
            <span className="font-medium">Sign Out</span>
          </button>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="md:hidden mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">SmartMarks</h1>
          {/* Mobile Logout Button (Optional) */}
          <button onClick={logout} className="text-gray-600 hover:text-red-600">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

// --- HELPER COMPONENT ---
function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      <span className="mr-3 flex items-center justify-center w-6">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
