
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaylistView } from "@/components/PlaylistView";
import { Header } from "@/components/Header";
import { useVideoStore } from "@/store/videoStore";

export default function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  
  const { 
    videoProgress, 
    updateVideoProgress, 
    lastVideoState,
    updateLastVideo 
  } = useVideoStore();

  const { data: sections } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  const selectedPlaylist = sections?.flatMap(s => s.playlists).find(p => p.name === playlistId);

  const handleProgressChange = (videoId: string, seconds: number, duration: number) => {
    console.log('handleProgressChange', videoId, duration);

    if (!duration || duration === 0) return;

    // updateProgress(videoId, seconds, duration);
  };

  if (!selectedPlaylist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-500">Playlist Not Found</h1>
            <p className="text-muted-foreground">The playlist you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const normalizedProgress = Object.entries(videoProgress).reduce((acc, [id, data]) => {
    acc[id] = data.seconds / data.duration;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        <PlaylistView
          playlist={selectedPlaylist}
          selectedVideoId={selectedVideoId}
          videoProgress={normalizedProgress}
          onBack={() => navigate('/')}
          onVideoSelect={setSelectedVideoId}
          onProgressChange={handleProgressChange}
        />
      </div>
    </div>
  );
}
