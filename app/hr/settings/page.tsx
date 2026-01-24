/** @format */
"use client";
import React, { useState } from "react";
import { auth } from "@/firebase/config";
import DeleteAccountModal from "../../../components/DeleteAccountModal";
import { FiKey, FiTrash2, FiLogOut, FiChevronRight } from "react-icons/fi";

const Settings = function () {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Data-driven approach for cleaner code and easier updates ---
    const menuItems = [
        {
            label: "Update Gemini Key",
            description: "Manage your API key for Gemini services.",
            action: () => (window.location.href = "/hr/updateGemini"),
            icon: <FiKey className="w-6 h-6 text-blue-600" />,
            isDestructive: false,
        },
        {
            label: "Logout",
            description: "Sign out of your current session.",
            action: handleLogout,
            icon: <FiLogOut className="w-6 h-6 text-gray-500" />,
            isDestructive: false,
        },
        {
            label: "Delete Account",
            description: "Permanently erase your account and data.",
            action: () => setIsModalOpen(true),
            icon: <FiTrash2 className="w-6 h-6 text-red-600" />,
            isDestructive: true,
        },
    ];

    function notifyExtensionOnLogout() {
        try {
            const event = new CustomEvent("onLogout", { detail: { status: "logged out" } });
            document.dispatchEvent(event);
            return true;
        } catch (error) {
            console.error("Error dispatching logout event:", error);
            return false;
        }
    }

    async function handleLogout() {
        try {
            await auth.signOut();
            localStorage.clear();
            notifyExtensionOnLogout();
            // --- Reduced delay for a more responsive feel ---
            setTimeout(() => {
                window.location.href = "/hr/login";
            }, 500);
        } catch (error) {
            console.error("Error logging out:", error.message);
            // Consider adding a user-facing error notification here
        }
    }

    return (
        // Changed bg to white/gray gradient
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-12 text-gray-900">
            {/* Card updated to white bg with gray border and shadow */}
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Settings
                    </h1>
                    <p className="text-gray-500">Manage your account and preferences.</p>
                </div>
                <div className="space-y-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={item.action}
                            // --- Conditional styling for visual hierarchy (standard vs. destructive) ---
                            className={`group flex items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                                item.isDestructive
                                    ? "bg-red-50 hover:bg-red-100 border border-red-200"
                                    : "bg-gray-50 hover:bg-white border border-transparent hover:border-blue-500 hover:shadow-md"
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                {/* --- Icon styling for better visual grouping --- */}
                                <div className={`p-2 rounded-full ${item.isDestructive ? "bg-red-100" : "bg-white border border-gray-200"}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <span className={`font-semibold text-lg ${item.isDestructive ? "text-red-600" : "text-gray-900"}`}>
                                        {item.label}
                                    </span>
                                    {/* --- Added description for clarity --- */}
                                    <p className="text-gray-500 text-sm">{item.description}</p>
                                </div>
                            </div>
                            {/* --- Universal navigation cue with hover micro-interaction --- */}
                            <FiChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                    ))}
                </div>
                {isModalOpen && <DeleteAccountModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
};

export default Settings;
