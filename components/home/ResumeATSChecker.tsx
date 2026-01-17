"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";

const ResumeATSChecker = () => {
  const elementRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation sequence for benefits items
  const [animatedItems, setAnimatedItems] = useState([]);
  
  // Updated text to match the image exactly
  const benefits = [
    { icon: CheckCircle, text: "Discover missing skills for your target role" },
    { icon: CheckCircle, text: "Get a clear, guided skill-building path" },
    { icon: CheckCircle, text: "Align your resume with in-demand skills" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);

          // Stagger the animations of benefit items
          const timer = setTimeout(() => {
            benefits.forEach((_, index) => {
              setTimeout(() => {
                setAnimatedItems(prev => [...prev, index]);
              }, index * 200);
            });
          }, 400);

          return () => clearTimeout(timer);
        } else {
          setIsInView(false);
          setAnimatedItems([]);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [benefits]);

  const handleClick = function(){
    window.location.href = "/atsresume"
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-16 flex justify-center bg-white">
      <div
        ref={elementRef}
        className={`relative w-full max-w-7xl bg-[#F4F8FC] rounded-[32px] overflow-hidden transition-all duration-700 ease-out ${
          isInView
            ? "transform translate-y-0 opacity-100"
            : "transform translate-y-10 opacity-0"
        }`}
      >
        <div className="flex flex-col lg:flex-row justify-between items-center px-6 sm:px-12 md:px-16 py-12 md:py-16">
          
          {/* LEFT SIDE: Content Section */}
          {/* CHANGED: Removed 'text-center' so it aligns left on all screens */}
          <div className="text-left max-w-2xl w-full">
            <h3 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-gray-900 leading-[1.2]">
              Skill gaps holding you back? <br className="hidden sm:block" />
              Build skills that <span className="text-[#185BC3]">get you hired.</span>
            </h3>

            {/* CHANGED: Removed 'mx-auto' to prevent centering on mobile */}
            <p className="text-base sm:text-lg text-gray-600 mt-6 leading-relaxed max-w-xl font-medium">
              Identify your skill gaps, learn what recruiters actually want, and build the right skills faster.
            </p>

            {/* Benefits List */}
            <div className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  // CHANGED: 
                  // 1. Removed 'justify-center' so it aligns start on mobile.
                  // 2. Changed 'items-center' to 'items-start' for better multiline alignment on small screens.
                  className={`flex items-start gap-3 transition-all duration-500 justify-start ${
                    animatedItems.includes(index)
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform -translate-x-4"
                  }`}
                >
                  {/* Added mt-1 to align icon with the top of the text if text wraps */}
                  <benefit.icon className="text-[#185BC3] shrink-0 mt-1" size={24} />
                  <span className="text-base text-gray-800 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: CTA Card */}
          <div className="mt-12 lg:mt-0 lg:pl-12 w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="bg-[#DDE8FA] p-8 rounded-3xl border border-[#cbdcfc] shadow-sm w-full max-w-md">
              
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-1.5 bg-[#BFDBFE] border border-[#a5cbf5] text-gray-800 text-sm font-medium rounded-full mb-4">
                  It&apos;s Free!
                </span>
                <h4 className="text-2xl font-bold text-gray-900">Know Where You Stand</h4>
              </div>

              <button
                className={`w-full bg-[#185BC3] hover:bg-[#144ea8] text-white text-lg font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transform transition-all duration-300 ${
                  isHovered ? "scale-[1.02] shadow-lg" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
              >
                <span>Start Now</span>
                <ArrowRight size={20} className={`transition-transform duration-300 ${isHovered ? "transform translate-x-1" : ""}`} />
              </button>

              <p className="text-xs text-center text-gray-600 mt-4 font-medium px-4">
                Takes less than 5 minutes. Costs nothing. Could change everything.
              </p>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#DDE8FA] overflow-hidden"
                    >
                      <img
                        src={`https://randomuser.me/api/portraits/thumb/men/${30 + i}.jpg`}
                        alt={`User avatar ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-800 font-bold">
                  <span className="text-[#185BC3]">2,400+</span> scans today
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeATSChecker;
