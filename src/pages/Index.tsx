import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { VideoCard } from "@/components/VideoCard";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const LAST_VIDEO_KEY = 'last_video';
const VIDEO_POSITION_KEY = 'video_position';

interface LastVideoState {
  playlistId: string;
  videoId: string;
  position: number;
}

interface VideoProgress {
  [videoId: string]: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const { toast } = useToast();
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem('video_progress');
    if (savedProgress) {
      setVideoProgress(JSON.parse(savedProgress));
    }

    const lastVideoState = localStorage.getItem(LAST_VIDEO_KEY);
    if (lastVideoState && sections) {
      try {
        const { playlistId, videoId, position } = JSON.parse(lastVideoState) as LastVideoState;
        setSelectedPlaylistId(playlistId);
        setSelectedVideoId(videoId);

        if (!window.YT) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
      } catch (e) {
        console.error('Error loading last video state:', e);
      }
    }
  }, [sections]);

  useEffect(() => {
    if (selectedPlaylistId && selectedVideoId) {
      const lastVideoState: LastVideoState = {
        playlistId: selectedPlaylistId,
        videoId: selectedVideoId,
        position: videoProgress[selectedVideoId] || 0
      };
      localStorage.setItem(LAST_VIDEO_KEY, JSON.stringify(lastVideoState));
    }
  }, [selectedPlaylistId, selectedVideoId, videoProgress]);

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !sections) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Video Library</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/statistics')}
              >
                <BarChart className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 73px)' }}>
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold text-red-500">Error Loading Content</h1>
              <p className="text-muted-foreground">Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlaylist = sections?.flatMap(s => s.playlists).find(p => p.name === selectedPlaylistId);
  const lastWatchedVideo = selectedVideoId && !selectedPlaylistId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Video Library</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/statistics')}
            >
              <BarChart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {lastWatchedVideo && (
          <div className="w-full animate-fade-in">
            <div 
              ref={videoPlayerRef} 
              className="w-full aspect-video"
              tabIndex={-1}
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideoId}?enablejsapi=1&autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {selectedPlaylist ? (
          <div className="animate-fade-in">
            <div className="sticky top-0 bg-background z-10 p-4 border-b">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="group"
                  onClick={() => {
                    setSelectedPlaylistId(null);
                    setSelectedVideoId(null);
                  }}
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </Button>
                <h1 className="text-2xl font-semibold">{selectedPlaylist.name}</h1>
              </div>
            </div>

            {selectedVideoId && (
              <div 
                ref={videoPlayerRef} 
                className="w-full aspect-video"
                tabIndex={-1}
              >
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideoId}?enablejsapi=1&autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPlaylist.videos.map((video) => {
                  const currentVideoId = getVideoId(video.url);
                  const progress = currentVideoId ? (videoProgress[currentVideoId] || 0) : 0;
                  
                  return (
                    <VideoCard
                      key={video.title}
                      video={video}
                      isSelected={currentVideoId === selectedVideoId}
                      progress={progress}
                      onClick={() => {
                        if (currentVideoId) {
                          setSelectedVideoId(currentVideoId);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sections.map((section) => (
                <SectionCard
                  key={section.title}
                  section={section}
                  onPlaylistClick={setSelectedPlaylistId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default Index;
