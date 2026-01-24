"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Skill } from "@/types";
import VideoPlayerModal from "./VideoPlayerModal";

interface SkillCardProps {
  skill: Skill;
  isLocked?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isLocked = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);
  const { completeSkill, completeVideo } = useAppContext();

  const completedVideos = skill.videos.filter(
    (video) => video.isCompleted
  ).length;
  const totalVideos = skill.videos.length;
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  const handleVideoClick = (video: any) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      url: video.url,
    });
  };

  const handleVideoComplete = () => {
    if (selectedVideo) {
      completeVideo(skill.id, selectedVideo.id);
      setSelectedVideo(null);
    }
  };

  return (
    <>
      <div className="flex flex-col bg-white">
        <Card
          className={`skill-card bg-white border border-slate-200 shadow-sm ${
            skill.isCompleted ? "border-blue-500" : ""
          } ${isLocked ? "opacity-60" : ""}`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {skill.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
                <CardTitle className="text-lg sm:text-xl font-raleway font-bold text-slate-900">
                  {skill.name}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`text-xs font-inter ${
                    skill.isCompleted
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {completedVideos}/{totalVideos} Videos
                </Badge>
                <Button
                  variant="ghost"
                  className="p-0 h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
                  onClick={() => !isLocked && setExpanded(!expanded)}
                  disabled={isLocked}
                >
                  {expanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {expanded ? "Collapse" : "Expand"} skill details
                  </span>
                </Button>
              </div>
            </div>

            <div className="w-full mt-3">
              <div className="progress-bar h-2 bg-slate-100 rounded-full">
                <div
                  className="progress-value h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardHeader>

          {expanded && !isLocked && (
            <CardContent className="pt-0 px-4 pb-4">
              <div className="space-y-3 mt-3">
                {skill.videos.length === 0 ? (
                  <div className="text-sm text-slate-500 font-inter text-center py-4">
                    No videos available for this skill at the moment.
                  </div>
                ) : (
                  skill.videos.map((video) => (
                    <div
                      key={video.id}
                      className={`rounded-md border ${
                        video.isCompleted
                          ? "bg-blue-50 border-blue-100"
                          : "bg-white border-slate-200 hover:border-blue-200 transition-colors"
                      }`}
                    >
                      <div className="flex items-start p-3">
                        <div
                          className="flex-shrink-0 relative mr-3 overflow-hidden cursor-pointer"
                          style={{ width: "120px", height: "67px" }}
                          onClick={() => handleVideoClick(video)}
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {video.isCompleted ? (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-blue-600" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
                              <PlayCircle className="h-10 w-10 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-raleway font-semibold text-slate-900 leading-tight line-clamp-2">
                            {video.title}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-slate-500 font-inter">
                            <span className="mr-2">{video.duration}</span>
                            <span>{video.viewCount} views</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className={`ml-2 h-10 w-10 flex items-center justify-center rounded-full ${
                            video.isCompleted
                              ? "text-blue-600"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors`}
                          onClick={() => handleVideoClick(video)}
                          disabled={video.isCompleted}
                        >
                          {video.isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <PlayCircle className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {video.isCompleted
                              ? "Video completed"
                              : "Play video"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        onVideoCompleted={handleVideoComplete}
      />
    </>
  );
};

export default SkillCard;