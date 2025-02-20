
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

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (savedProgress) {
      setVideoProgress(JSON.parse(savedProgress));
    }

    const lastVideoState = localStorage.getItem(LAST_VIDEO_KEY);
    if (lastVideoState && sections) {
      try {
        const { playlistId, videoId } = JSON.parse(lastVideoState) as LastVideoState;
        setSelectedPlaylistId(playlistId);
        setSelectedVideoId(videoId);
      } catch (e) {
        console.error('Error loading last video state:', e);
      }
    }
  }, [sections]);

  const handleProgressChange = (videoId: string, seconds: number) => {
    const newProgress = { ...videoProgress };
    newProgress[videoId] = seconds;
    setVideoProgress(newProgress);
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(newProgress));
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
          <Header />
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
        <Header />

        {lastWatchedVideo && (
          <div className="w-full p-4 animate-fade-in">
            <VideoPlayer 
              videoId={selectedVideoId}
              onProgressChange={(seconds) => handleProgressChange(selectedVideoId, seconds)}
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
            }}
            onVideoSelect={setSelectedVideoId}
            onProgressChange={handleProgressChange}
          />
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

export default Index;
