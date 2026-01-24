"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle, Circle } from 'lucide-react';

const Milestones = () => {
  const { state } = useAppContext();
  const { milestones } = state;
  
  const achievedCount = milestones.filter(m => m.isAchieved).length;
  const totalCount = milestones.length;

  return (
    <div className="flex flex-col bg-slate-50 p-4"> {/* Changed to light background */}
      <Card className="bg-white border-slate-200 shadow-sm"> {/* Changed to white card with subtle border */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl ml-7 mt-7 font-raleway font-bold text-slate-900">
              Milestones
            </CardTitle>
            <Badge variant="outline" className="border-slate-200 mr-7 text-slate-500 font-inter text-xs">
              {achievedCount}/{totalCount} Achieved
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`flex items-start p-4 rounded-lg transition-colors ${
                  milestone.isAchieved
                    ? 'bg-blue-50 border border-blue-100' // Achieved: Light Blue tint
                    : 'bg-slate-50 border border-transparent' // Pending: Very light gray
                }`}
              >
                <div className="milestone-badge mr-3 flex-shrink-0">
                  {milestone.isAchieved ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" /> // Primary Blue
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" /> // Muted Gray
                  )}
                </div>
                <div>
                  <h3
                    className={`font-raleway font-semibold text-sm sm:text-base ${
                      milestone.isAchieved ? 'text-blue-700' : 'text-slate-900'
                    }`}
                  >
                    {milestone.name}
                  </h3>
                  <p className="text-slate-600 font-inter text-sm mt-1">
                    {milestone.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs font-raleway font-semibold text-slate-800">
                      Requirements:
                    </span>
                    <ul className="text-slate-500 font-inter text-xs mt-1 space-y-1">
                      {milestone.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="mr-1 text-blue-400">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Milestones;