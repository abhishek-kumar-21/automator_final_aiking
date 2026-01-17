/** @format */
"use client";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, get, ref, set } from "firebase/database";
import SignInwithGoogle from "../loginwithgoogle/page";
import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import Eye Icons

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const db = getDatabase(app);

  async function notifyExtensionOnLogin(uid: unknown) {
    try {
      console.log("Notifying extension of login");
      const event = new CustomEvent("userLoggedIn", { detail: { uid } });
      document.dispatchEvent(event);
      return true; 
    } catch (error) {
      console.error("Error notifying extension:", error);
      throw error; 
    }
  }

  useEffect(() => {
    const checkAuthState = async () => {
      const uid = localStorage.getItem("UID");
      const apiKey = localStorage.getItem("api_key");
      const isLogin = localStorage.getItem("IsLogin");
      const subscriptionType = localStorage.getItem("SubscriptionType");

      console.log("Checking login state:", { uid, isLogin, apiKey, subscriptionType });

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await notifyExtensionOnLogin(user.uid);
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      const user = auth.currentUser;

      if (user && isLogin === "true") {
        await notifyExtensionOnLogin(user.uid);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!user.emailVerified) {
          toast.error("Email not verified. Please verify before logging in.", {
            position: "bottom-center",
          });
          return;
        }

        if (apiKey !== "null" && apiKey !== null) {
          if (subscriptionType === "FreeTrialStarted" || subscriptionType === "Premium") {
            window.location.href = "/";
          } else {
            window.location.href = "/resume2";
          }
        } else {
          window.location.href = "/gemini";
        }
      }
    };

    checkAuthState();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);

      if (user && user.emailVerified) {
        localStorage.setItem("UID", user.uid);
        localStorage.setItem("IsLogin", "true");
        if (user.displayName) {
          localStorage.setItem("UserName", user.displayName);
        }

        notifyExtensionOnLogin(user.uid);

        const getReferralCodeFromCookie = () => {
          const cookie = document.cookie.split('; ').find(row => row.startsWith('referral='));
          return cookie ? cookie.split('=')[1] : null;
        };
        const referralCode = getReferralCodeFromCookie()
        console.log(referralCode, "code", typeof (referralCode))
        
        //** SAVE REFERAL CODE IN DATABASE  */
        const currentDate = new Date();
        const formattedDateTime = currentDate.toISOString().replace("T", " ").split(".")[0];
       
        if (referralCode) {
          console.log("Save in database/firebase")
          const newDocRef = ref(db, `/referrals/${referralCode}/${user.uid}`);
          console.log(newDocRef, typeof (newDocRef), "referrals");
          get(newDocRef).then((snapshot) => {
            if (!snapshot.exists()) {
              set(newDocRef, {
                signupDate: formattedDateTime,
                amount: 0,
              }).then(() => {

              })
            }
          })
        }

        toast.success("User logged in Successfully", { position: "top-center" });

        const subscriptionRef = ref(db, `user/${user.uid}/Payment/SubscriptionType`);
        const subscriptionSnapshot = await get(subscriptionRef);
        const subscriptionType = subscriptionSnapshot.val();
        localStorage.setItem("SubscriptionType", subscriptionType);

        const apiRef1 = ref(db, `user/${user.uid}/API/apiKey`);
        const apiRef2 = ref(db, `user/${user.uid}/API/apikey`);
        const apiSnapshot1 = await get(apiRef1);
        const apiSnapshot2 = await get(apiRef2);

        let apiKey = "";
        if (apiSnapshot1.exists()) {
          apiKey = apiSnapshot1.val();
        } else {
          apiKey = apiSnapshot2.val();
        }

        localStorage.setItem("api_key", apiKey);

        if (apiKey) {
          if (subscriptionType === "FreeTrialStarted" || subscriptionType === "Premium") {
            window.location.href = "/";
          } else {
            window.location.href = "/resume2";
          }
        } else {
          window.location.href = "/gemini";
        }
      } else {
        toast.error("Email is not verified. Please verify your email and try again!", { position: "bottom-center" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login error";
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Welcome Back <span className="text-3xl">👋</span>
          </h1>
          <p className="mt-2 text-base text-gray-600 leading-relaxed">
            Today is a new day. It&apos;s your day. You shape it.<br />
            Register to shape your carrier and get hired in your dream jobs.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Example@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#F9FAFB] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Field with Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  // Dynamic type based on state
                  type={showPassword ? "text" : "password"} 
                  placeholder="at least 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end">
            <Link 
              href="/passwordreset" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
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

          {/* Sign Up Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t you have an account?{" "}
            <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;
