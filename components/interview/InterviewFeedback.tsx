import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Star, Download, Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SessionType {
  feedback: {
    strengths: string[];
    improvements: string[];
    overallScore: number;
    transcript?: {
      question: string;
      answer: string;
    }[];
    recording?: string[];
  };
  transcripts?: {
    question: string;
    answer: string;
  }[];
  recordings?: string[];
  role?: string;
}

interface InterviewFeedbackProps {
  session: SessionType | null;
}

export const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const { toast } = useToast();

  if (!session || !session.feedback) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 font-inter">
          No feedback available. Please complete an interview session first.
        </p>
      </div>
    );
  }

  const feedback = {
    strengths: session.feedback.strengths || [],
    improvements: session.feedback.improvements || [],
    overallScore: session.feedback.overallScore || 0,
    transcript: session.feedback.transcript || session.transcripts || [],
    recording: session.recordings?.[0] || session.feedback.recording?.[0],
  };

  const { strengths, improvements, overallScore, transcript, recording } = feedback;

  const downloadTranscript = () => {
    if (!transcript) return;
    const transcriptText = transcript.map((item, index) => `Q${index + 1}: ${item.question}\n\nA: ${item.answer}\n\n`).join("---\n\n");
    const feedbackText = `\nINTERVIEW FEEDBACK\n=================\n\nOverall Score: ${overallScore}/10\n\nStrengths:\n${strengths.map((s) => `- ${s}`).join("\n")}\n\nAreas for Improvement:\n${improvements.map((i) => `- ${i}`).join("\n")}\n`;
    const fullText = `INTERVIEW TRANSCRIPT\n===================\n\n${transcriptText}\n\n${feedbackText}`;

    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-feedback-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadVideo = async () => {
    if (!recording) return;
    try {
      toast({ title: "Starting Download", description: "Preparing your video file..." });
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(recording)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Download failed`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-recording.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast({ title: "Download Error", variant: "destructive" });
    }
  };

  return (
    <div className="relative bg-slate-50/50 p-1">
      {/* Light Theme Background Blurs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 blur-[180px] opacity-10 rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 blur-[180px] opacity-10 rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold font-raleway text-slate-900">Interview Feedback</h2>
        <Button
          variant="outline"
          className="flex items-center border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          onClick={downloadTranscript}
        >
          <Download className="h-4 w-4 mr-2" />
          Save Transcript
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-1">
              <span className="text-4xl font-bold font-raleway text-blue-600">{overallScore}</span>
              <span className="text-xl text-slate-400 font-inter mb-1">/10</span>
            </div>
            <Progress value={overallScore * 10} className="h-2 mt-4 bg-slate-100" />
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-raleway text-slate-900">{transcript?.length / 2 || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Target Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-raleway text-slate-900 truncate">
              {session.role || "General Interview"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
        <TabsList className="w-full grid grid-cols-3 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <TabsTrigger
            value="summary"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-600 font-semibold"
          >
            Feedback Summary
          </TabsTrigger>
          <TabsTrigger
            value="transcript"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-600 font-semibold"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger
            value="recording"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-600 font-semibold"
          >
            Recording
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-blue-50/50 border-blue-100 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700 font-bold font-raleway">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-blue-600" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50/50 border-indigo-100 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-700 font-bold font-raleway">
                  <Star className="h-5 w-5 mr-2 text-indigo-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      </div>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="pt-6">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              {transcript && transcript.length > 0 ? (
                <div className="space-y-8">
                  {transcript.map((item, index) => (
                    <div key={index} className="pb-8 border-b border-slate-100 last:border-0">
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">Question {index + 1}</span>
                        <p className="text-lg font-bold text-slate-900 mt-2">{item.question}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Response</span>
                        <p className="mt-2 text-slate-700 leading-relaxed font-inter italic">
                          "{item.answer || "No response provided"}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-12">No transcript available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="pt-6">
          <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              {recording ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Interview Recording</h3>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                      onClick={downloadVideo}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download MP4
                    </Button>
                  </div>
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                    <video src={recording} controls className="w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Video className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No recording saved for this session</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewFeedback;