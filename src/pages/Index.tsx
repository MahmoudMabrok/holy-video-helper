
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect, useCallback } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "@/store/videoStore";
import { useUsageTimerStore } from "@/store/usageTimerStore";

const Index = () => {
  const navigate = useNavigate();
  const [isContinueWatchingActive, setIsContinueWatchingActive] = useState(true);

  const { 
    videoProgress, 
    lastVideoState, 
    loadSavedState 
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
    setIsContinueWatchingActive(false);
    navigate(`/playlist/${playlistId}`);
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

  console.log('Index lastVideoState', lastVideoState);

  const lastVideoStarttime = lastVideoState?.seconds
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        {lastVideoState?.videoId && isContinueWatchingActive && (
          <div className="w-full py-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Continue Watching</h2>
            <VideoPlayer 
              key={`continue-${lastVideoState.videoId}`}
              videoId={lastVideoState.videoId}
              startTime={lastVideoStarttime || 0}
              onProgressChange={(seconds, duration) => {}}
            />
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
