
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Header } from "@/components/Header";
import { PlaylistView } from "@/components/PlaylistView";

const LAST_VIDEO_KEY = 'last_video';
const VIDEO_PROGRESS_KEY = 'video_progress';

interface LastVideoState {
  playlistId: string;
  videoId: string;
  position: number;
}

interface VideoProgress {
  [videoId: string]: number;
}

const Index = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const [lastVideoState, setLastVideoState] = useState<LastVideoState | null>(null);
  const [isContinueWatchingActive, setIsContinueWatchingActive] = useState(true);

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      console.log('Loaded saved progress:', parsedProgress);
      setVideoProgress(parsedProgress);
    }

    const lastVideo = localStorage.getItem(LAST_VIDEO_KEY);
    if (lastVideo) {
      try {
        const parsedLastVideo = JSON.parse(lastVideo) as LastVideoState;
        console.log('Loaded last video state:', parsedLastVideo);
        setLastVideoState(parsedLastVideo);
      } catch (e) {
        console.error('Error loading last video state:', e);
      }
    }
  }, []);

  // Reset Continue Watching when selecting a new video or playlist
  useEffect(() => {
    if (selectedVideoId || selectedPlaylistId) {
      setIsContinueWatchingActive(false);
    }
  }, [selectedVideoId, selectedPlaylistId]);

  const handleProgressChange = (videoId: string, seconds: number, duration: number) => {
    console.log('Progress change:', { videoId, seconds, duration });
    
    if (!duration || duration === 0) {
      console.log('Invalid duration, skipping progress update');
      return;
    }

    const progress = Math.min(seconds / duration, 1);
    console.log('Calculated progress:', progress);

    // Update progress with timestamp
    const progressData = {
      seconds,
      duration,
      lastUpdated: new Date().toISOString()
    };

    const newProgress = { ...videoProgress };
    newProgress[videoId] = progress;
    setVideoProgress(newProgress);

    // Save full progress data
    const savedProgress = localStorage.getItem(VIDEO_PROGRESS_KEY);
    const existingProgress = savedProgress ? JSON.parse(savedProgress) : {};
    existingProgress[videoId] = progressData;
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(existingProgress));

    // Save last video state
    const newLastVideoState: LastVideoState = {
      videoId,
      playlistId: selectedPlaylistId || '',
      position: seconds
    };
    console.log('Saving last video state:', newLastVideoState);
    localStorage.setItem(LAST_VIDEO_KEY, JSON.stringify(newLastVideoState));
    setLastVideoState(newLastVideoState);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        {lastVideoState && !selectedVideoId && !selectedPlaylist && isContinueWatchingActive && (
          <div className="w-full py-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Continue Watching</h2>
            <VideoPlayer 
              videoId={lastVideoState.videoId}
              startTime={lastVideoState.position}
              onProgressChange={(seconds, duration) => handleProgressChange(lastVideoState.videoId, seconds, duration)}
            />
          </div>
        )}

        {selectedPlaylist ? (
          <PlaylistView
            playlist={selectedPlaylist}
            selectedVideoId={selectedVideoId}
            videoProgress={videoProgress}
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
