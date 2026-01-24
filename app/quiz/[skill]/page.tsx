"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Timer, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { toPng } from "html-to-image";
import Certificate from "@/components/Certificate";
import { usePersonalDataStore } from "@/app/store";
import fillResumeData from "@/components/oneclick/page";

/* ================= TYPES ================= */

type Question = {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
};

type PageState = "instructions" | "quiz" | "result";

/* ================= CONSTANTS ================= */

const TOTAL_QUESTIONS = 30;
const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes
const PASS_MARKS = 21; // Set to 21 based on UI instructions logic

function normalizeCorrectAnswer(
    correctAnswer: string,
    options: string[]
): string | null {
    if (!correctAnswer || !Array.isArray(options) || options.length !== 4) {
        return null;
    }

    const trimmed = correctAnswer.trim();

    if (options.includes(trimmed)) {
        return trimmed;
    }

    const letterMap: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
    };

    const upper = trimmed.toUpperCase();
    if (letterMap[upper] !== undefined) {
        return options[letterMap[upper]];
    }

    const match = upper.match(/\b[A-D]\b/);
    if (match && letterMap[match[0]] !== undefined) {
        return options[letterMap[match[0]]];
    }

    return null;
}

function validateAndFixQuestions(rawQuestions: any[]): Question[] {
    return rawQuestions
        .map((q: any, index: number) => {
            if (
                typeof q?.question !== "string" ||
                !Array.isArray(q?.options) ||
                q.options.length !== 4
            ) {
                return null;
            }

            const fixedCorrectAnswer = normalizeCorrectAnswer(
                q.correctAnswer,
                q.options
            );

            if (!fixedCorrectAnswer) {
                return null;
            }

            return {
                id: index + 1,
                question: q.question,
                options: q.options,
                correctAnswer: fixedCorrectAnswer,
            };
        })
        .filter(Boolean) as Question[];
}

/* ================= PAGE ================= */

