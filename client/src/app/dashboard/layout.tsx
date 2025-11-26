"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 1. Protect the /dashoboard route
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth"); // or "/login" depending on your route
    }
  }, [user, isLoading, router]);

  // 2. LOADING STATE
  // While checking localStorage, show a spinner so the user doesn't see a broken page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not loading and no user, return null (the useEffect above will redirect)
  if (!user) {
    return null;
  }

  // 3. RENDER DASHBOARD (Sidebar + Content)
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SmartMarks</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink href="/dashboard" label="My Bookmarks" icon="📑" />
          <SidebarLink href="/dashboard/profile" label="Profile" icon="👤" />

          {/* Admin Link - Only show if role is admin */}
          {user.role === "admin" && (
            <SidebarLink href="/admin" label="Admin Panel" icon="⚡" />
          )}
        </nav>

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
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">SmartMarks</h1>
          {/* You can add a hamburger menu toggle here later */}
        </div>

        {children}
      </main>
    </div>
  );
}

// Simple Helper Component for Links
function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
