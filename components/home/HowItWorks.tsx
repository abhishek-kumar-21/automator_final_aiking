'use client';

import React, { useEffect, useRef } from 'react';

export default function HowItWorks() {
  // Refs for animation
  const cardsRef = useRef([]);

  // Animation Logic (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-[20px]');
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  // Helper to add refs to array
  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    // Added border-none and shadow-none to ensure no external lines
    <section className={`w-full bg-white py-10 px-5 border-none shadow-none outline-none`}>
      {/* Removed shadow-sm from here to avoid container outline */}
      <div className="max-w-[1200px] mx-auto rounded-2xl p-4 sm:p-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-800 tracking-tight">How it works?</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            5 Steps. 1 Goal. Your Job.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            See how our extension automates form-filling, matches you with jobs,
            and saves you time on every application.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] gap-8 relative">
          
          {/* --- LEFT COLUMN --- */}
          <div className="flex flex-col gap-8 md:gap-0">
            {/* Step 1 */}
            <StepCard
              ref={addToRefs}
              title="Learn Skills That Employers Actually Need"
              desc="Personalized learning paths based on your target role. No random courses — only job-relevant skills with real-world demand."
              btnText="Start Learning"
              features={['Role-based curriculum', 'Beginner to job-ready', 'Track skill progress']}
              className="mt-0" 
            />

            {/* Step 3 (Staggered) */}
            <StepCard
              ref={addToRefs}
              title="Create the Perfect Resume in Minutes"
              desc="Create a job-specific, keyword-optimized resume with the best ATS score to boost your chances of getting interview calls."
              btnText="Create Smart Resume"
              features={['Job-specific resume versions', 'ATS-optimized keywords', 'One-click export']}
              className="md:mt-[140px]"
            />

            {/* Step 5 (Staggered) */}
            <StepCard
              ref={addToRefs}
              title="Apply to Jobs—Without the Stress"
              desc="Auto-apply to jobs, auto-fill applications, and send personalized emails to recruiters."
              btnText="Apply with AI"
              features={['Auto-apply on job portals', 'Smart form filling', 'Smart AI-written recruiter emails']}
              className="md:mt-[140px]"
            />
          </div>

          {/* --- CENTER LINE (Hidden on Mobile) --- */}
          <div className="hidden md:flex flex-col items-center relative">
            {/* The Vertical Line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-200"></div>
            
            {/* The Number Nodes */}
            <StepNumber num="1" className="mt-[100px]" />
            <StepNumber num="2" className="mt-[140px]" />
            <StepNumber num="3" className="mt-[200px]" />
            <StepNumber num="4" className="mt-[180px]" />
            <StepNumber num="5" className="mt-[200px]" />
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="flex flex-col gap-8 md:gap-0">
            {/* Step 2 (Starts lower to stagger) */}
            <StepCard
              ref={addToRefs}
              title="Know where you stand, improve faster."
              desc="Analyse your current skills against job requirements and discover exactly what to improve."
              btnText="Check Skill Gap"
              features={['Job-based skill comparison', 'Clear improvement roadmap', 'Smart recommendations']}
              className="md:mt-[140px]"
            />

            {/* Step 4 */}
            <StepCard
              ref={addToRefs}
              title="Practice. Improve. Get Confident."
              desc="AI-powered mock interviews with instant feedback on answers, confidence, and communication."
              btnText="Start Mock Interview"
              features={['Role-specific questions', 'Real-time feedback', 'Performance insights']}
              className="md:mt-[140px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

/* --- Sub-Components --- */

const StepNumber = ({ num, className }) => (
  <div className={`relative z-10 w-8 h-8 rounded-full bg-white border-2 border-indigo-200 text-blue-600 font-bold flex items-center justify-center ${className}`}>
    {num}
  </div>
);

const StepCard = React.forwardRef(({ title, desc, btnText, features, className }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative bg-white border border-slate-200 rounded-2xl p-6 shadow-md transition-all duration-500 ease-out opacity-0 translate-y-[20px] ${className || ''}`}
    >
      <h3 className="text-lg font-bold text-slate-900 mb-2.5">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{desc}</p>
      
      <a href="#" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors mb-4">
        {btnText}
      </a>

      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="text-[13px] text-slate-700 flex items-center">
            <span className="text-blue-600 text-xs mr-2">✔</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
});

StepCard.displayName = 'StepCard';
