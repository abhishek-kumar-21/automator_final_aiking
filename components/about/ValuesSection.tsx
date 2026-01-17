/** @format */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock, Brain, User, ShieldCheck } from "lucide-react"; // Clean vector icons to match the design

const ValuesSection = () => {
  const values = [
    {
      icon: Clock,
      title: "Efficiency",
      description:
        "We prioritize time-saving automation to help users apply for jobs quickly and effortlessly, allowing them to focus on what truly matters.",
    },
    {
      icon: Brain,
      title: "Innovation",
      description:
        "We constantly push the boundaries of AI technology to enhance our platform, ensuring it remains at the forefront of job application automation.",
    },
    {
      icon: User,
      title: "User-Centricity",
      description:
        "Our users are at the heart of everything we do. We design our tool to be intuitive, reliable, and tailored to meet the diverse needs of job seekers worldwide.",
    },
    {
      icon: ShieldCheck,
      title: "Integrity",
      description:
        "We are committed to maintaining transparency, trust, and ethical practices in all our operations, ensuring that our users can rely on us for a fair and honest experience.",
    },
  ];

  const valueRefs = useRef([]);
  const [isInView, setIsInView] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = valueRefs.current.findIndex((card) => card === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setIsInView((prev) => {
              const newInView = [...prev];
              newInView[index] = true;
              return newInView;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    valueRefs.current.forEach((card) => card && observer.observe(card));

    return () => {
      valueRefs.current.forEach((card) => card && observer.unobserve(card));
    };
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-16">
          Our Values
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              ref={(el) => (valueRefs.current[index] = el)}
              className={`bg-[#F5F9FF] p-8 rounded-[32px] text-center transition-all duration-700 ease-out transform hover:-translate-y-2 hover:shadow-lg ${
                isInView[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              {/* Icon Circle */}
              <div className="w-20 h-20 mx-auto bg-[#DDE8FA] rounded-full flex items-center justify-center mb-6">
                <value.icon className="w-10 h-10 text-[#185BC3]" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#185BC3] mb-4">
                {value.title}
              </h3>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
