"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBookmark,
  faBolt,
  faTags,
  faGauge,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // To Highlight Active link

  // Protection Logic
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

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

  if (!user) return null;

  // --- CONFIG: Define Links Array ---
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: faGauge },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: faBookmark },
    { href: "/dashboard/tags", label: "Tags", icon: faTags },
    { href: "/dashboard/profile", label: "Profile", icon: faUser },
  ];

  // Admin link if Authorized
  if (user.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: faBolt });
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* DESKTOP SIDEBAR (Hidden on Mobile)             */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">SmartMarks</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 flex flex-col">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={<FontAwesomeIcon icon={link.icon} className="w-5 h-5" />}
              isActive={pathname === link.href}
            />
          ))}

          <div className="flex-1"></div>

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

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="md:hidden mb-6 flex justify-between items-center sticky top-0 bg-gray-100 z-10 py-2">
          <h1 className="text-xl font-bold text-blue-600">SmartMarks</h1>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-600 p-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
          </button>
        </div>

        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop)   */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50 pb-safe">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors ${
              pathname === link.href
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FontAwesomeIcon icon={link.icon} className="w-5 h-5 mb-1" />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

// --- HELPER FOR DESKTOP LINKS ---
function SidebarLink({
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
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="mr-3 flex items-center justify-center w-6">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
