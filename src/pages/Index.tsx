
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Header } from "@/components/Header";
import { PlaylistView } from "@/components/PlaylistView";
import { useVideoStore } from "@/store/videoStore";

const Index = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isContinueWatchingActive, setIsContinueWatchingActive] = useState(true);

  const { 
    videoProgress, 
    lastVideoState, 
    updateProgress, 
    updateLastVideo,
    loadSavedState 
  } = useVideoStore();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  useEffect(() => {
    if (selectedVideoId || selectedPlaylistId) {
      setIsContinueWatchingActive(false);
    }
  }, [selectedVideoId, selectedPlaylistId]);

  // Save to localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.setItem('video_progress', JSON.stringify(videoProgress));
      if (lastVideoState) {
        localStorage.setItem('last_video', JSON.stringify(lastVideoState));
      }
    };
  }, [videoProgress, lastVideoState]);

  const handleProgressChange = (videoId: string, seconds: number, duration: number) => {
    if (!duration || duration === 0) return;

    updateProgress(videoId, seconds, duration);
    
    const newLastVideoState = {
      videoId,
      playlistId: selectedPlaylistId || '',
      position: seconds
    };
    updateLastVideo(newLastVideoState);
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

  const selectedPlaylist = sections?.flatMap(s => s.playlists).find(p => p.name === selectedPlaylistId);

  const normalizedProgress = Object.entries(videoProgress).reduce((acc, [id, data]) => {
    acc[id] = data.seconds / data.duration;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        {lastVideoState && !selectedVideoId && !selectedPlaylist && isContinueWatchingActive && (
          <div className="w-full py-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Continue Watching</h2>
            <VideoPlayer 
              key={`continue-${lastVideoState.videoId}`}
              videoId={lastVideoState.videoId}
              startTime={videoProgress[lastVideoState.videoId]?.seconds || 0}
              onProgressChange={(seconds, duration) => handleProgressChange(lastVideoState.videoId, seconds, duration)}
            />
          </div>
        )}

        {selectedPlaylist ? (
          <PlaylistView
            playlist={selectedPlaylist}
            selectedVideoId={selectedVideoId}
            videoProgress={normalizedProgress}
            onBack={() => {
              setSelectedPlaylistId(null);
              setSelectedVideoId(null);
              setIsContinueWatchingActive(true);
            }}
            onVideoSelect={setSelectedVideoId}
            onProgressChange={handleProgressChange}
          />
        ) : (
          <div className="space-y-8 py-4">
            {sections.map((section) => (
              <SectionCard
                key={section.title}
                section={section}
                onPlaylistClick={setSelectedPlaylistId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
