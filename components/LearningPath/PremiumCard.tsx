"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Target, TrendingUp, CheckCircle } from 'lucide-react';

const PremiumCard = () => {
  const handleBuyPremium = () => {
    // Navigate to pricing page or open payment modal
    window.location.href = '/pricing';
  };

  return (
    // Changed container bg to light gray
    <div className="flex flex-col bg-gray-50">
      {/* Changed card bg to white and border to light gray */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Changed text color to black (gray-900) */}
            <CardTitle className="text-lg sm:text-xl ml-7 mt-7 font-raleway font-bold text-gray-900 flex items-center gap-2">
              {/* Changed icon color to blue */}
              <Crown className="h-5 w-5 text-blue-600" />
              Premium Analysis
            </CardTitle>
            {/* Changed badge border, text color, and background to blue theme */}
            <Badge className="border-blue-200 mr-7 font-inter text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 text-white">
              UPGRADE
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Changed paragraph text to dark gray */}
            <p className="text-gray-600 font-inter text-sm">
              Get comprehensive insights into your career path with AI-powered analysis and personalized recommendations.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                {/* Changed icon background to light blue */}
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  {/* Changed icon color to blue */}
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  {/* Changed title text to black */}
                  <h3 className="font-raleway font-semibold text-base text-gray-900 mb-1">
                    Detailed skill gap analysis
                  </h3>
                  {/* Changed description text to dark gray */}
                  <p className="text-gray-600 font-inter text-xs">
                    Priority levels and impact assessment
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-raleway font-semibold text-base text-gray-900 mb-1">
                    Personalized career roadmap
                  </h3>
                  <p className="text-gray-600 font-inter text-xs">
                    Timeline and milestone tracking
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-raleway font-semibold text-base text-gray-900 mb-1">
                    Industry-specific recommendations
                  </h3>
                  <p className="text-gray-600 font-inter text-xs">
                    Market trends and salary insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-raleway font-semibold text-base text-gray-900 mb-1">
                    Advanced progress tracking
                  </h3>
                  <p className="text-gray-600 font-inter text-xs">
                    Analytics and performance metrics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={handleBuyPremium}
                // Changed button background to blue and ring focus to blue
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-raleway font-semibold text-base px-6 py-2 rounded-md h-10 transition duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              >
                <Crown className="mr-2 h-4 w-4 inline" />
                Buy Premium
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumCard;