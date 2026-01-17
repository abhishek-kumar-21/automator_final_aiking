/** @format */
"use client";
import React from "react";
import { 
  FaChartPie, 
  FaRobot, 
  FaFileAlt, 
  FaPaperPlane, 
  FaHandshake 
} from "react-icons/fa";

const SequenceSection = () => {
  const steps = [
    {
      id: 1,
      title: "1. Skill Analysis",
      description: "AI identifies gaps in your profile compared to market demands.",
      icon: <FaChartPie className="w-8 h-8 text-[#1d4ed8]" />, 
    },
    {
      id: 2,
      title: "2. AI Interview Preparation",
      description: "Practice with a digital recruiter tailored to your target role.",
      icon: <FaRobot className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 3,
      title: "3. ATS-Optimized Resume Builder",
      description: "Instantly generate a keyword-optimized CV for every application.",
      icon: <FaFileAlt className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 4,
      title: "4. Smart Auto Apply",
      description: "Automatically submit applications to 100s of matched jobs while you sleep.",
      icon: <FaPaperPlane className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 5,
      title: "5. Recruiter Outreach & Follow-ups",
      description: "Intelligent follow-ups sent to hiring managers automatically.",
      icon: <FaHandshake className="w-8 h-8 text-[#1d4ed8]" />,
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Sequential Path to Success
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Our AI handles the tedious parts of job hunting, guiding you step-by-step from discovery to employment.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative">
          
          {/* Connector Line (Internal - connects icons) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10 transform -translate-y-1/2" />

          {steps.map((step) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center text-center group"
            >
              {/* Icon Circle */}
              <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#1d4ed8] group-hover:scale-110 transition-all duration-300 z-10">
                {step.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SequenceSection;