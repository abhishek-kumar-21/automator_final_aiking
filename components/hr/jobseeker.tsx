/** @format */
"use client";

import Image from "next/image";

const JobSeeker = () => {
  const handleClick = function () {
    try {
      window.location.href = "hr/referral";
    } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <div className="w-full bg-white">
      <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div
          className="
          relative w-full overflow-hidden 
          bg-gradient-to-b from-[#eef2ff] to-[#dbeafe] 
          border border-blue-100 rounded-[32px] 
          shadow-sm
          min-h-[300px] md:min-h-[350px]
          flex flex-col items-center justify-center
          text-center
        "
        >
          {/* Background Decorative Arches - SVG replication of the lines in image */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <svg
              className="absolute bottom-0 w-full h-full"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
            >
              {/* Large outer arch */}
              <path
                d="M0 300 Q 500 -100 1000 300"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.3"
              />
              {/* Middle arch */}
              <path
                d="M0 300 Q 500 -50 1000 300"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.4"
              />
              {/* Inner arch */}
              <path
                d="M0 300 Q 500 0 1000 300"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Content Container */}
          <div className="relative z-10 px-4 max-w-2xl mx-auto">

            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Enjoy our premium benefits for free.
            </h2>

            <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Refer your friends or share on LinkedIn to unlock premium rewards instantly.
            </p>

            <button
              onClick={handleClick}
              className="
              px-8 py-3 
              bg-[#1d4ed8] hover:bg-[#1e40af] 
              text-white font-semibold text-base
              rounded-lg shadow-md hover:shadow-lg
              transition-all duration-300 transform hover:-translate-y-0.5
            "
            >
              Get Started
            </button>
          </div>

          {/* Subtle Bottom Border Accent */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
        </div>
      </section>
    </div>
  );
};

export default JobSeeker;