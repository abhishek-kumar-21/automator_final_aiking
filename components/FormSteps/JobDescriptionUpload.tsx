"use client";
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { FormStep } from '@/types/index';
import { ArrowLeft, PlusCircle, X, ArrowRight, Sparkles, Loader2, Copy } from 'lucide-react';
import Analyzing from '@/components/FormSteps/Analyzing';
import { getAuth } from 'firebase/auth';
import { fetchGeminiApiKey, fetchSkillsDataFromFirebase, fetchUserResumeData } from '@/services/firebaseService';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';

type AIJobDescription = {
  jobTitle: string;
  responsibilities: string;
  requiredSkills: string;
  qualifications: string;
};

const JobDescriptionUpload = () => {
  const { state, addJobDescription, removeJobDescription, setFormStep, analyzeData, setResume } = useAppContext();
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string>("");
  const [resumeText, setResumeText] = useState(state.resume?.text || '');
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiJobRole, setAiJobRole] = useState('');
  const [aiCompanyName, setAiCompanyName] = useState('');
  const [aiExperienceLevel, setAiExperienceLevel] = useState('Mid-Level');
  const [isFetchingJD, setIsFetchingJD] = useState(false);
  const [isProcessingJDs, setIsProcessingJDs] = useState(false);
  const [aiJobType, setAiJobType] = useState('Fresher');
  const auth = getAuth();

  const [allAIJobDescriptions, setAllAIJobDescriptions] = useState<AIJobDescription[]>([]);
  const [aiJobDescriptions, setAiJobDescriptions] = useState<AIJobDescription[]>([]);
  const [showAISelectPopup, setShowAISelectPopup] = useState(false);
  const [expandedAIJDIndex, setExpandedAIJDIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUid(currentUser.uid);
      } else {
        toast.error("You need to be signed in to access this page!");
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [auth]);

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

  useEffect(() => {
    const getURD = async (uid: string) => {
      setError('');
      try {
        const urd = await fetchUserResumeData(uid);
        if (urd) {
          setSuccess((prevSuccess) => [...prevSuccess, "Resume data loaded successfully!"]);
          setResumeText(urd);
          setResume(urd);
        } else {
          setError('No resume data found in your profile.');
        }
      } catch (error) {
        console.error('Error fetching URD:', error);
        setError('Failed to load resume. Please try again or paste manually.');
        setTimeout(() => {
          // window.location.href = "/resume2";
          window.location.href = "/dashboard/resume2";
        }, 2000);
      }
    };
    if (uid) {
      getURD(uid);
    }
  }, [uid, setResume]);

  useEffect(() => {
    const fetchApiKey = async (uid: string) => {
      try {
        const key = await fetchGeminiApiKey(uid);
        if (key) {
          setApiKey(key);
          setSuccess((prevSuccess) => [...prevSuccess, "API key loaded successfully!"]);
        } else {
          toast.error("Please Provide Your API key");
          setError('No API key found in your profile.');
          setTimeout(() => {
            window.location.href = "/gemini";
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching Gemini API key:', error);
        setError('Failed to fetch API key. You can still enter it manually.');
        const localKey = localStorage.getItem("api_key") || "";
        setApiKey(localKey);
      }
    };
    if (uid) {
      fetchApiKey(uid);
    }
  }, [uid]);

  const handleAddJob = useCallback(() => {
    if (!jobText.trim()) {
      setError('Please paste a job description');
      toast.error('Please paste a job description');
      return false;
    }

    try {
      addJobDescription(jobText, jobTitle, jobCompany);
      setJobText('');
      setJobTitle('');
      setJobCompany('');
      setError('');
      return true;
    } catch (error) {
      setError('Failed to add job description');
      toast.error('Failed to add job description');
      return false;
    }
  }, [jobText, jobTitle, jobCompany, addJobDescription]);

  const handleSubmit = useCallback(async () => {
    if (state.jobDescriptions.length < 5) {
      setError('Please add at least 5 job descriptions');
      return;
    }

    if (apiKey.trim()) {
      localStorage.setItem('api_key', apiKey.trim());
    }

    setIsLoading(true);
    try {
      setFormStep(FormStep.ANALYZING);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timed out after 30 seconds')), 30000)
      );

      await Promise.race([analyzeData(), timeoutPromise]);
      setFormStep(FormStep.RESULTS);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('handleSubmit: Error during analysis:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      let errorMessage = errorObj.message || 'Failed to generate video data';

      if (errorObj.message.includes('429')) {
        errorMessage = 'YouTube API quota exceeded. Please try again later or upgrade your plan.';
        toast.error(errorMessage);
        setTimeout(() => { window.location.href = '/upgrade'; }, 3000);
      } else if (errorObj.message.includes('403') || errorObj.message.includes('invalid')) {
        errorMessage = 'Invalid YouTube API key. Please check your API key.';
        toast.error(errorMessage);
        setTimeout(() => { window.location.href = '/youtube-api'; }, 3000);
      } else {
        toast.error(errorMessage);
      }

      setError(errorMessage);
      setFormStep(FormStep.JOB_DESCRIPTIONS);
      setIsProcessingJDs(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, state.jobDescriptions, analyzeData, setFormStep]);

  const handleClick = () => {
    window.open("https://youtu.be/FeRTK3aHdIk", "_blank");
  };

  const handleFetchAIJD = async () => {
    if (!aiJobRole.trim()) {
      setError('Please enter a job role');
      return;
    }

    setIsFetchingJD(true);
    setError('');

    try {
      const storedApiKey = localStorage.getItem("api_key");
      if (!storedApiKey) {
        setError("Gemini API key not found. Please add it first.");
        setIsFetchingJD(false);
        return;
      }

      const response = await fetch("/api/job-descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: aiJobRole,
          jobType: aiJobType,
          experienceLevel: aiExperienceLevel,
          apikey: storedApiKey,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      let cleaned = data.response.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed: AIJobDescription[] = JSON.parse(cleaned);

      const validJDs = parsed.filter((jd) => jd && typeof jd.jobTitle === "string");

      if (validJDs.length < 5) throw new Error(`Only ${validJDs.length} valid job descriptions found`);

      setAllAIJobDescriptions(validJDs);
      setAiJobDescriptions(validJDs);
      setShowAISelectPopup(true);
      setShowAIPopup(false);
      toast.success("AI job descriptions fetched. Click 'AI JDs' to review.");
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job descriptions');
    } finally {
      setIsFetchingJD(false);
    }
  };

  const handleSelectAIJD = (jd: AIJobDescription) => {
    const fullText = `Job Title: ${jd.jobTitle}\nResponsibilities: ${jd.responsibilities}\nRequired Skills: ${jd.requiredSkills}\nQualifications: ${jd.qualifications}`;
    addJobDescription(fullText, jd.jobTitle, aiCompanyName || "");
    setAiJobDescriptions((prev) => prev.filter((item) => item !== jd));
  };

  const copyAIJDToClipboard = (jd: AIJobDescription) => {
    const text = `Job Title: ${jd.jobTitle}\nResponsibilities: ${jd.responsibilities}\nRequired Skills: ${jd.requiredSkills}\nQualifications: ${jd.qualifications}`;
    navigator.clipboard.writeText(text);
    toast.success("Job description copied!");
  };

  if (state.formStep === FormStep.ANALYZING || isProcessingJDs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="mt-4 text-xl font-raleway font-medium text-gray-900">
            {isProcessingJDs ? 'Adding Job Descriptions...' : 'Analyzing Job Descriptions...'}
          </h2>
          <p className="mt-2 text-gray-600 font-inter">
            {isProcessingJDs ? 'Please wait while we process your job descriptions.' : 'Please wait while we analyze your job descriptions.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full max-w-4xl mx-auto animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden relative">
          <div className="px-6 py-8 relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-raleway font-bold text-gray-900">🎯 Discover Exactly What You Need to Learn</h2>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow hover:bg-blue-700 transition ml-4"
              >
                ⭐ Buy Premium
              </button>
            </div>
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-gray-700 font-inter mb-2">
                Add job descriptions <span className="text-blue-600 font-semibold">(5 Job Descriptions Recommended)</span>
              </p>
              <p className="text-gray-600 font-inter mb-2">By adding job descriptions, you’ll get:</p>
              <ul className="text-gray-600 font-inter space-y-2 list-disc list-inside">
                <li>Personalized skill roadmap</li>
                <li>Learning videos for each required skill</li>
              </ul>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-inter hover:bg-blue-700 transition flex items-center justify-center"
                onClick={handleClick}
              >
                🎬 Watch Demo
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-raleway font-semibold text-gray-900 mb-2 block">Job Title (Optional)</label>
                    <Input
                      placeholder="e.g. Frontend Developer"
                      className="w-full text-base font-inter text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-raleway font-semibold text-gray-900 mb-2 block">Company (Optional)</label>
                    <Input
                      placeholder="e.g. Acme Inc."
                      className="w-full text-base font-inter text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-raleway font-semibold text-gray-900 mb-2 block">Job Description*</label>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px] w-full text-base font-inter text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    value={jobText}
                    onChange={(e) => { setJobText(e.target.value); setError(''); }}
                  />
                </div>

                <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
                  <Button
                    onClick={() => setShowAIPopup(true)}
                    className="w-full sm:w-[200px] bg-blue-700 text-white font-raleway font-semibold px-6 py-3 rounded-md hover:bg-blue-800 transition flex items-center justify-center"
                    disabled={isProcessingJDs}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Get Auto-JD</span>
                  </Button>

                  {allAIJobDescriptions.length > 0 && (
                    <Button
                      onClick={() => setShowAISelectPopup(true)}
                      className="w-full sm:w-[200px] bg-white border border-blue-600 text-blue-600 font-raleway font-semibold px-6 py-3 rounded-md hover:bg-blue-50 transition flex items-center justify-center"
                    >
                      🤖 AI JDs ({aiJobDescriptions.length})
                    </Button>
                  )}

                  <Button
                    onClick={handleAddJob}
                    className="w-full sm:w-[200px] bg-blue-600 text-white font-raleway font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                    disabled={isProcessingJDs}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Add ({state.jobDescriptions.length}/5)</span>
                  </Button>
                </div>

                {error && <p className="text-red-500 text-sm font-inter mt-2">{error}</p>}
              </div>

              {state.jobDescriptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-raleway font-semibold text-gray-900 mb-4">Added Job Descriptions:</h3>
                  <div className="space-y-4">
                    {state.jobDescriptions.map((job) => (
                      <div key={job.id} className="border border-gray-200 bg-gray-50 rounded-lg p-5 flex justify-between items-start">
                        <div>
                          <h4 className="font-raleway font-bold text-gray-900 text-base">
                            {job.title || 'Untitled Position'}
                            {job.company && ` at ${job.company}`}
                          </h4>
                          <p className="text-sm text-gray-600 font-inter line-clamp-2 mt-2">{job.text}</p>
                        </div>
                        <Button
                          className="text-red-500 font-inter text-sm h-10 px-3 hover:bg-red-50"
                          onClick={() => removeJobDescription(job.id)}
                          disabled={isProcessingJDs}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-100 px-6 py-6 flex justify-between">
            <Button
              className="bg-transparent text-blue-600 border border-blue-600 font-raleway font-semibold text-base px-6 py-3 rounded-md hover:bg-blue-50 transition"
              onClick={() => setFormStep(FormStep.RESUME)}
              disabled={isProcessingJDs}
            >
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              onClick={handleSubmit}
              disabled={state.jobDescriptions.length < 5 || state.isAnalyzing || isLoading || isProcessingJDs}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4 inline" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showAIPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl relative shadow-2xl border border-gray-200">
            <Button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAIPopup(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-raleway font-bold text-gray-900 mb-6">Generate Job Description with AI</h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Role and Subject*</label>
                <Input
                  placeholder="e.g. Node.js Developer, JavaScript"
                  className="w-full text-gray-900 border-gray-300"
                  value={aiJobRole}
                  onChange={(e) => { setAiJobRole(e.target.value); setError(''); }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Company Name (Optional)</label>
                <Input
                  placeholder="e.g. Acme Inc."
                  className="w-full text-gray-900 border-gray-300"
                  value={aiCompanyName}
                  onChange={(e) => setAiCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Experience Level*</label>
                <Select value={aiExperienceLevel} onValueChange={setAiExperienceLevel}>
                  <SelectTrigger className="w-full border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Job Type*</label>
                <Select value={aiJobType} onValueChange={setAiJobType}>
                  <SelectTrigger className="w-full border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Fresher">Fresher</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleFetchAIJD}
                className="w-full bg-blue-600 text-white font-bold py-3 hover:bg-blue-700 flex items-center justify-center"
                disabled={isFetchingJD}
              >
                {isFetchingJD ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Job Descriptions
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAISelectPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Select Job Descriptions</h3>
              <Button className="text-gray-400 hover:text-gray-600" onClick={() => setShowAISelectPopup(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {aiJobDescriptions.map((jd, index) => {
                const isExpanded = expandedAIJDIndex === index;
                return (
                  <div key={`ai-jd-${index}`} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer ${isExpanded ? "border-b border-gray-200" : ""}`}
                      onClick={() => setExpandedAIJDIndex(isExpanded ? null : index)}
                    >
                      <span className="text-gray-900 font-bold">{jd.jobTitle}</span>
                      <Button
                        className="bg-blue-600 text-white h-8 px-4 text-sm"
                        onClick={(e) => { e.stopPropagation(); handleSelectAIJD(jd); }}
                      >
                        Add
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="p-4 space-y-4 text-sm text-gray-700">
                        <div>
                          <h4 className="text-gray-900 font-bold text-xs uppercase mb-1">Responsibilities</h4>
                          <pre className="whitespace-pre-wrap font-inter">{jd.responsibilities}</pre>
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-bold text-xs uppercase mb-1">Required Skills</h4>
                          <pre className="whitespace-pre-wrap font-inter">{jd.requiredSkills}</pre>
                        </div>
                        <Button
                          className="bg-blue-700 text-white h-9 px-5 text-sm flex gap-2"
                          onClick={() => copyAIJDToClipboard(jd)}
                        >
                          <Copy className="h-4 w-4" /> Copy Job Description
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              {aiJobDescriptions.length === 0 && <p className="text-gray-500 text-center mt-8">All job descriptions have been added.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionUpload;