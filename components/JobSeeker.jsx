/** @format */
"use client";

import Link from "next/link";

const JobSeeker = () => {
  const handleClick = function () {
    try {
      window.location.href = "/referral";
    } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Enjoy our <span className="text-blue-600">premium</span> benefits <br className="hidden sm:block" />
          for <span className="text-blue-600">free</span>.
        </h2>

        {/* Subtext */}
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Refer your friends or share on LinkedIn to unlock premium rewards instantly.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-sm"
          >
            Get Started
          </button>
          
          {/* Contact Button (Added to match image) */}
          <Link href="/contactUs" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors duration-200">
              Contact us
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default JobSeeker;