export default function SkillQuizPage() {
    const params = useParams();
    const skill = decodeURIComponent(params.skill as string);
    const { personalData } = usePersonalDataStore();

    /* ---------- STATE ---------- */

    const [pageState, setPageState] = useState<PageState>("instructions");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [username, setUsername] = useState("");

    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
    const [timeTaken, setTimeTaken] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const certRef = useRef<HTMLDivElement>(null);

    /* ---------- GEMINI ---------- */

    const apiKey =
        typeof window !== "undefined" ? localStorage.getItem("api_key") : null;

    const geminiClient = useMemo(() => {
        if (!apiKey) return null;
        try {
            return new GoogleGenerativeAI(apiKey);
        } catch {
            return null;
        }
    }, [apiKey]);

    const prettify = (str?: string) => {
        if (!str) return "";
        return str
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    useEffect(() => {
        const storedResume = localStorage.getItem("resumeData");

        if (storedResume) {
            try {
                const parsedResume = JSON.parse(storedResume);
                fillResumeData(parsedResume);
                return;
            } catch (err) {
                console.error("Invalid resumeData in localStorage", err);
            }
        }

        const email = localStorage.getItem("email");
        const nameFromEmail = email?.split("@")[0]?.trim();

        const name =
            localStorage.getItem("UserName") ||
            localStorage.getItem("name") ||
            nameFromEmail ||
            "Unknown User";

        setUsername(prettify(name));

    }, []);

    /* ================= TIMER ================= */

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    /* ================= QUIZ GENERATION ================= */

    const startQuiz = async () => {
        if (!geminiClient) {
            toast.error("Gemini API key missing");
            return;
        }

        setIsLoading(true);
        setAnswers({});
        setQuestions([]);
        setTimeLeft(TOTAL_TIME_SECONDS);
        setScore(0);

        try {
            const prompt = `
                Generate EXACTLY 30 multiple-choice questions for "${skill}".

                Rules:
                - Medium to hard difficulty
                - 4 options
                - One correct answer
                - No explanation
                - Return ONLY valid JSON

                {
                    "questions": [
                        {
                            "id": 1,
                            "question": "string",
                            "options": ["A", "B", "C", "D"],
                            "correctAnswer": "A"
                        }
                    ]
                }
            `.trim();

            const model = geminiClient.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
            });

            const res = await model.generateContent(prompt);

            const parts =
                res?.response?.candidates?.[0]?.content?.parts || [];

            const text = parts
                .map((p: any) => p.text || "")
                .join("")
                .trim();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in Gemini response");
            }

            const parsed = JSON.parse(jsonMatch[0]);

            if (!Array.isArray(parsed.questions)) {
                throw new Error("Questions array missing");
            }

            const fixedQuestions = validateAndFixQuestions(parsed.questions || []);

            if (fixedQuestions.length < TOTAL_QUESTIONS) {
                throw new Error(
                    `Only ${fixedQuestions.length} valid questions generated`
                );
            }

            setQuestions(fixedQuestions.slice(0, TOTAL_QUESTIONS));
            setPageState("quiz");
            startTimer();

        } catch (e) {
            console.error("QUIZ GENERATION ERROR:", e);
            toast.error("Failed to generate quiz");
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = (auto = false) => {
        stopTimer();

        let s = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) s++;
        });

        setScore(s);
        setTimeTaken(TOTAL_TIME_SECONDS - timeLeft);
        setPageState("result");

        if (auto) toast.info("Time up! Quiz auto-submitted.");
    };

    /* ================= RETAKE ================= */

    const retakeQuiz = () => {
        stopTimer();
        setPageState("instructions");
    };

    /* ================= HELPERS ================= */

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const downloadCertificate = async () => {
        if (!certRef.current) return;

        try {
            const dataUrl = await toPng(certRef.current, {
                cacheBust: true,
                pixelRatio: 2,
            });

            const link = document.createElement("a");
            link.download = `Certificate-${skill}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate certificate");
        }
    };

    /* ================= UI ================= */

    return (
        <div className="min-h-[80vh] bg-slate-50 p-6 flex items-center justify-center text-black">
            {isLoading && (
                <Card
                    className="relative w-full max-w-md mx-auto p-5 sm:p-6 lg:p-7 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
                >
                    <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <CardContent
                        className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left"
                    >
                        <Loader2
                            className="animate-spin text-blue-600 w-6 h-6 lg:w-7 lg:h-7"
                        />
                        <span className="text-slate-600 font-medium tracking-wide">
                            Generating quiz…
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* ================= INSTRUCTIONS ================= */}
            {pageState === "instructions" && !isLoading && (
                <Card
                    className="relative w-full max-w-xl bg-white rounded-2xl p-5 sm:p-6 lg:p-7 border border-slate-200 shadow-2xl overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <CardHeader className="pb-4 lg:pb-5 border-b border-slate-100 relative z-10">
                        <CardTitle className="text-black font-bold tracking-tight text-xl sm:text-2xl lg:text-3xl">
                            {skill} Assessment
                        </CardTitle>
                        <p className="mt-2 text-slate-500">
                            Evaluate your proficiency and earn your certificate.
                        </p>
                    </CardHeader>

                    <CardContent className="mt-5 lg:mt-6 space-y-6 relative z-10">
                        <div className="grid gap-3">
                            {[
                                { label: "Total Questions", value: "30" },
                                { label: "Total Time", value: "30 Minutes" },
                                { label: "Total Marks", value: "30" },
                                { label: "Passing Marks", value: "21" },
                                { label: "Submission", value: "Auto-submit" },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 transition-colors hover:border-blue-400"
                                >
                                    <span className="text-slate-600 text-sm font-medium">{item.label}</span>
                                    <span className="font-bold text-black">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={startQuiz}
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-lg font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Start Assessment
                        </Button>

                        <p className="text-center text-sm text-slate-400">
                            The timer starts immediately and cannot be paused.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ================= QUIZ ================= */}
            {pageState === "quiz" && (
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    <div className="sticky top-20 z-20 flex items-center justify-between p-4 rounded-xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <Timer className="w-5 h-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>

                        <Button
                            onClick={() => handleSubmit(false)}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-bold shadow-md"
                        >
                            Finish Quiz
                        </Button>
                    </div>

                    {questions.map(q => (
                        <Card
                            key={q.id}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <CardContent className="p-6 space-y-5">
                                <p className="text-black font-bold text-lg leading-tight">
                                    <span className="text-blue-600 mr-2">{q.id}.</span> 
                                    {q.question}
                                </p>

                                <div className="grid gap-3">
                                    {q.options.map((opt, idx) => (
                                        <label
                                            key={`${q.id}-${idx}`}
                                            className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all 
                                                ${answers[q.id] === opt 
                                                    ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600" 
                                                    : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white"}`}
                                         label-text-black>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                className="mt-1 accent-blue-600 w-4 h-4"
                                                onChange={() =>
                                                    setAnswers(prev => ({ ...prev, [q.id]: opt }))
                                                }
                                            />
                                            <span className="text-slate-800 font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ================= RESULT ================= */}
            {pageState === "result" && (
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-xl">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-black">Results</h2>
                                    <p className="text-slate-500">Completed in {formatTime(timeTaken)}</p>
                                </div>
                                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                    <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Final Score</p>
                                    <p className="text-4xl font-black text-blue-600">{score} <span className="text-xl text-slate-300">/ 30</span></p>
                                </div>
                            </div>

                            {score < PASS_MARKS ? (
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 border border-red-100">
                                    <XCircle className="text-red-600 w-8 h-8 shrink-0" />
                                    <p className="text-red-800 font-bold">
                                        You scored below 21. Keep practicing and try again to earn your certificate!
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 border border-green-100">
                                    <CheckCircle2 className="text-green-600 w-8 h-8 shrink-0" />
                                    <p className="text-green-800 font-bold">
                                        Congratulations! You've passed the assessment and are eligible for your certificate.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={retakeQuiz}
                                    variant="outline"
                                    className="flex-1 border-slate-200 text-black hover:bg-slate-50 py-6 font-bold"
                                >
                                    Retake Assessment
                                </Button>

                                {score >= PASS_MARKS && (
                                    <>
                                        <Button
                                            onClick={downloadCertificate}
                                            className="flex-1 bg-amber-500 text-black hover:bg-amber-600 py-6 font-bold"
                                        >
                                            Download Certificate
                                        </Button>
                                        <div style={{ position: "fixed", left: "-2000px", top: "0" }}>
                                            <Certificate
                                                ref={certRef}
                                                userName={personalData.name || username}
                                                skill={skill}
                                                date={new Date().toLocaleDateString("en-IN", {
                                                    day: "2-digit", month: "long", year: "numeric",
                                                })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answer Review */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-black px-2">Detailed Review</h3>
                        {questions.map(q => {
                            const userAnswer = answers[q.id];
                            return (
                                <Card key={q.id} className="bg-white border border-slate-200 rounded-2xl">
                                    <CardContent className="p-6 space-y-4">
                                        <p className="text-black font-bold">
                                            {q.id}. {q.question}
                                        </p>
                                        <div className="grid gap-2">
                                            {q.options.map((opt, idx) => {
                                                const isCorrect = opt === q.correctAnswer;
                                                const isUserSelection = opt === userAnswer;
                                                const isWrongChoice = isUserSelection && !isCorrect;

                                                return (
                                                    <div
                                                        key={`${q.id}-review-${idx}`}
                                                        className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium
                                                            ${isCorrect ? "bg-green-50 border-green-200 text-green-700"
                                                                : isWrongChoice ? "bg-red-50 border-red-200 text-red-700" 
                                                                : "bg-slate-50 border-slate-100 text-slate-500"
                                                            }`}
                                                    >
                                                        <span>{opt}</span>
                                                        {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                                        {isWrongChoice && <XCircle className="w-4 h-4" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}