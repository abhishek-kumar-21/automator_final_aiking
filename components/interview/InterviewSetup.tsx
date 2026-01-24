import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { hasGeminiApiKey, setGeminiApiKey, validateApiKey } from "@/lib/gemini-utils";
import type { SessionType } from "@/app/interview/interview_dashboard/page";

interface InterviewSetupProps {
  onStart: (role: string, skillLevel: string, jobDescription: string) => void;
  session: SessionType | null;
  actualTitle?: string;
  jd?: string;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, session, actualTitle, jd }) => {
  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [customRole, setCustomRole] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>("Intermediate");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("");
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(!hasGeminiApiKey());
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    if (actualTitle) {
      const predefinedRoles = ["Software Engineer", "Product Manager", "Data Scientist", "Designer"];
      const matchedRole = predefinedRoles.find(role =>
        role.toLowerCase().includes(actualTitle.toLowerCase()) ||
        actualTitle.toLowerCase().includes(role.toLowerCase())
      );

      if (matchedRole) {
        setSelectedRole(matchedRole);
        setCustomRole("");
      } else {
        setSelectedRole("Other");
        setCustomRole(actualTitle);
      }
    } else if (session?.role) {
      setSelectedRole(session.role);
    }

    if (session?.skillLevel) {
      setSkillLevel(session.skillLevel);
    }
  }, [actualTitle, session]);

  useEffect(() => {
    if (jd && jd.trim()) {
      setJobDescription(jd);
    } else if (session?.jobDescription && !jd) {
      setJobDescription(session.jobDescription);
    }
  }, [jd, session?.jobDescription]);

  useEffect(() => {
    setNeedsApiKey(!hasGeminiApiKey());
  }, []);

  const handleStart = async () => {
    if (needsApiKey && geminiApiKey.trim()) {
      setIsValidating(true);
      const isValid = await validateApiKey(geminiApiKey.trim());
      setIsValidating(false);

      if (!isValid) return;

      const success = setGeminiApiKey(geminiApiKey.trim());
      if (success) {
        setNeedsApiKey(false);
        toast({ title: "API Key Saved", description: "Key saved for this session." });
      } else {
        toast({ title: "Error", description: "Failed to save API key.", variant: "destructive" });
        return;
      }
    } else if (needsApiKey) {
      toast({ title: "API Key Required", variant: "destructive" });
      return;
    }

    const role = selectedRole === "Other" ? customRole : selectedRole;
    if (!role.trim()) {
      toast({ title: "Role Required", variant: "destructive" });
      return;
    }

    onStart(role, skillLevel, jobDescription);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative w-full mx-auto px-4 py-8 md:py-12">
        {/* Updated decorative blurs to soft blue/indigo */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 blur-[180px] opacity-10 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 blur-[180px] opacity-10 rounded-full pointer-events-none"></div>

        <h2 className="text-2xl md:text-3xl font-bold font-raleway text-slate-900 mb-8">Interview Setup</h2>

        <div className="space-y-8 relative bg-white border border-slate-200 shadow-sm rounded-xl p-6 md:p-8">
          <div>
            <Label className="text-lg font-semibold font-raleway text-slate-800 mb-3 block">Target Role</Label>
            {actualTitle && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium">
                ✨ Auto-detected: <span className="font-bold">{actualTitle}</span>
              </div>
            )}
            <Input
              id="role"
              type="text"
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-12 bg-white border-slate-200 text-slate-900 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-3"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <Label className="text-lg font-semibold font-raleway text-slate-800 mb-3 block">Experience Level</Label>
            <Input
              id="skill-level"
              type="text"
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full h-12 bg-white border-slate-200 text-slate-900 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-3"
              placeholder="e.g. Intermediate (3-5 years)"
            />
          </div>

          <div>
            <Label htmlFor="job-description" className="text-lg font-semibold font-raleway text-slate-800 mb-3 block">
              Job Description
            </Label>
            {jd && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium">
                📄 Job description auto-loaded
              </div>
            )}
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-[150px] resize-none w-full bg-white border-slate-200 text-slate-700 font-inter rounded-lg"
            />
          </div>

          {needsApiKey && (
            <div className="border-t border-slate-100 pt-6">
              <Label htmlFor="gemini-api-key" className="text-lg font-semibold font-raleway text-slate-800 mb-3 block">
                Gemini API Key
              </Label>
              <div className="text-sm font-inter text-slate-500 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p>Required for AI questions and feedback.</p>
                <p className="mt-1">Get a key from <a href="https://ai.google.dev" target="_blank" className="text-blue-600 font-bold hover:underline">Google AI Studio</a>.</p>
              </div>
              <Input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKeyState(e.target.value)}
                placeholder="Paste API key here..."
                className="w-full h-12 bg-white border-slate-200 text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleStart}
              disabled={(selectedRole === "Other" && !customRole.trim()) || isValidating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-lg text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {isValidating ? "Validating..." : "Start Interview"}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;