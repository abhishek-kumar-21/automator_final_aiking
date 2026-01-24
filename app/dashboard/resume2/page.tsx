"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, getDatabase, update, get } from "firebase/database";
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

  // Logic remains untouched
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        toast.error("You need to be signed in to upload your resume.");
        window.location.href = "/sign-in";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (downloadUrl && pdfText && submitButtonRef.current) {
      submitButtonRef.current.click();
    }
  }, [downloadUrl, pdfText]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            .map((item) => (item as { str: string }).str)
            .join(" ");
          fullText += pageText + "\n";
        }
        setPdfText(fullText);
        setResume(file.name);
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
    function notifyExtensionOnResumeSubmit(urdData: unknown) {
      const event = new CustomEvent('resumeSubmitted', {
        detail: { urdData: urdData, subscriptionType: "FreeTrialStarted" }
      });
      document.dispatchEvent(event);
    }

    if (!pdfName) {
      toast.error("Please Provide Your Resume Before Submitting!");
      return;
    }
    if (!downloadUrl || !pdfText) {
      toast.warning("Your Resume is still being processed. Please wait.");
      return;
    }
    if (!user) {
      toast.error("User is not authenticated.");
      return;
    }

    const uid = user.uid;
    const userRef = ref(db, `user/${uid}`);
    const urdData = `${pdfText} currentCtc ${Currentctc}; ExpectedCtc ${Expectedctc}; NoticePeriod ${NoticePeriod}; Location ${Location}`;

    try {
      await update(userRef, {
        forms: { keyvalues: { RD: downloadUrl, URD: urdData } },
      });

      toast.success("Document uploaded successfully!");
      notifyExtensionOnResumeSubmit(urdData);
      localStorage.setItem("SubscriptionType", "FreeTrialStarted");

      const getSubscription = ref(db, `user/${uid}/Payment`);
      await update(getSubscription, { SubscriptionType: "FreeTrialStarted" });

      const marketingRef = ref(db, `marketing_email/${uid}`);
      get(marketingRef).then((snapshot) => {
        if (snapshot.exists()) return update(marketingRef, { status: "Free" });
      });

      try {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(?:\+\d{1,3}[\s-]?)?(?:\(\d{1,4}\)[\s-]?)?(?:\d[\s-]?){7,15}\d/g;
        let foundEmail = user?.email || "";
        let foundPhone = (pdfText.match(phoneRegex) || [])[0] || "";
        foundPhone = foundPhone.replace(/\D/g, "");
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
        console.error("Marketing data error:", err);
      }

      setTimeout(() => { window.location.href = "/dashboard/course/jobdescription" }, 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred.");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center mx-auto">
        
        {/* Loading Overlay Updated for Light Theme */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="spinner border-t-4 border-blue-600 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-gray-900 text-lg font-medium">
              Processing your resume... Please wait.
            </p>
          </div>
        )}

        <div className="w-full p-8 rounded-xl shadow-xl bg-white border border-gray-200">
          <h2 className="text-3xl font-raleway font-bold mb-8 text-center text-black">
            Last Step
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Current CTC in your local currency?
              </label>
              <input
                type="text"
                placeholder="e.g. 12,00,000"
                className="border border-gray-300 w-full px-4 py-2.5 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
                required
                onChange={(e) => setCurrentctc(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Expected CTC in your local currency?
              </label>
              <input
                type="text"
                placeholder="e.g. 15,00,000"
                className="border border-gray-300 w-full px-4 py-2.5 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
                required
                onChange={(e) => setExpectedctc(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                What is your notice period in days?
              </label>
              <input
                type="text"
                placeholder="e.g. 30"
                className="border border-gray-300 w-full px-4 py-2.5 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
                required
                onChange={(e) => setNoticePeriod(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Your preferred location in the job?
              </label>
              <input
                type="text"
                placeholder="e.g. New York, Remote"
                className="border border-gray-300 w-full px-4 py-2.5 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-all"
                required
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Upload Resume Section */}
            <div className="pt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-black text-lg font-raleway font-bold block mb-3">
                  Upload Your Resume
                </span>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <img
                    src="/images/file.png"
                    alt="Upload icon"
                    className="w-12 h-12 mx-auto mb-3 opacity-70"
                  />
                  <p className="text-sm font-medium text-gray-600">Click to browse or drag and drop PDF</p>
                </div>
              </label>
            </div>

            {pdfName ? (
              <div className="flex items-center justify-between bg-blue-50 text-blue-800 px-4 py-3 rounded-lg border border-blue-100">
                <span className="font-medium truncate mr-2">{pdfName}</span>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="text-red-600 hover:text-red-800 font-bold text-sm underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-center text-red-500 text-sm font-medium">No file selected</p>
            )}

            <button
              ref={submitButtonRef}
              type="submit"
              className="w-full font-raleway font-bold bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transform transition duration-200 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
              disabled={isLoading}
            >
              Complete Submission
            </button>

            {pdf && (
              <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden shadow-inner">
                <iframe
                  src={URL.createObjectURL(pdf)}
                  width="100%"
                  height="400px"
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