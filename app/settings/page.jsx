/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { auth } from "@/firebase/config";
import { getDatabase, ref, get } from "firebase/database";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { FiKey, FiUser, FiTrash2, FiLogOut, FiChevronRight } from "react-icons/fi";

const Settings = function () {
    const user = auth.currentUser;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            try {
                const db = getDatabase();
                const adminsRef = ref(db, "admins");
                const snapshot = await get(adminsRef);
                if (snapshot.exists()) {
                    const adminsData = snapshot.val();
                    // adminsData is an object with keys as IDs and values as admin objects
                    const isAdminUser = Object.values(adminsData).some(
                        (admin) => admin.email === user.email
                    );
                    setIsAdmin(isAdminUser);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, [user]);

    const menuItems = [
        {
            label: "Update Gemini Key",
            description: "Manage your API key for Gemini.",
            action: () => window.location.href = "/updategemini",
            icon: <FiKey className="w-6 h-6 text-blue-600" />,
            isDestructive: false,
        },
        {
            label: "Update Data",
            description: "Modify your resume and personal information.",
            action: () => window.location.href = "/updateresume",
            icon: <FiUser className="w-6 h-6 text-blue-600" />,
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
            description: "Permanently erase your account and all data.",
            action: () => setIsModalOpen(true),
            icon: <FiTrash2 className="w-6 h-6 text-red-600" />,
            isDestructive: true,
        },
    ];

    if (isAdmin) {
        menuItems.unshift({
            label: "Go to admin block",
            description: "Access the admin dashboard.",
            action: () => window.location.href = "/Admin",
            icon: <FiUser className="w-6 h-6 text-yellow-500" />,
            isDestructive: false,
        });
    }

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
            setTimeout(() => {
                window.location.href = "/sign-in";
            }, 500); // Reduced delay for a snappier feel
        } catch (error) {
            console.error("Error logging out:", error.message);
            // Optionally, show a toast notification for the error
        }
    }

    return (
        // Changed bg to white/gray gradient
        <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 text-gray-900">
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
                            className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer group ${
                                item.isDestructive
                                    ? "bg-red-50 hover:bg-red-100 border border-red-200"
                                    : "bg-gray-50 hover:bg-white border border-transparent hover:border-blue-500 hover:shadow-md"
                            }`}
                            onClick={item.action}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${item.isDestructive ? "bg-red-100" : "bg-white border border-gray-200"}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <span className={`font-semibold text-lg ${item.isDestructive ? "text-red-600" : "text-gray-900"}`}>{item.label}</span>
                                    <p className="text-gray-500 text-sm">{item.description}</p>
                                </div>
                            </div>
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
