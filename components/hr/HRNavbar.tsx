/** @format */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import defaultProfileImage from "../../public/images/profile.jpeg";
import { FaUser, FaCog, FaCrown, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import type { User } from "firebase/auth";
import type { StaticImageData } from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | StaticImageData>(defaultProfileImage);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // State for Tools Dropdown
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const loginStatus = localStorage.getItem("IsLoginAsHR");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UIDforHR");
      if (userId) {
        const findUser = ref(db, `hr/${userId}`);
        get(findUser)
          .then((snapshot) => {
            let Name = snapshot.val()?.name;
            let fname = snapshot.val()?.fname;
            let lname = snapshot.val()?.lname;
            let photoURL = snapshot.val()?.profilePhoto;
            let premium = snapshot.val()?.Payment?.Status;
            let user = "";

            if (Name) {
              user = Name;
              setFullName(user);
            } else {
              user = fname + " " + lname;
              setFullName(user);
            }

            if (premium === "Premium") {
              setIsPremium(true);
            } else {
              setIsPremium(false);
            }

            if (
              photoURL &&
              typeof photoURL === "string" &&
              photoURL.startsWith("https://")
            ) {
              setProfilePhoto(photoURL);
            } else {
              setProfilePhoto(defaultProfileImage);
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setProfilePhoto(defaultProfileImage);
          });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsToolsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);

  const handleSettings = async () => {
    try {
      window.location.href = "/hr/settings";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Colors
  const primaryBlue = "bg-[#1d4ed8]"; 
  const primaryBlueHover = "hover:bg-[#1e40af]";

  return (
    <nav 
      className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 flex items-center z-[100] px-6 sm:px-10 py-2" 
      style={{ minHeight: "70px" }}
    >
      {/* 1. Logo Section */}
      <div className="flex-shrink-0 cursor-pointer py-1">
        <Link href="/hr">
          <Image
            src="/images/updated-logo.png"
            alt="JobForm Automator"
            width={240}
            height={70}
            className="h-10 sm:h-14 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* 2. Desktop Navigation + Buttons */}
      <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
        
        {/* Navigation Links */}
        <ul className="flex items-center space-x-8 text-[16px]">
          <li>
            <Link 
                href="/hr" 
                className={`font-medium transition-colors ${isActive("/hr") ? "text-black font-bold" : "text-gray-600 hover:text-black"}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
                href="/hr/aboutUs" 
                className={`font-medium transition-colors ${isActive("/hr/aboutUs") ? "text-black font-bold" : "text-gray-600 hover:text-black"}`}
            >
              About us
            </Link>
          </li>

          {/* Tools Dropdown */}
          <li 
            className="relative group h-full flex items-center"
            onMouseEnter={() => setIsToolsOpen(true)}
            onMouseLeave={() => setIsToolsOpen(false)}
          >
            <button className={`flex items-center gap-1 font-medium transition-colors ${isToolsOpen ? "text-black" : "text-gray-600 hover:text-black"}`}>
              Tools <FaChevronDown size={12} className={`transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`} />
            </button>
            
            {/* Dropdown Content */}
            <div 
              className={`absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-56 transition-all duration-200 ${
                isToolsOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
              }`}
            >
                <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                    <Link href="/hr/resumeUpload" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Shortlist Resumes
                    </Link>
                    <Link href="/hr/outreach" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Automated Outreach
                    </Link>
                </div>
            </div>
          </li>

          <li>
            <Link 
                href="/hr/pricing" 
                className={`font-medium transition-colors ${isActive("/hr/pricing") ? "text-black font-bold" : "text-gray-600 hover:text-black"}`}
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link 
                href="/hr/policy" 
                className={`font-medium transition-colors ${isActive("/hr/policy") ? "text-black font-bold" : "text-gray-600 hover:text-black"}`}
            >
              Privacy & Policy
            </Link>
          </li>
        </ul>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <button className={`${primaryBlue} text-white px-5 py-2.5 rounded-full font-medium text-sm transition shadow-sm ${primaryBlueHover}`}>
              Switch to candidate
            </button>
          </Link>

          {!isLogin ? (
            <>
              <Link href="/hr/login">
                <button className="bg-white text-black border-2 border-[#1d4ed8] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-50 transition">
                  Sign in
                </button>
              </Link>
              <Link href="/hr/signUp">
                <button className={`${primaryBlue} text-white px-6 py-2.5 rounded-full font-medium text-sm transition shadow-sm ${primaryBlueHover}`}>
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            /* Logged In User Profile */
            <div className="relative ml-2">
              <div 
                className="relative cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={toggleProfileMenu}
              >
                <Image
                  src={profilePhoto}
                  alt="Profile"
                  width={44}
                  height={44}
                  className={`rounded-full object-cover ${
                    isPremium ? "border-2 border-yellow-400" : "border border-gray-200"
                  }`}
                  style={{ width: '44px', height: '44px' }}
                />
                 {isPremium && (
                  <FaCrown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-500 bg-white rounded-full p-0.5 shadow-sm" />
                )}
              </div>
              
              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute top-14 right-0 bg-white border border-gray-100 rounded-xl shadow-xl py-2 w-52 z-50">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{fullName || "HR User"}</p>
                  </div>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/hr/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" /> Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleSettings();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
                      >
                        <FaCog className="mr-3 text-gray-400" /> Settings
                      </button>
                    </li>
                  </ul>
                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <button 
                        onClick={async () => {
                            await auth.signOut();
                            window.location.href = "/hr/login";
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Toggle */}
      <div className="lg:hidden ml-auto">
        <button
          onClick={toggleMenu}
          className="text-gray-800 focus:outline-none p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
             <div className="w-36">
                <Image 
                    src="/images/updated-logo.png"
                    alt="Logo" 
                    width={140} 
                    height={50} 
                    className="object-contain" 
                />
             </div>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-black transition-colors">
              <FaTimes size={24} />
            </button>
          </div>

          <ul className="space-y-2 flex-1">
            <li>
                <Link href="/hr" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-lg ${isActive("/hr") ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                    Home
                </Link>
            </li>
            <li>
                <Link href="/hr/aboutUs" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-lg ${isActive("/hr/aboutUs") ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                    About us
                </Link>
            </li>
            
            {/* Mobile Tools Dropdown Simpler View */}
            <li className="px-4 py-2 bg-gray-50 rounded-xl my-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Tools</p>
                <Link href="/hr/resumeUpload" onClick={() => setIsMenuOpen(false)} className="block py-2 text-base text-gray-700 font-medium hover:text-blue-600">
                    Shortlist Resumes
                </Link>
                <Link href="/hr/outreach" onClick={() => setIsMenuOpen(false)} className="block py-2 text-base text-gray-700 font-medium hover:text-blue-600">
                    Automated Outreach
                </Link>
            </li>

            <li>
                <Link href="/hr/pricing" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-lg ${isActive("/hr/pricing") ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                    Pricing
                </Link>
            </li>
            <li>
                <Link href="/hr/policy" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-lg ${isActive("/hr/policy") ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                    Privacy & Policy
                </Link>
            </li>
          </ul>

          <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
             <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold mb-3 hover:bg-blue-800 transition-colors shadow-sm">
                  Switch to candidate
                </button>
             </Link>

            {!isLogin ? (
                <div className="flex flex-col gap-3">
                    <Link href="/hr/login" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        Sign In
                        </button>
                    </Link>
                    <Link href="/hr/signUp" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-colors">
                        Sign Up
                        </button>
                    </Link>
                </div>
            ) : (
                 <Link href="/hr/profile" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                        <Image src={profilePhoto} alt="Profile" width={48} height={48} className="rounded-full" />
                        <div className="ml-3">
                            <p className="font-bold text-gray-900 text-lg">{fullName || "HR User"}</p>
                            <p className="text-sm text-blue-600 font-medium">View Profile</p>
                        </div>
                    </div>
                </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
