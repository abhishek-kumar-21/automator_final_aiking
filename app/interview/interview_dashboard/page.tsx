"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewSession from "@/components/interview/InterviewSession";
import { InterviewFeedback } from "@/components/interview/InterviewFeedback";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSessionId } from "@/lib/session-utils";
import { useToast } from "@/components/ui/use-toast";
import { saveSession, storeRecording } from "@/lib/db-service";
import { getDatabase, ref, get } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";

export type SessionType = {
  sessionId: string;
  role?: string;
  skillLevel?: string;
  jobDescription?: string;
  recordings?: string[];
  transcript?: { question: string; answer: string }[];
  feedback?: {
    strengths: string[];
    improvements: string[];
    overallScore?: number;
    transcript?: { question: string; answer: string }[];
    recordings?: string[];
  };
  isCompleted?: boolean;
};

let isThrottled = false;

const Interview = () => {
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [session, setSession] = useState<SessionType | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [showWarningBanner, setShowWarningBanner] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [title, setTitle] = useState<string>("");
  const [actualTitle, setActualTitle] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [jd, setJD] = useState<string>("");
  const [hrUid, setHruid] = useState<string>("");
  const router = useRouter();
  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let hrUid = localStorage.getItem("hr_code") || "";
        setHruid(hrUid);
        setUid(user.uid);
      } else {
        toast({
          title: "Authentication Error",
          description: "No user is signed in. Please log in.",
          variant: "destructive",
        });
        router.push("/sign-in");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let title = localStorage.getItem("title") || "";
    setActualTitle(title);
    title = title.replace(/\s/g, "");
    setTitle(title);
    if (!session) {
      setSession({
        sessionId: createSessionId(),
        transcript: [],
        recordings: [],
      });
    }
  }, []);

  useEffect(() => {
    let getJob = async function (hrUID: any) {
      let low_title = title.toLowerCase();
      const jobProfileRef = ref(db, `hr/${hrUid}/jobProfiles/${low_title}`);
      let snapsort = await get(jobProfileRef);
      if (snapsort.exists()) {
        let jobDescription = snapsort.val().jdText;
        setJD(jobDescription);
      }
    };
    if (hrUid) {
      getJob(hrUid);
    }
  }, [title, hrUid]);

  useEffect(() => {
    if (activeTab === "session" && !stream) {
      const startVideo = async () => {
        try {
          let mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(mediaStream);
        } catch (err) {
          try {
            const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            setStream(videoOnlyStream);
            toast({
              title: "Audio Warning",
              description: "Could not access microphone. Continuing with video only.",
              variant: "warning",
            });
          } catch (videoErr) {
            toast({
              title: "Webcam Error",
              description: "Could not access your webcam.",
              variant: "destructive",
            });
          }
        }
      };
      startVideo();
    }
  }, [activeTab, toast]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [stream]);

  useEffect(() => {
    if (activeTab === "session") {
      const handleFocusLoss = () => {
        if (isThrottled) return;
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, 1000);

        const newCount = warningCount + 1;
        setWarningCount(newCount);
        setShowWarningBanner(true);

        toast({
          title: "Focus Lost",
          description: `Please stay on the tab. Warning ${newCount}/3.`,
          variant: newCount < 3 ? "warning" : "destructive",
        });

        if (newCount >= 3 && session && !session.isCompleted) {
          completeInterview({
            strengths: [],
            improvements: ["Switched tabs multiple times"],
            overallScore: 0,
          });
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") handleFocusLoss();
      };
      const handleBlur = () => handleFocusLoss();

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
      };
    }
  }, [activeTab, session, warningCount, toast]);

  const startInterview = (role: string, skillLevel: string, jobDescription: string) => {
    if (session) {
      setSession({
        ...session,
        role,
        skillLevel,
        jobDescription,
        isCompleted: false,
        recordings: [],
      });
      setActiveTab("session");

      if (confirm("Would you like to enter fullscreen mode?")) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen();
      }

      setWarningCount(0);
      toast({
        title: "Interview Started",
        description: `Starting ${skillLevel} level interview for ${role} role`,
      });

      saveSession({
        sessionId: session.sessionId,
        role,
        skillLevel,
        jobDescription,
        transcript: [],
        recordings: [],
        isCompleted: false,
      }).catch((err) => console.error("Error saving initial session:", err));
    }
  };

  const completeInterview = async (feedback: SessionType["feedback"]) => {
    if (session) {
      setIsProcessing(true);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }

        let storedRecordings: string[] = session.recordings || [];
        // ... (Recording logic remains same)

        const updatedSession = { ...session, feedback, recordings: storedRecordings, isCompleted: true };
        setSession(updatedSession);
        setShowWarningBanner(false);

        await saveSession({ ...updatedSession, isCompleted: true });

        setActiveTab("feedback");
        toast({ title: "Interview Completed", description: "Feedback is ready." });
      } catch (error) {
        console.error("Error completing interview:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F8FAFC] text-[#334155] font-inter overflow-x-hidden">
      {/* Updated Decorative background blurs to light Blue */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-blue-400 opacity-10 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[550px] w-[550px] rounded-full bg-blue-600 opacity-10 blur-3xl"
      />

      {/* Header - Light Theme */}
      <header className="w-full py-4 px-4 sm:px-6 md:px-8 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/interview")}
              className="bg-transparent text-blue-600 font-raleway font-semibold text-base px-4 py-2 rounded-md transition duration-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold font-raleway text-slate-900">
              InterviewFlow
            </h1>
          </div>

          {activeTab === "session" && (
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-red-500 rounded-full animate-ping mr-2" />
                  <span className="text-sm text-red-600 font-medium">Recording</span>
                </div>
              ) : (
                <span className="text-sm text-slate-500">Not Recording</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {showWarningBanner && activeTab === "session" && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-center font-medium shadow-sm">
            Warning: You have switched tabs or lost focus. Please stay on this tab.
          </div>
        )}

        {isProcessing && (
          <div className="mb-6 p-4 border-l-4 border-blue-600 bg-blue-50 rounded-md text-center animate-pulse">
            <p className="text-blue-700 font-medium">Processing your interview data...</p>
          </div>
        )}

        <Card className="border border-slate-200 bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-2">
                {[
                  { label: "Setup", value: "setup", disabled: activeTab === "session" && isRecording },
                  {
                    label: "Interview",
                    value: "session",
                    disabled: !session?.role || (activeTab === "session" && isRecording),
                  },
                  { label: "Feedback", value: "feedback", disabled: !session?.isCompleted },
                ].map(({ label, value, disabled }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    disabled={disabled}
                    className="relative px-4 py-2 font-raleway font-semibold text-slate-600 rounded-md transition-all duration-200 hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="setup" className="p-6 sm:p-8 text-white">
                <InterviewSetup
                  onStart={startInterview}
                  session={session}
                  actualTitle={actualTitle}
                  jd={jd}
                />
              </TabsContent>

              <TabsContent value="session" className="p-0">
                <InterviewSession
                  session={session}
                  setSession={setSession}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onComplete={completeInterview}
                  stream={stream}
                />
              </TabsContent>

              <TabsContent value="feedback" className="p-6 sm:p-8 text-slate-900">
                <InterviewFeedback session={session} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Interview;