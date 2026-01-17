/** @format */
"use client";

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { toast } from "react-toastify";
import app from "@/firebase/config";
import { getDatabase, ref, set } from "firebase/database";
import axios from "axios";
import Link from 'next/link';
import SignInwithGoogle from "../loginwithgoogle/page";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import Eye Icons

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Combined name state for cleaner UI handling
  const [loading, setLoading] = useState(false);
  
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const auth = getAuth();
    
    // Split full name into first/last for database storage if needed
    const nameParts = fullName.trim().split(" ");
    const fname = nameParts[0];
    const lname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const displayName = fullName;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName });
        await sendEmailVerification(user);

        const db = getDatabase(app);
        const newDocRef = ref(db, "user/" + user.uid);

        await set(newDocRef, { fname, lname, email, password });

        toast.success("Registered! Check your email for verification.", { position: "top-center" });

        await axios.post("https://welcomeemail-hrjd6kih3q-uc.a.run.app/send-email", {
          email: email,
          name: displayName || "User",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed background to white
    <main className="flex items-center justify-center min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header Section */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Create New Account <span className="text-3xl">👋</span>
          </h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Today is a new day. It&apos;s your day. You shape it.<br />
            Register to shape your carrier and get hired in your dream jobs.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          <div className="space-y-5">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#F9FAFB] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#F9FAFB] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input with Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="at least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  // Added pr-10 to prevent text overlap with icon
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#F9FAFB] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {loading ? "Creating Account..." : "Create account"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="w-full">
            <SignInwithGoogle />
          </div>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t you have an account?{" "}
            <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Register;
