
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "@/store/videoStore";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

const Index = () => {
  const navigate = useNavigate();
  const [showLastVideo, setShowLastVideo] = useState(false);

  const { 
    lastVideoState, 
    loadSavedState,
    loadSavedVideoState
  } = useVideoStore();

  const {
    startTimer,
    stopTimer,
    loadSavedUsage
  } = useUsageTimerStore();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    // Load saved video state
    loadSavedState();
    
    // Load saved usage data
    loadSavedUsage();
    
    // Start the timer when the page loads
    startTimer();
    
    // Stop the timer when the component unmounts
    return () => {
      stopTimer();
    };
  }, [loadSavedState, loadSavedUsage, startTimer, stopTimer]);

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleContinueWatching = () => {
    if (!lastVideoState) return;
    
    // Toggle the video player visibility
    setShowLastVideo(!showLastVideo);
  };

  const navigateToPlaylist = () => {
    if (!lastVideoState) return;
    
    // Navigate to the playlist that contains this video
    if (sections) {
      for (const section of sections) {
        for (const playlist of section.playlists) {
          const videoExists = playlist.videos.some(v => {
            const idMatch = v.url.match(/(?:v=|\/)([\w-]{11})(?:\?|$|&)/);
            return idMatch && idMatch[1] === lastVideoState.videoId;
          });
          
          if (videoExists) {
            navigate(`/playlist/${playlist.name}`);
            return;
          }
        }
      }
    }
    
    // If we couldn't find the playlist, go to recent videos
    navigate('/recent');
  };

  const getLastVideoInfo = () => {
    if (!lastVideoState || !sections) return { title: "Unknown", progress: 0, duration: 0 };
    
    const videoData = loadSavedVideoState(lastVideoState.videoId);
    let videoTitle = "Unknown Video";
    
    // Find the video title
    for (const section of sections) {
      for (const playlist of section.playlists) {
        const video = playlist.videos.find(v => {
          const idMatch = v.url.match(/(?:v=|\/)([\w-]{11})(?:\?|$|&)/);
          return idMatch && idMatch[1] === lastVideoState.videoId;
        });
        
        if (video) {
          videoTitle = video.title;
          break;
        }
      }
    }
    
    return {
      title: videoTitle,
      progress: videoData.seconds,
      duration: videoData.duration
    };
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
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-500">Error Loading Content</h1>
            <p className="text-muted-foreground">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const lastVideo = lastVideoState ? getLastVideoInfo() : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        {lastVideo && (
          <div className="w-full py-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Continue Watching</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{lastVideo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Progress: {Math.floor(lastVideo.progress / 60)}:{(lastVideo.progress % 60)
                        .toString()
                        .padStart(2, "0")} / 
                      {Math.floor(lastVideo.duration / 60)}:{(lastVideo.duration % 60)
                        .toString()
                        .padStart(2, "0")} 
                      ({Math.round((lastVideo.progress / lastVideo.duration) * 100)}%)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleContinueWatching}>
                      <Play className="mr-2 h-4 w-4" />
                      {showLastVideo ? 'Hide Player' : 'Play Video'}
                    </Button>
                    <Button variant="outline" onClick={navigateToPlaylist}>
                      Go to Playlist
                    </Button>
                  </div>
                </div>
                
                {showLastVideo && lastVideoState && (
                  <div className="mt-4">
                    <VideoPlayer 
                      videoId={lastVideoState.videoId}
                      startTime={lastVideo.progress}
                      onProgressChange={() => {}}
                      autoplay={false}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-8 py-4">
          {sections.map((section) => (
            <SectionCard
              key={section.title}
              section={section}
              onPlaylistClick={handlePlaylistClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Index;
