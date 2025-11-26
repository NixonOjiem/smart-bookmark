"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookBookmark } from "@fortawesome/free-solid-svg-icons/faBookBookmark";
function NavigationBar() {
  return (
    <>
      <nav className="w-full border-b border-gray-100 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">
                <FontAwesomeIcon
                  icon={faBookBookmark}
                  className="text-black-600"
                />
              </span>
              <span className="font-bold text-xl tracking-tight">
                <span className="text-gray-900">Smart</span>
                <span className="text-blue-600">Marks</span>
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="text-gray-200 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-blue-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavigationBar;
