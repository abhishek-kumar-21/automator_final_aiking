// Welcome.tsx
"use client";
import { Button } from '@/components/ui/buttoncourse';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { FileText, Briefcase, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { fetchSkillsDataFromFirebase } from '@/services/firebaseService';

const Welcome = () => {
  const { setFormStep } = useAppContext();
  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUid(currentUser?.uid);
      } else {
        toast.error("You need to be signed in to access this page!");
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      fetchSkillsDataFromFirebase(uid)
        .then((skillsData) => {
          if (
            skillsData &&
            Object.keys(skillsData).length > 0 &&
            skillsData.learningPath?.[0]?.skills?.[0]?.videos?.length > 0
          ) {
            setTimeout(() => {
              // window.location.href = "/course/dashboard";
              window.location.href = "/dashboard/course/learning";
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Error fetching skills data:", error);
        });
    }
  }, [uid]);

  const handleOnclick = () => {
    setLoading(true);
    setFormStep(FormStep.RESUME);
    setTimeout(() => {
      // router.push('/course/resumeUpload');
      router.push('/dashboard/course/resumeUpload');
    }, 2000);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden relative">
          {/* Subtle light-theme gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
          
          <div className="bg-blue-600 text-white text-center py-12 relative">
            <h2 className="text-3xl font-raleway font-bold text-white">Welcome to Resume to Roadmap</h2>
            <p className="text-blue-50 text-lg mt-2 font-inter">Transform your resume into a personalized learning path</p>
          </div>

          <div className="pt-10 px-6 sm:px-8 pb-10">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-raleway font-semibold text-slate-900 mb-2">Upload Your Resume</h3>
                <p className="text-slate-600 text-sm font-inter">We'll analyze your current skills and experience</p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                  <Briefcase className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-raleway font-semibold text-slate-900 mb-2">Add Job Descriptions</h3>
                <p className="text-slate-600 text-sm font-inter">Tell us about the roles you're aiming for</p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-raleway font-semibold text-slate-900 mb-2">Get Your Roadmap</h3>
                <p className="text-slate-600 text-sm font-inter">Receive a personalized learning path to achieve your goals</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 flex justify-center border-t border-slate-100">
            <button
              className={`bg-blue-600 text-white font-raleway font-bold text-base px-8 py-3 rounded-lg shadow-md transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 flex items-center justify-center`}
              onClick={handleOnclick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-sm font-inter">
          <p>Your data is securely processed and not shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;