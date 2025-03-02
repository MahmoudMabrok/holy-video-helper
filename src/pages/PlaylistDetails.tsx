
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaylistVideos } from "@/services/api";
import { useState, useEffect } from "react";
import { PlaylistView } from "@/components/PlaylistView";
import { Header } from "@/components/Header";
import { useVideoStore } from "@/store/videoStore";
import { toast } from "sonner";

export default function PlaylistDetails() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [playlistName] = useState<string>(searchParams.get('name') || '');
  
  const { 
    videoProgress, 
  } = useVideoStore();

  const { data: playlistVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistId ? fetchPlaylistVideos(playlistId) : Promise.resolve([]),
  });

  useEffect(() => {
    if (videosError) {
      toast.error("Failed to load playlist videos. Please try again later.");
      console.error("Error loading playlist videos:", videosError);
    }
  }, [videosError]);

  const handleProgressChange = (videoId: string, seconds: number, duration: number) => {
    console.log('handleProgressChange', videoId, duration);

    if (!duration || duration === 0) return;
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Loading playlist...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!playlistId || videosError) {
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

  // Create a complete playlist object with metadata and videos
  const completePlaylist = {
    name: playlistName,
    thunmbnail: playlistVideos && playlistVideos.length > 0 ? playlistVideos[0].url : '',
    playlist_id: playlistId,
    videos: playlistVideos || []
  };

  const normalizedProgress = Object.entries(videoProgress).reduce((acc, [id, data]) => {
    acc[id] = data.seconds / data.duration;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        <PlaylistView
          playlist={completePlaylist}
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
