/** @format */
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Bot, 
  Settings, 
  Crown, 
  Upload, 
  ChevronRight,
  BriefcaseBusiness,
  FileCheck,
  CheckCircle2,
  XCircle
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans text-slate-800">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10 left-0 top-0">
        
        {/* Logo Area */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-2">
             <Image 
                src="/images/updated-logo.png" // Replace with your actual logo path
                alt="JobForm Automator" 
                width={140} 
                height={40} 
                className="object-contain"
             />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active 
          />
          <SidebarItem 
            icon={<Briefcase size={20} />} 
            label="Active Jobs" 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Shortlist Resumes" 
          />
          <SidebarItem 
            icon={<Bot size={20} />} 
            label="Automation Hub" 
          />
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 mt-auto">
          <button className="w-full bg-[#1d4ed8] text-white flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-blue-200 shadow-lg hover:bg-blue-700 transition-colors mb-4">
            <Crown size={18} fill="white" />
            Get Premium
          </button>
          
          <button className="w-full flex items-center gap-3 text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 ml-64 p-8 lg:px-12 pt-6">
        
        {/* Top Header */}
        <header className="flex justify-end items-center mb-12 gap-8">
          <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-black">Home</Link>
            <Link href="#" className="hover:text-black">About us</Link>
            <Link href="#" className="hover:text-black">Pricing</Link>
          </nav>
          
          <button className="bg-[#4F86F7] text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-blue-600 transition-colors">
            Switch to candidate
          </button>

          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
               {/* Replace with actual user image */}
               <Image 
                 src="https://randomuser.me/api/portraits/men/32.jpg" 
                 alt="Profile" 
                 width={40} 
                 height={40} 
               />
            </div>
            <span className="font-semibold text-gray-800">Jason Duello</span>
          </div>
        </header>


        {/* Dashboard Title & Action */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <h2 className="text-lg font-semibold text-gray-800">HiringOverview</h2>
          </div>
          
          <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Upload size={18} />
            Upload Resumes
          </button>
        </div>


        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<BriefcaseBusiness className="text-blue-500" size={28} />}
            iconBg="bg-blue-100"
            title="Active Jobs"
            value="8"
            subtext="2 closing this week"
          />
          <StatCard 
            icon={<FileCheck className="text-indigo-500" size={28} />}
            iconBg="bg-indigo-100"
            title="Applications"
            value="300"
            subtext="+48 this week"
          />
          <StatCard 
            icon={<CheckCircle2 className="text-green-500" size={28} />}
            iconBg="bg-green-100"
            title="Shortlisted"
            value="96"
            subtext="28% of total"
          />
          <StatCard 
            icon={<XCircle className="text-red-500" size={28} />}
            iconBg="bg-red-100"
            title="Rejected"
            value="186"
            subtext="Auto-rejected by JD match"
          />
        </div>


        {/* Hiring Funnel Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Hiring Funnel</h2>
            <Link href="#" className="text-blue-600 text-xs font-bold flex items-center hover:underline">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {/* Funnel Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <FunnelTab label="Applications" />
              <FunnelTab label="Reviewed" />
              <FunnelTab label="Shortlisted" active />
              <FunnelTab label="Selected" />
            </div>
          </div>

          {/* Placeholder Content Area */}
          <div className="h-64 mt-6 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
             {/* Charts or List would go here */}
             <span className="text-sm">Funnel Data Visualization Placeholder</span>
          </div>
        </div>

      </main>
    </div>
  );
};

// --- Sub-components for cleaner code ---

const SidebarItem = ({ icon, label, active = false }) => (
  <div 
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
      active 
        ? "bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600 rounded-r-none" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const StatCard = ({ icon, iconBg, title, value, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-gray-800 font-semibold text-sm mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-xs text-gray-500 font-medium">{subtext}</p>
    </div>
  </div>
);

const FunnelTab = ({ label, active = false }) => (
  <button 
    className={`pb-3 text-sm font-medium transition-all relative ${
      active 
        ? "text-gray-900 border-b-2 border-blue-600" 
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
);

export default Dashboard;