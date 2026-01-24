"use client";

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile, signOut } from "firebase/auth";
import React, { useState } from "react";
import { toast } from "react-toastify";
import app from "@/firebase/config";
import { getDatabase, ref, set } from "firebase/database";
import axios from "axios";
import Link from 'next/link';
import SignInwithGoogle from "../loginwithGoogle/SignInWithGoogle";
// Import icons for password toggle
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    
    // New state for toggling password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const auth = getAuth();
        const displayName = `${fname} ${lname}`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                await updateProfile(user, { displayName });
                await sendEmailVerification(user);

                const db = getDatabase(app);
                const newDocRef = ref(db, "hr/" + user.uid);

                await set(newDocRef, { fname, lname, email }); 

                toast.success("Registered! Check your email for verification.", { position: "top-center" });

                await axios.post("https://us-central1-jobform-automator-website.cloudfunctions.net/welcomeEmailHR/send-email", {
                    email: email,
                    name: displayName || "User",
                });

                await signOut(auth);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errorMessage, { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-4 sm:p-6">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sign Up
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Achieve career success with Job Form Automator! Start auto-applying now!
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name Inputs */}
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">First Name</label>
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                onChange={(e) => setFname(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Last Name</label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                onChange={(e) => setLname(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                                emailError 
                                ? "border-red-500 focus:ring-red-500" 
                                : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                            }`}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(""); 
                            }}
                            required
                            disabled={loading}
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1 ml-1">{emailError}</p>
                        )}
                    </div>

                    {/* Password Input with Eye Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} // Dynamic type
                                placeholder="Create a password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12" // Added pr-12 to prevent text overlap
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold p-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                             <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing up...</span>
                             </div>
                        ) : (
                            "Sign up"
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
                        <SignInwithGoogle />
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-8">
                    Already registered?{" "}
                    <Link
                        href="/hr/login"
                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default Register;