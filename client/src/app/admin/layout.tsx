"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth");
        return;
      }
      if (user.role !== "admin") {
        console.warn("Unauthorized Access: User is not admin");
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

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

  if (!user || user.role !== "admin") {
    return null;
  }

  //  Links for reuse
  const adminLinks = [
    { href: "/admin", label: "Overview", icon: faChartBar },
    { href: "/admin/users", label: "Users", icon: faUsers },
  ];

  const exitLink = { href: "/dashboard", label: "Exit", icon: faArrowLeft };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* DESKTOP SIDEBAR (Hidden on Mobile)             */}
      <aside className="w-64 bg-gray-900 text-white shadow-xl hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-purple-400">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">System Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminLinks.map((link) => (
            <AdminLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={<FontAwesomeIcon icon={link.icon} className="w-5 h-5" />}
              isActive={pathname === link.href}
            />
          ))}

          <div className="pt-8 border-t border-gray-800 mt-4">
            <AdminLink
              href={exitLink.href}
              label="Exit to App"
              icon={
                <FontAwesomeIcon icon={exitLink.icon} className="w-5 h-5" />
              }
              isActive={false}
            />
          </div>
        </nav>

        <div className="p-4 bg-gray-800">
          <p className="text-xs text-gray-400">Logged in as:</p>
          <p className="font-bold truncate">{user.email}</p>
        </div>
      </aside>

      {/*. MAIN CONTENT WRAPPER                           */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Mobile Header */}
        <div className="md:hidden mb-6 flex justify-between items-center sticky top-0 bg-gray-100 z-10 py-2 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              SYSTEM
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
        </div>

        {children}
      </main>

      {/* MOBILE BOTTOM NAV (Hidden on Desktop)          */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-800 flex justify-around items-center p-2 z-50 pb-safe">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors ${
              pathname === link.href
                ? "text-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={link.icon} className="w-5 h-5 mb-1" />
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Mobile Exit Button (Added to nav bar for easy access) */}
        <Link
          href={exitLink.href}
          className="flex flex-col items-center justify-center w-full py-2 text-xs font-medium text-red-400 hover:text-red-300"
        >
          <FontAwesomeIcon icon={exitLink.icon} className="w-5 h-5 mb-1" />
          <span>Exit</span>
        </Link>
      </nav>
    </div>
  );
}

// --- HELPER FOR LINKS ---
function AdminLink({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-purple-900/50 text-purple-300 border border-purple-800/50"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      <span className="mr-3 flex items-center justify-center w-6">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
