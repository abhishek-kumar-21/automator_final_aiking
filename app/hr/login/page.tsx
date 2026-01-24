// pages/hr-login.tsx
"use client";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, get, set } from "firebase/database";
import Link from 'next/link';
import SignInWithGoogle from "../loginwithGoogle/SignInWithGoogle"
// Import icons for password toggle
import { FaEye, FaEyeSlash } from "react-icons/fa";

function HRLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // New state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const db = getDatabase(app);

  async function notifyExtensionOnLogin(uid: unknown) {
    try {
      const event = new CustomEvent("userLoggedIn", { detail: { uid } });
      document.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error("Error notifying extension:", error);
      throw error;
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await notifyExtensionOnLogin(user.uid);
        if (!user.emailVerified) {
          toast.error("Email not verified. Please verify before logging in.", {
            position: "bottom-center",
          });
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user && user.emailVerified) {
        localStorage.setItem("UIDforHR", user.uid);
        localStorage.setItem("IsLoginAsHR", "true");

        // GET REFERRAL IF THERE IN COOKIE
        const getReferralCodeFromCookie = () => {
          const cookie = document.cookie.split('; ').find(row => row.startsWith('referral='));
          return cookie ? cookie.split('=')[1] : null;
        };
        const referralCode = getReferralCodeFromCookie()
        
        // SAVE REFERAL CODE IN DATABASE
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace("T", " ").split(".")[0];
        
        if (referralCode) {
          console.log("Save in database/firebase")
          console.log("login", user.uid)
          const newDocRef = ref(db, `/referrals/${referralCode}/${user.uid}`);
          
          get(newDocRef).then((snapshot) => {
            if (!snapshot.exists()) {
              // If the referral code doesn't exist, create a new entry
              set(newDocRef, {
                signupDate: formattedDateTime,
                amount: 0,
              }).then(() => {
                 // Success handling if needed
              })
            }
          })
        }

        // Only fetch Gemini API key
        const apiRef1 = ref(db, `hr/${user.uid}/API/apiKey`);
        const apiRef2 = ref(db, `hr/${user.uid}/API/apikey`);
        const apiSnapshot1 = await get(apiRef1);
        const apiSnapshot2 = await get(apiRef2);

        let apiKey = "";
        if (apiSnapshot1.exists()) {
          apiKey = apiSnapshot1.val();
        } else if (apiSnapshot2.exists()) {
          apiKey = apiSnapshot2.val();
        }

        localStorage.setItem("api_key", apiKey);
        console.log(apiKey, "key suman")

        toast.success("HR logged in successfully", { position: "top-center" });
        
        if (apiKey) {
          setTimeout(() => {
            window.location.href = "/hr"
          })
        }
        else {
          setTimeout(() => {
            window.location.href = "/hr/gemini";
          }, 2000)
        }
      } else {
        toast.error("Email is not verified. Please verify your email and try again!", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "HR Login Error";
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Updated Main Container: White/Gray Theme
    <main className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-4 sm:p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Sign In</h1>
          <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password Input with Eye Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Dynamic type based on state
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                // Added pr-12 to prevent text overlap with icon
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              href="/hr/passwordreset" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold p-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="flex justify-center">
            <SignInWithGoogle />
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Don&apos;t have an account?{" "}
          <Link 
            href="/hr/signUp" 
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default HRLogin;
