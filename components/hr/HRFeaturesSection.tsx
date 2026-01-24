/** @format */
"use client";
import React from "react";
import { FaBriefcase, FaGlobe, FaBolt, FaShieldAlt } from "react-icons/fa";

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "Resume Auto-Download",
      description:
        "Zero clicks, zero missed candidates.",
      icon: <FaBriefcase className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 2,
      title: "AI Resume Parsing",
      description:
        "Structured data ready for your ATS; export anytime.",
      icon: <FaGlobe className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 3,
      title: "AI Candidate Outreach",
      description:
        "Personalised sequences that nurture talent while you sleep.",
      icon: <FaBolt className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 4,
      title: "AI Video Interviews",
      description:
        "Consistent questions, real-time scoring, shareable highlights.",
      icon: <FaShieldAlt className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    // Changed section bg to slate-50 to make white cards pop
    <section className="bg-white py-16 sm:py-24 border-none shadow-none outline-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-800 tracking-tight">Features</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            The Future Doesn't Wait. Neither Do You.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            All-in-one feature stack
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="
                group relative bg-blue-50/50 rounded-2xl p-8 
                border border-blue-100 shadow-sm 
                transition-all duration-300 ease-in-out
                hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200
                flex flex-col items-center text-center
              "
            >
              {/* Icon Container */}
              <div className="
                mb-6 w-14 h-14 rounded-full 
                bg-blue-100 border border-blue-200
                flex items-center justify-center 
                transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
              ">
                <div className="text-blue-600 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
