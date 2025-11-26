import React from "react";

function FooterComponent() {
  return (
    <>
      <footer className="bg-black border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2024 SmartMarks. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900">
              Terms
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default FooterComponent;
