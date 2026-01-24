/** @format */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import defaultProfileImage from "@/public/images/profile.jpeg";
import { FaUser, FaEnvelope, FaCrown, FaSave, FaTimes, FaUpload, FaCamera } from "react-icons/fa";

const CandidateProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(null);
  const [fullName, setFullName] = useState("Unknown User");
  const [email, setEmail] = useState("No email available");
  const [isPremium, setIsPremium] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(defaultProfileImage);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const db = getDatabase(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error("Auth state error:", err);
      setError("Failed to load authentication state.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const loginStatus = localStorage.getItem("IsLogin");
      setIsLogin(loginStatus);

      const userId = localStorage.getItem("UID");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const findUser = dbRef(db, `user/${userId}`);
        const snapshot = await get(findUser);
        if (!snapshot.exists()) {
          setError("User data not found in database.");
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        let userName = data?.name || (data?.fname && data?.lname ? `${data.fname} ${data.lname}` : "Unknown User");
        let userEmail = data?.email || "No email available";
        let premium = data?.Payment?.Status || "Free";
        let photoURL = data?.profilePhoto || "";

        setFullName(userName);
        setEmail(userEmail);
        setIsPremium(premium === "Premium");

        if (photoURL && typeof photoURL === "string" && photoURL.startsWith("https://")) {
          setProfilePhoto(photoURL);
          setImageError(false);
        } else {
          setProfilePhoto(defaultProfileImage);
          setImageError(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF).");
      setFile(null);
      e.target.value = null; // Clear input
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      setFile(null);
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("UID");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    if (!file) {
      alert("Please select an image to upload.");
      return;
    }

    setUploadLoading(true);
    try {
      // Upload to Firebase Storage
      const fileRef = storageRef(storage, `user_profile_photos/${userId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // Update Realtime Database
      const userRef = dbRef(db, `user/${userId}`);
      await update(userRef, { profilePhoto: downloadURL });

      // Update local state
      setProfilePhoto(downloadURL);
      setImageError(false);
      setFile(null);
      alert("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Failed to update profile photo. Please try again.");
      setImageError(true);
      setProfilePhoto(defaultProfileImage);
    } finally {
      window.location.href = "/profile";
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4ed8]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-12 px-6 sm:px-12">
        <Link href="/" className="absolute top-6 right-6">
          <FaTimes className="w-6 h-6 text-gray-400 hover:text-gray-900 transition-colors duration-200" />
        </Link>
        <p className="text-red-600 bg-red-50 px-6 py-4 rounded-lg border border-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 pt-24">
      {/* Close Button */}
      <Link href="/" className="absolute top-24 right-6 sm:right-10 z-10">
        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
           <FaTimes className="w-5 h-5 text-gray-500" />
        </div>
      </Link>

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            {/* UPDATED: Added prominent blue ring-4 */}
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full p-1 bg-white ring-4 ring-#1d4ed8/20 shadow-lg">
                <Image
                src={imageError ? defaultProfileImage : profilePhoto}
                alt="Candidate Profile"
                fill
                className="rounded-full object-cover"
                onError={() => {
                    setImageError(true);
                    setProfilePhoto(defaultProfileImage);
                }}
                />
            </div>
            {isPremium && (
              <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                 <FaCrown className="w-6 h-6 text-yellow-400" />
              </div>
            )}
          </div>
          
          <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
            {fullName}
          </h1>
          <p className="text-sm text-gray-500 font-medium">{email}</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-6 sm:p-8">
                {/* Removed the FaUser from the header since it's now in the input */}
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                   Profile Details
                </h2>

                <div className="grid gap-6">
                    {/* Full Name Input with Icon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                value={fullName}
                                disabled
                                // Added pl-12 for icon space
                                className="block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm pl-12 pr-4 py-3 cursor-not-allowed border"
                            />
                        </div>
                    </div>

                    {/* Email Input with Icon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                disabled
                                // Added pl-12 for icon space
                                className="block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm pl-12 pr-4 py-3 cursor-not-allowed border"
                            />
                        </div>
                    </div>

                    {/* File Upload with Icon in Label */}
                    <div>
                        {/* Added FaUpload back to the label */}
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <FaUpload className="text-[#1d4ed8]" /> Update Profile Photo
                        </label>
                        <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-6 hover:bg-gray-50 transition-colors">
                            <div className="text-center w-full">
                                <FaCamera className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-[#1d4ed8] focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                    >
                                        <span>Upload a file</span>
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            className="sr-only"
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB</p>
                                {file && (
                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                        <FaUpload size={10} /> {file.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Status Section */}
            <div className="bg-gray-50 px-6 py-6 sm:px-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isPremium ? "bg-yellow-100" : "bg-gray-200"}`}>
                        <FaCrown className={`w-5 h-5 ${isPremium ? "text-yellow-600" : "text-gray-500"}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            {isPremium ? "Premium Membership Active" : "Free Membership"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isPremium ? "Enjoy all exclusive features." : "Upgrade to unlock more features."}
                        </p>
                    </div>
                </div>
                
                {!isPremium && (
                    <Link href="/pricing" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-white text-[#1d4ed8] border border-[#1d4ed8] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm">
                            Upgrade to Premium
                        </button>
                    </Link>
                )}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
            <button
                onClick={handleSave}
                disabled={uploadLoading || !file}
                className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium shadow-sm transition-all duration-200 ${
                    uploadLoading || !file
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-[#1d4ed8] text-white hover:bg-[#1e40af] hover:shadow-md transform hover:-translate-y-0.5"
                }`}
            >
                {uploadLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <FaSave className="w-4 h-4" />
                )}
                <span>{uploadLoading ? "Uploading..." : "Save Changes"}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default CandidateProfilePage;