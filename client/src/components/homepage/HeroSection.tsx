import React from "react";
import Link from "next/link";
import { FeatureCard } from "./helperFunctions/HelperFunction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip } from "@fortawesome/free-solid-svg-icons/faMicrochip";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";

function HeroSection() {
  return (
    <>
      <main className="flex-grow">
        <div className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
              Powered by AI Auto-Tagging
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Stop losing your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                favorite links.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              Save any URL and let our AI automatically analyze, categorize, and
              tag it for you. Never organize manually again.
            </p>

            <div className="flex justify-center gap-4">
              <Link
                href="/auth"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-xl hover:bg-blue-700 transition-all hover:-translate-y-1"
              >
                Start Bookmarking Free
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Why use SmartMarks?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={
                  <FontAwesomeIcon
                    icon={faMicrochip}
                    className="text-blue-600"
                  />
                }
                title="AI Auto-Tagging"
                desc="Paste a link, and our ML engine reads the content to generate relevant tags instantly."
              />
              <FeatureCard
                icon={
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-blue-600"
                  />
                }
                title="Instant Search"
                desc="Find any bookmark in milliseconds. Filter by tags, dates, or keywords."
              />
              <FeatureCard
                icon={
                  <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                }
                title="Private & Secure"
                desc="Your data is encrypted. We don't sell your browsing history to advertisers."
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HeroSection;
