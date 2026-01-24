"use client";
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import Link from "next/link";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password Reset Email Sent Successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main Container: White/Gray Theme
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Password Reset
          </h1>
          <p className="text-sm text-gray-500">
            Enter your email below to receive a password reset link.
          </p>
        </div>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
              Email Address
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="Enter your email" 
              required 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-lg py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
               <div className="flex items-center gap-2">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Sending...</span>
               </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link 
            href="/hr/login" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;