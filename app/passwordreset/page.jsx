/** @format */
"use client";
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import Link from "next/link"; // Better to use next/link for client-side routing

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
    // Main Container: White background
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Section matching the Sign-In Page style */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Reset Password 🔒
          </h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Enter your email below to receive a password reset link.
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handlePasswordReset} className="mt-8 space-y-6">
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="Enter your email" 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#F9FAFB] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-4">
          <Link 
            href="/sign-in" 
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
