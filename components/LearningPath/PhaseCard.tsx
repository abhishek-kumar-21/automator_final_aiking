"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/cardforCourse';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phase } from '@/types';
import SkillCard from './SkillCard';
import { Lock, BookOpen, CheckCircle } from 'lucide-react';

interface PhaseCardProps {
  phase: Phase;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const completedSkills = phase.skills.filter(skill => skill.isCompleted).length;
  const totalSkills = phase.skills.length;
  
  // Blue accent color defined for consistency: #2563EB (similar to Tailwind blue-600)
  const accentBlue = '#2563EB';

  return (
     <div className="flex flex-col bg-gray-50">
      <Card className={`phase-card bg-white border border-gray-200 ${phase.isCompleted ? `border-[${accentBlue}]` : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {phase.isCompleted ? (
                <CheckCircle className={`h-5 w-5 text-[${accentBlue}]`} />
              ) : phase.isUnlocked ? (
                <BookOpen className="h-5 w-5 text-black" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <CardTitle className="text-lg sm:text-xl font-raleway font-bold text-black">
                {phase.name}
              </CardTitle>
            </div>
            <Badge className={`text-xs font-inter ${phase.isCompleted ? 'border-gray-200 text-gray-600' : `bg-[${accentBlue}] text-white`}`}>
              {completedSkills}/{totalSkills} Skills
            </Badge>
          </div>
          <CardDescription className="text-gray-600 font-inter text-sm mt-2">
            {phase.description}
          </CardDescription>

          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-1 text-sm text-black font-inter">
              <span>Progress</span>
              <span className="font-semibold">{phase.progress}%</span>
            </div>
            <div className="progress-bar h-2 bg-gray-100 rounded-full">
              <div
                className={`progress-value h-2 bg-[${accentBlue}] rounded-full transition-all duration-300`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {phase.skills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isLocked={!phase.isUnlocked}
            />
          ))}
        </CardContent>
        {phase.isCompleted && (
          // Using rgba for the light blue background and border based on the accentBlue #2563EB
          <CardFooter className="bg-[rgba(37,99,235,0.05)] border-t border-[rgba(37,99,235,0.2)]">
            <div className="flex items-center justify-between w-full">
              <div className={`flex items-center text-[${accentBlue}]`}>
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-raleway font-semibold text-black text-sm">
                  Phase Completed
                </span>
              </div>
              <Button
                className={`bg-[${accentBlue}] text-white font-raleway font-semibold text-base px-6 py-2 rounded-md transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${accentBlue}] h-10`}
              >
                Take Quiz
              </Button>
            </div>
          </CardFooter>
        )}
        {!phase.isUnlocked && !phase.isCompleted && (
          <CardFooter>
            <div className="flex items-center text-gray-600 font-inter text-sm">
              <Lock className="h-5 w-5 mr-2 text-gray-400" />
              <span>Complete previous phase to unlock</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PhaseCard;