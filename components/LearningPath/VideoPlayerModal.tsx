"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, AlertCircle, Youtube, Wand2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    url: string;
  } | null;
  onVideoCompleted: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
  onVideoCompleted,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [alternativeVideos, setAlternativeVideos] = useState<
    { title: string; url: string }[]
  >([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  useEffect(() => {
    // Reset states when a new video is loaded
    if (isOpen) {
      setLoadError(false);
      setAlternativeVideos([]);
    }
  }, [isOpen, video]);

  const handleVideoEnded = () => {
    onVideoCompleted();
  };

  const handleError = async () => {
    console.error("Video failed to load:", video?.url);
    setLoadError(true);

    if (video) {
      // Try to find alternative videos using Gemini
      await findAlternativeVideos(video.title);
    }
  };

  const findAlternativeVideos = async (videoTitle: string) => {
    setIsLoadingAlternatives(true);

    try {
      const apiKey = localStorage.getItem("geminiApiKey");

      if (!apiKey) {
        console.log("No Gemini API key found, skipping alternative video search");
        setIsLoadingAlternatives(false);
        setAlternativeVideos([
          {
            title: "Error: API Key Missing",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          },
        ]);
        return;
      }

      const prompt = `
        I need to find alternative YouTube tutorial videos for a skill-learning platform. 
        The original video titled "${videoTitle}" is no longer available or cannot be embedded.
        Please suggest 3 alternative YouTube videos that teach similar content.
        
        Format your response as valid JSON with this structure:
        {
          "alternatives": [
            {
              "title": "Video Title 1",
              "url": "https://www.youtube.com/embed/VIDEO_ID_1"
            },
            {
              "title": "Video Title 2", 
              "url": "https://www.youtube.com/embed/VIDEO_ID_2"
            },
            {
              "title": "Video Title 3",
              "url": "https://www.youtube.com/embed/VIDEO_ID_3"
            }
          ]
        }
        
        Make sure the URLs use the embed format (youtube.com/embed/VIDEO_ID) and are for videos that are likely to be embeddable.
      `;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setAlternativeVideos([
            {
              title: "Error: Invalid API Key",
              url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            },
          ]);
          throw new Error("Invalid API Key");
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = "";
      try {
        responseText = data.candidates[0].content.parts[0].text;
      } catch (e) {
        throw new Error("Invalid response format from Gemini");
      }

      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/{[\s\S]*}/);

      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }

      let jsonStr = jsonMatch[0];
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonMatch[1];
      }

      const result = JSON.parse(jsonStr);

      if (result.alternatives && Array.isArray(result.alternatives)) {
        setAlternativeVideos(result.alternatives);
      }
    } catch (error) {
      console.error("Error finding alternative videos:", error);
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (!video)
    return (
      <div className="flex flex-col bg-slate-50">
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-4xl bg-white border border-slate-200">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0">
              <DialogTitle className="text-xl font-raleway font-bold text-slate-900">
                No Video Available
              </DialogTitle>
              <Button
                variant="ghost"
                className="p-0 h-10 w-10 text-slate-400 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close dialog</span>
              </Button>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-slate-100">
              <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
              <DialogDescription className="text-center mb-6 text-slate-600 font-inter text-base">
                Sorry, we couldn't find any available or embeddable videos for
                this skill at the moment.
                <br />
                Please try searching for another skill or check back later.
              </DialogDescription>
              <Button
                className="w-full max-w-xs bg-blue-600 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 h-10"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );

  const embedUrl =
    video && getYouTubeId(video.url)
      ? `https://www.youtube.com/embed/${getYouTubeId(video.url)}`
      : video?.url || "";

  const videoId = getYouTubeId(video.url);
  const directYouTubeLink = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : video.url;

  return (
    <div className="flex flex-col bg-slate-50">
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-4xl bg-white border border-slate-200">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-raleway font-bold text-slate-900">
              {video.title}
            </DialogTitle>
            <Button
              variant="ghost"
              className="p-0 h-10 w-10 text-slate-400 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close dialog</span>
            </Button>
          </DialogHeader>

          {loadError ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-slate-100">
              <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
              <DialogDescription className="text-center mb-6 text-slate-600 font-inter text-base">
                Unable to load the embedded video. This might be due to content
                security restrictions from YouTube or the video is no longer
                available.
              </DialogDescription>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button
                  className="w-full bg-blue-600 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 h-10"
                  onClick={() => window.open(directYouTubeLink, "_blank")}
                >
                  Try on Youtube
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 h-10"
                  onClick={onVideoCompleted}
                >
                  Mark as Completed
                </Button>
              </div>

              {alternativeVideos.length > 0 && (
                <div className="mt-8 w-full">
                  <Separator className="my-4 bg-slate-200" />
                  <h3 className="font-raleway font-semibold text-base text-slate-900 text-center mb-4">
                    Alternative Videos
                  </h3>
                  <div className="space-y-4">
                    {alternativeVideos.map((altVideo, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 bg-white rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <h4 className="font-raleway font-semibold text-sm text-slate-900">
                          {altVideo.title}
                        </h4>
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white font-raleway font-semibold rounded-md transition duration-200 hover:bg-blue-700 h-9"
                          onClick={() =>
                            window.open(
                              altVideo.url.replace("/embed/", "/watch?v="),
                              "_blank"
                            )
                          }
                        >
                          <Youtube className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoadingAlternatives && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 font-inter animate-pulse">
                    Looking for alternative videos...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-100 border border-slate-200">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onEnded={handleVideoEnded}
                  onError={handleError}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-slate-300 text-slate-700 font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-slate-50 h-10 flex items-center"
                >
                  <Wand2 className="h-4 w-4 mr-2" /> Transcript
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto bg-blue-600 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 h-10 flex items-center"
                    onClick={onVideoCompleted}
                  >
                    <Check className="h-4 w-4 mr-2" /> Mark as Complete
                  </Button>
                  <Button
                    className="w-full sm:w-auto bg-blue-600 text-white font-raleway font-semibold text-base px-6 py-3 rounded-md transition duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 h-10 flex items-center"
                  >
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPlayerModal;