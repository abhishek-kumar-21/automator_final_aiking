"use client";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SkillQuizList() {
    const { state } = useAppContext();
    const { missingSkills } = state;

    if (!missingSkills?.length) return null;

    return (
        <Card className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <CardHeader>
                <CardTitle className="text-black font-raleway">
                    Skill-wise Quiz
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                {missingSkills.map(skill => (
                    <div
                        key={skill}
                        className="flex items-center justify-between border border-slate-100 rounded-md p-3 bg-slate-50/50"
                    >
                        <span className="text-slate-700 font-medium font-inter">{skill}</span>
                        <a
                            href={`/quiz/${encodeURIComponent(skill)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 scale-95 hover:scale-105 transition-all duration-300"
                            >
                                Take Quiz
                            </Button>
                        </a>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}