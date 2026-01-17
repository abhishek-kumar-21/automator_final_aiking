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
import image from "../public/images/profile.jpeg";
import { FaUser, FaCog, FaCrown, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(image);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const loginStatus = localStorage.getItem("IsLogin");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UID");
      if (userId) {
        const findUser = ref(db, `user/${userId}`);
        get(findUser)
          .then((snapshot) => {
            let Name = snapshot.val()?.name;
            let fname = snapshot.val()?.fname;
            let lname = snapshot.val()?.lname;
            let email = snapshot.val()?.email;
            let premium = snapshot.val()?.Payment?.Status;
            let photoURL = snapshot.val()?.profilePhoto;
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
              setProfilePhoto(image);
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setProfilePhoto(image);
          });
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);

  // Colors
  const primaryBlue = "bg-[#1d4ed8]";
  const primaryBlueHover = "hover:bg-[#1e40af]";

  return (
    <nav 
      className="fixed top-0 left-0 w-full bg-white border-b border-gray-100 flex items-center z-50 px-6 sm:px-10 py-2" 
      style={{ minHeight: "70px" }} // Increased min-height slightly for larger logo
    >
      
      {/* 1. Logo Section (Increased Size) */}
      <div className="flex-shrink-0 cursor-pointer py-1">
        <Link href="/">
          <Image
            src="/images/updated-logo.png"
            alt="JobForm Automator"
            width={240} // Increased width prop
            height={70} // Increased height prop
            // h-10 (mobile) -> h-14 (desktop) ensures logo is significantly larger
            className="h-10 sm:h-14 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* 2. Desktop Navigation + Buttons */}
      <div className="hidden lg:flex items-center space-x-12">
        
        {/* Navigation Links with "No Jitter" Fix */}
        <ul className="flex items-center space-x-10 text-[16px]">
          {[
            { label: "Home", path: "/" },
            { label: "About us", path: "/about" },
            { label: "Referral", path: "/referral" },
          ].map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                // Grid layout allows stacking text on top of each other
                className="grid items-center justify-items-center group"
              >
                {/* Layer 1: Invisible Bold Text (Reserves width) */}
                <span className="font-bold opacity-0 col-start-1 row-start-1 select-none pointer-events-none" aria-hidden="true">
                  {item.label}
                </span>
                
                {/* Layer 2: Visible Text (Changes weight on hover) */}
                <span 
                  className={`col-start-1 row-start-1 transition-colors duration-200 ${
                    isActive(item.path)
                      ? "font-bold text-black"
                      : "font-medium text-gray-700 group-hover:text-black group-hover:font-bold"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/hr">
            <button className={`${primaryBlue} text-white px-6 py-2.5 rounded-full font-medium text-sm transition shadow-sm ${primaryBlueHover}`}>
              Switch to recruiter
            </button>
          </Link>

          {!isLogin ? (
            <>
              <Link href="/sign-in">
                <button className="bg-white text-black border-2 border-[#1d4ed8] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-50 transition">
                  Sign in
                </button>
              </Link>
              <Link href="/sign-up">
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
                    <p className="text-sm font-bold text-gray-900 truncate">{fullName || "User"}</p>
                  </div>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaUser className="mr-3 text-gray-400" /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FaCog className="mr-3 text-gray-400" /> Settings
                      </Link>
                    </li>
                  </ul>
                  <div className="border-t border-gray-50 mt-2 pt-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium">
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
          {isMenuOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
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
            {[
              { label: "Home", path: "/" },
              { label: "About us", path: "/about" },
              { label: "Referral", path: "/referral" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-4 py-3 rounded-xl text-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black hover:font-bold"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
             <Link href="/hr" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-gray-100 text-gray-800 py-3.5 rounded-xl font-bold mb-3 hover:bg-gray-200 transition-colors">
                  Switch to recruiter
                </button>
             </Link>

            {!isLogin ? (
                <div className="flex flex-col gap-3">
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full border-2 border-[#1d4ed8] text-[#1d4ed8] py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                        Sign In
                        </button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full bg-[#1d4ed8] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-colors">
                        Sign Up
                        </button>
                    </Link>
                </div>
            ) : (
                 <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <Image src={profilePhoto} alt="Profile" width={48} height={48} className="rounded-full" />
                        <div className="ml-3">
                            <p className="font-bold text-gray-900 text-lg">{fullName}</p>
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