"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, getDatabase, update } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { pdfjs } from "react-pdf";
import { toast } from "react-toastify";
import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from "firebase/storage";
import { storage } from "@/firebase/config";
import app from "@/firebase/config";
import { FaCloudUploadAlt, FaTrashAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"; // Added Icons

pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.js`;

const Resume: React.FC = () => {
  const [pdf, setPdf] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [Currentctc, setCurrentctc] = useState<string>("");
  const [Expectedctc, setExpectedctc] = useState<string>("");
  const [NoticePeriod, setNoticePeriod] = useState<string>("");
  const [Resume, setResume] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [Location, setLocation] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const auth = getAuth();
  const db = getDatabase(app);

  // Ensure the user is authenticated before proceeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("User signed in:", currentUser); // Debugging user data
      } else {
        setUser(null);
        console.log("No user signed in");
        toast.error("You need to be signed in to upload your resume.");
        window.location.href = "/sign-in"
      }
    });

    return () => unsubscribe();
  }, []);

  console.log("User before uploading resume:", user);

  useEffect(() => {
    if (downloadUrl && pdfText && submitButtonRef.current) {
      submitButtonRef.current.click();
    }
  }, [downloadUrl, pdfText]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    setPdfName(file.name);
    setPdf(file);

    const pdfStorageRef = storageRef(storage, `Resume/${file.name}`);

    try {
      await uploadBytes(pdfStorageRef, file);
      const url = await getDownloadURL(pdfStorageRef);
      setDownloadUrl(url);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
        const pdfDocument = await pdfjs.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => (item as { str: string }).str) //possibility of error
            .join(" ");
          fullText += pageText + "\n";
        }

        setPdfText(fullText);
        setResume(file.name);
        setIsLoading(false);
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("User before submitting:", user); // Debugging user data before submission
    function notifyExtensionOnResumeSubmit(urdData: unknown) {
      const event = new CustomEvent('resumeUpdated', {
        detail: {
          urd: urdData,
        }
      });
      document.dispatchEvent(event);
    }

    if (!pdfName) {
      toast.error("Please Provide Your Resume Before Submitting!");
      return;
    }
    if (!downloadUrl || !pdfText) {
      toast.warning(
        "Your Resume is still being processed. Please wait a moment and try again."
      );
      return;
    }
    if (!user) {
      toast.error("User is not authenticated. Please sign in again.");
      return;
    }

    const uid = user.uid;
    const userRef = ref(db, `user/${uid}`);
    const urdData = `${pdfText} currentCtc ${Currentctc}; ExpectedCtc ${Expectedctc}; NoticePeriod ${NoticePeriod}; Location ${Location}`;

    try {
      await update(userRef, {
        forms: {
          keyvalues: {
            RD: downloadUrl,
            URD: urdData,
          },
        },
      });

      toast.success("Document updated successfully!");
      notifyExtensionOnResumeSubmit(urdData)
      // ---candidates_marketing_data ---
      try {
        // Regex for email and phone
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(?:\+\d{1,3}[\s-]?)?(?:\(\d{1,4}\)[\s-]?)?(?:\d[\s-]?){7,15}\d/g;
        let foundEmail = user?.email || "";
        let foundPhone = (pdfText.match(phoneRegex) || [])[0] || "";
        // Clean up phone (remove spaces/dashes)
        foundPhone = foundPhone.replace(/\D/g, "");
        // Clean up email for Firebase key
        const safeEmail = foundEmail.replace(/\./g, ",");
        if (foundEmail) {
          const marketingDataRef = ref(db, `candidates_marketing_data/${safeEmail}`);
          await update(marketingDataRef, {
            name: user?.displayName,
            email: foundEmail,
            contact: foundPhone,
            isDownloaded: false,
          });
        }
      } catch (err) {
        console.error("Failed to extract/save marketing data:", err);
      }
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)

    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting."
      );
    }
  };

  const handleRemovePdf = () => {
    setPdf(null);
    setPdfName("");
    setDownloadUrl("");
    setPdfText("");
    setResume("");
  };

  return (
    // Changed bg to white/gray and increased vertical padding
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10 sm:py-18">
      <div className="flex flex-col md:flex-row items-start justify-center mx-auto gap-12 w-full max-w-6xl">

        {/* Left Illustration */}
        <div className="hidden md:block md:w-5/12 sticky top-24">
          <img
            src="images/lastStepAvtar.png"
            alt="Illustration"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1d4ed8]"></div>
                <p className="mt-4 text-[#1d4ed8] font-medium text-lg">
                Processing resume...
                </p>
            </div>
          </div>
        )}

        {/* Main Form Card - White Theme */}
        <div className="w-full md:w-7/12 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Update Your Details
            </h2>
            <p className="text-gray-500">
                Help us find the best opportunities for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Current CTC */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current CTC
                </label>
                <input
                    type="text"
                    placeholder="e.g. 8 LPA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                    onChange={(e) => setCurrentctc(e.target.value)}
                />
                </div>

                {/* Expected CTC */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected CTC
                </label>
                <input
                    type="text"
                    placeholder="e.g. 12 LPA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                    onChange={(e) => setExpectedctc(e.target.value)}
                />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Notice Period */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notice Period (Days)
                </label>
                <input
                    type="text"
                    placeholder="e.g. 30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                    onChange={(e) => setNoticePeriod(e.target.value)}
                />
                </div>

                {/* Location */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Location
                </label>
                <input
                    type="text"
                    placeholder="e.g. Bangalore, Remote"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    required
                    onChange={(e) => setLocation(e.target.value)}
                />
                </div>
            </div>

            <hr className="border-gray-100 my-6" />

            {/* Upload Resume Section */}
            <div>
                <label htmlFor="file-upload" className="block w-full cursor-pointer group">
                    <span className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload Your Resume
                    </span>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-300 group-hover:border-[#1d4ed8] group-hover:bg-blue-50">
                        <input
                            type="file"
                            id="file-upload"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center">
                            <div className="p-4 bg-blue-100 text-[#1d4ed8] rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <FaCloudUploadAlt size={32} />
                            </div>
                            <p className="text-gray-900 font-medium group-hover:text-[#1d4ed8]">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 mt-1">PDF format only (Max 5MB)</p>
                        </div>
                    </div>
                </label>
            </div>

            {/* Selected File State */}
            {pdfName ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-green-800 font-medium text-sm truncate max-w-[200px] sm:max-w-xs">{pdfName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove file"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ) : (
                // Optional: Error state if needed, currently just empty or hidden
                null
            )}

            <button
              ref={submitButtonRef}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
                  isLoading 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-[#1d4ed8] text-white hover:bg-[#1e40af] hover:shadow-blue-500/30"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit Application"}
            </button>

            {/* Hidden PDF Preview for Logic */}
            {pdf && (
              <div className="hidden">
                  <iframe
                    src={URL.createObjectURL(pdf)}
                    width="100%"
                    height="500px"
                    title="PDF Viewer"
                  />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Resume;
