/** @format */
"use client";
import React from "react";
import { 
  FaCloudDownloadAlt, 
  FaBrain, 
  FaEnvelopeOpenText, 
  FaSyncAlt, 
  FaUserCheck 
} from "react-icons/fa";

const SequenceSection = () => {
  const steps = [
    {
      id: 1,
      title: "1. Auto Download",
      description: "Automatically download resumes of the applicants.",
      icon: <FaCloudDownloadAlt className="w-8 h-8 text-[#1d4ed8]" />, 
    },
    {
      id: 2,
      title: "2. AI Shortlisting",
      description: "Shortlisting candidates based on job description",
      icon: <FaBrain className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 3,
      title: "3. Automated Email",
      description: "Send automated emails to engage with candidates",
      icon: <FaEnvelopeOpenText className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 4,
      title: "4. Auto Follow-ups",
      description: "Follow-up the hiring process automated to to reduce recruiter tasks",
      icon: <FaSyncAlt className="w-8 h-8 text-[#1d4ed8]" />,
    },
    {
      id: 5,
      title: "5. Hire Best",
      description: "Hire best candidate for the requirements",
      icon: <FaUserCheck className="w-8 h-8 text-[#1d4ed8]" />,
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-24 border-none shadow-none outline-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-4 relative">
          
          {/* Connector Line (Hidden on mobile, visible on desktop) */}
          {/* Adjusted top position to align with icon centers */}
          <div className="hidden lg:block absolute top-[3rem] left-0 w-full h-0.5 bg-gray-100 -z-10" />

          {steps.map((step) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center text-center group"
            >
              {/* Icon Circle - White background to hide the line behind it */}
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