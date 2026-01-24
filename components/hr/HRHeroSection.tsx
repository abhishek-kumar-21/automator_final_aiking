'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, TrendingUp, FastForward, Users, X } from 'lucide-react';
import { Playfair_Display, Inter, Caveat } from 'next/font/google';
import { Clock, UserCheck, Zap } from 'lucide-react';
import Link from 'next/link';

const serifFont = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
});

const sansFont = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
});

const scriptFont = Caveat({ 
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-script',
});

const HRHeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className={`
      ${serifFont.variable} ${sansFont.variable} ${scriptFont.variable} 
      relative w-full max-w-[100vw] bg-white font-sans
      overflow-x-hidden 
    `}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-white -z-10" />

      {/* Main Container */}
      <div className="w-full pt-4 pb-12 lg:pt-0 lg:pb-0 relative min-h-[600px] lg:h-[800px] flex items-center">
        
        <div className="flex flex-col lg:flex-row items-center w-full h-full">
          
          {/* --- LEFT COLUMN: Content --- */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8 z-10 px-6 sm:px-8 lg:px-0 lg:pl-16 xl:pl-32 py-12 lg:py-0">
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-gray-900 leading-[1.1]">
              Hire Right 
              Candidate. 
              <span className="relative ml-3">
                <span className="font-script text-blue-600 relative z-10 transform -rotate-2">
                  Faster
                </span>
                <svg 
                  className="absolute left-0 bottom-[-10px] w-full h-4 text-blue-600 -z-0" 
                  viewBox="0 0 100 10" 
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path d="M5 8 Q 50 12 95 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Automated outreach, screen applicants, and book interviews faster with powerful Al hiring toolset.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
                    <Image 
                      src={`https://randomuser.me/api/portraits/thumb/men/${20 + i}.jpg`} 
                      alt="User" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-900">
                <span className="font-bold">1000+</span> JobSeekers using Jobform Automator.
              </p>
            </div>

            {/* CTA Buttons */}
            {/* CHANGED: Removed max-w-md to prevent squeezing. Added whitespace-nowrap to buttons. */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
              <Link href="https://chromewebstore.google.com/detail/jobform-automator-ai-hiri/odejagafiodlccfjnfcnhgpeggmbapnk" className="w-full sm:w-auto" target='_blank'>
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-lg shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 flex items-center justify-center whitespace-nowrap">
                  Get started – Try it for free
                </button>
              </Link>

              <button 
                onClick={() => setIsVideoOpen(true)}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-lg transition-all shadow-sm whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Play size={10} fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Features Footer */}
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-800 pt-4">
              {/* 1. Save hours -> Clock Icon */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Save hours
              </div>

              {/* 2. Find top talent -> UserCheck Icon (implies selecting the right person) */}
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gray-600" />
                Find top talent
              </div>

              {/* 3. Hire Faster -> Zap Icon (implies speed/instant) */}
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-600" />
                Hire Faster
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Static Map Image --- */}
          <div className="relative w-full lg:w-[55%] h-[400px] lg:h-full flex items-center justify-end">
             <Image 
               src="/images/hr-map.svg"
               alt="Worldwide Users Map"
               fill
               priority
               className="object-contain lg:object-right" 
               sizes="(max-width: 768px) 100vw, 60vw"
             />
          </div>

        </div>
      </div>

      {/* --- VIDEO MODAL OVERLAY --- */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsVideoOpen(false)}
          />
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-4">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
            >
              <X size={24} />
            </button>
            <iframe
              className="w-full h-full relative z-10"
              src="https://www.youtube.com/embed/wH5qO0f-kKA?rel=0&autoplay=1"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; clipboard-write; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HRHeroSection;
