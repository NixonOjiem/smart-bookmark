"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth"); // Redirect to Login
        return;
      }
      // 3. Check if User is Admin
      if (user.role !== "admin") {
        console.warn("Unauthorized Access: User is not admin");
        router.push("/dashboard"); // back to normal dashboard
      }
    }
  }, [user, isLoading, router]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p>Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  // --- UNAUTHORIZED STATE ---
  // If user is null or not admin, don't render anything (redirect is happening)
  if (!user || user.role !== "admin") {
    return null;
  }

  // --- AUTHORIZED ADMIN LAYOUT ---
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Dark Sidebar to distinguish from User Dashboard */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-purple-400">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">System Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <AdminLink href="/admin" label="Overview" icon="📊" />
          <AdminLink href="/admin/users" label="User Management" icon="👥" />
          <AdminLink href="/admin/settings" label="System Settings" icon="⚙️" />

          <div className="pt-8 border-t border-gray-800 mt-4">
            <AdminLink href="/dashboard" label="Exit to App" icon="↩️" />
          </div>
        </nav>

        <div className="p-4 bg-gray-800">
          <p className="text-xs text-gray-400">Logged in as:</p>
          <p className="font-bold truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

// Helper Component for Admin Links
function AdminLink({
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
      className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
