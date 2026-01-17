/** @format */
"use client";
import React from "react";
import { FaBriefcase, FaGlobe, FaBolt, FaShieldAlt } from "react-icons/fa";

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "Apply Without the Burnout",
      description:
        "No more repetitive typing. Upload your resume once, and we handle the rest.",
      icon: <FaBriefcase className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 2,
      title: "Stand Out. Get Picked",
      description:
        "Build an ATS-optimized resume that passes filters. Send personalized AI emails to recruiters.",
      icon: <FaGlobe className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 3,
      title: "Know What You're Missing",
      description:
        "Our Skill Engine scans real job listings and tells you exactly which skills you need.",
      icon: <FaBolt className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 4,
      title: "Secure & Private",
      description:
        "Your personal information is encrypted and never shared—ensuring complete privacy.",
      icon: <FaShieldAlt className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    // Changed section bg to slate-50 to make white cards pop
    <section className="bg-white py-16 sm:py-24">
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
            The job you want isn't waiting. We built the tools to help you catch it.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="
                group relative bg-slate-50 rounded-2xl p-8 
                border border-slate-200 shadow-sm 
                transition-all duration-300 ease-in-out
                hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200
                flex flex-col items-center text-center
              "
            >
              {/* Icon Container */}
              <div className="
                mb-6 w-14 h-14 rounded-full 
                bg-blue-50 border border-blue-100
                flex items-center justify-center 
                transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
              ">
                {/* Cloning the icon to change color on hover without passing props. 
                    Alternatively, keep the icon white and change bg only.
                 */}
                <div className="text-blue-600 transition-colors duration-300 group-hover:text-white">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed">
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
