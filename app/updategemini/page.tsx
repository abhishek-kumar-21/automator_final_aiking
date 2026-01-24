"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, update } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ExternalLink, Loader2 } from 'lucide-react';

const GeminiPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [geminiKey, setGeminiKey] = useState<string>("");
  const db = getDatabase(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User signed in:", currentUser);
      } else {
        toast.error("You need to be signed in to upload your Gemini key!");
        window.location.href = "/sign-in";
      }
    });

    return () => unsubscribe();
  }, []);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) {
      toast.error("User not authenticated!");
      setLoading(false);
      return;
    }

    const userId = auth.currentUser.uid;
    const userRef = ref(db, `user/${userId}`);

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = "Write a story about an AI and magic";

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;

      if (response) {
        toast.success("API Key Submitted Successfully");
        localStorage.setItem("api_key", geminiKey);

        function notifyExtensionOnUpdateGeminiKey(key: string): void {
          const event = new CustomEvent<{ key: string }>("geminiKeyUpdated", { detail: { key } });
          document.dispatchEvent(event);
        }
        notifyExtensionOnUpdateGeminiKey(geminiKey);

        await Promise.all([
          update(userRef, { API: { apikey: geminiKey } }).catch((err) =>
            console.error("Error updating API key:", err)
          )
        ]);
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)

      }
    } catch (error) {
      toast.error("Invalid API key!");
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed background to white/gray
    <main className="flex items-center justify-center min-h-screen bg-white p-6">
      <div className="relative w-full max-w-lg">
        
        {/* Main card - White background with clean shadow/border */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Activate Gemini API ⚡
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your API key to unlock powerful AI features at minimal cost.
            </p>
          </div>

          {/* Video Player - Clean styling */}
          <div className="relative mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/1iO6bBOdbew?si=XhwmMjRZXko35VxG"
              title="YouTube video player"
              allowFullScreen
            ></iframe>
          </div>

          {/* Form Section */}
          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label htmlFor="geminiKey" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Gemini API Key
              </label>
              <input
                id="geminiKey"
                type="text"
                placeholder="Enter Your Gemini Key"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-start">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <span>Don&apos;t have a key? Get it here</span>
                <ExternalLink className="ml-1 w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <span>Submit Key</span>
              )}
            </button>
          </form>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Secure Connection</span>
            <span>•</span>
            <span>Encrypted Storage</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GeminiPage;
