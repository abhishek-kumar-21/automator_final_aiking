"use client"

import React, { useState } from 'react';

const Sidebar = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Define navigation items following your naming convention
  const mainNavItems = [
    { title: 'Dashboard', path: '/images/dashboard.svg', href: '/' },
    { title: 'Skill Builder', path: '/images/skill-builder.svg', href: '/dashboard/course' },
    { title: 'Resume Builder', path: '/images/resume-builder.svg', href: '/' },
    { title: 'Interview Prep', path: '/images/interview-prep.svg', href: '/dashboard/interview' },
    { title: 'Automation Hub', path: '/images/automation-hub.svg', href: '/' },
  ];

  const footerNavItems = [
    { title: 'Refer your friend', path: '/images/refer.svg' },
    { title: 'Settings', path: '/images/settings.svg' },
  ];

  return (
    <div>
      {/* Desktop Sidebar - Fixed on large screens */}
      <div className="h-screen w-64 shadow-md border-r md:block hidden fixed left-0 top-0 bg-white p-6">
        <div className="flex flex-col h-full justify-between">
          
          {/* Top Section: Logo + Main Nav */}
          <div className="space-y-10">
            {/* Logo */}
            <div className="px-2">
              <img src="images/logo.svg" alt="JobForm Automator" className="h-10" />
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-y-7">
              {mainNavItems.map((item) => (
                <a
                  key={item.title}
                  // href={`#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  href={item.href}
                  className="flex items-center gap-4 text-[#737373] hover:text-blue-600 font-medium transition-colors"
                >
                  <img src={item.path} alt={item.title} className="w-6 h-6" />
                  <span className="text-[17px]">{item.title}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Bottom Section: Premium + Footer Nav + Profile */}
          <div className="flex flex-col gap-y-7">
            {/* Get Premium Card - Styled exactly as Image 1 */}
            <div className="rounded-xl overflow-hidden border border-[#DCE4F2]">
              <button className="w-full bg-[#3B71CA] text-white py-3 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                <img src="/images/premium.svg" alt="Premium" className="w-5 h-5" />
                <span className="font-semibold text-sm">Get Premium</span>
              </button>
              <div className="bg-[#E9F0FD] py-2">
                <p className="text-[#3B71CA] text-[11px] text-center font-medium">
                  Unlock all features and AI tools
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <nav className="flex flex-col gap-y-7">
              {footerNavItems.map((item) => (
                <a
                  key={item.title}
                  href={`#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-4 text-[#737373] hover:text-blue-600 font-medium transition-colors"
                >
                  <img src={item.path} alt={item.title} className="w-6 h-6" />
                  <span className="text-[17px]">{item.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Frame 38) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-2 z-50">
        <div className="flex justify-around items-center px-2">
          {/* Dashboard */}
          <button className="flex flex-col items-center gap-1">
            <img src="images/dashboard.svg" alt="Dashboard" className="w-6 h-6" />
            <span className="text-[11px] font-medium text-gray-800">Dashboard</span>
          </button>

          {/* Skill Builder */}
          <button className="flex flex-col items-center gap-1">
            <img src="images/skill-builder.svg" alt="Skill Builder" className="w-6 h-6" />
            <span className="text-[11px] font-medium text-gray-800 text-center leading-tight">Skill Builder</span>
          </button>

          {/* Automation Hub */}
          <button className="flex flex-col items-center gap-1">
            <img src="images/automation-hub.svg" alt="Automation Hub" className="w-6 h-6" />
            <span className="text-[11px] font-medium text-gray-800 text-center leading-tight">Automation Hub</span>
          </button>

          {/* More Menu Toggle */}
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex gap-0.5 mb-1.5 pt-1">
               <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
               <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
               <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            </div>
            <span className="text-[11px] font-medium text-gray-800">More</span>
          </button>
        </div>

        {/* Mobile "More" Drawer Overlay */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 w-full bg-white border-t rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
            
            {/* Items not in the primary bar */}
            {mainNavItems.slice(2, 4).concat(footerNavItems).map((item) => (
              <a key={item.title} href="#" className="flex items-center gap-4 py-1 text-gray-700">
                <img src={item.path} alt={item.title} className="w-6 h-6" />
                <span className="font-semibold">{item.title}</span>
              </a>
            ))}

            <div className="pt-2">
              <button className="w-full bg-[#3B71CA] text-white rounded-xl py-3.5 font-bold shadow-lg">
                Get Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
