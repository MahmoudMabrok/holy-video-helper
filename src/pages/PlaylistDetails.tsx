
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContent, fetchPlaylistVideos } from "@/services/api";
import { useState, useEffect } from "react";
import { PlaylistView } from "@/components/PlaylistView";
import { Header } from "@/components/Header";
import { useVideoStore } from "@/store/videoStore";
import { toast } from "sonner";

export default function PlaylistDetails() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  
  const { 
    videoProgress, 
  } = useVideoStore();

  // Fetch sections to get the playlist metadata
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  const selectedPlaylistMeta = sections?.flatMap(s => s.playlists).find(p => p.name === playlistId);
  
  // Fetch playlist videos using the playlist_id
  const { data: playlistVideos, isLoading: videosLoading, error: videosError } = useQuery({
    queryKey: ["playlist", selectedPlaylistMeta?.playlist_id],
    queryFn: () => selectedPlaylistMeta?.playlist_id ? fetchPlaylistVideos(selectedPlaylistMeta.playlist_id) : Promise.resolve([]),
    enabled: !!selectedPlaylistMeta?.playlist_id,
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

  if (sectionsLoading || (selectedPlaylistMeta?.playlist_id && videosLoading)) {
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

  if (!selectedPlaylistMeta) {
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
    ...selectedPlaylistMeta,
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
          playlistId={playlistId}
          onBack={() => navigate('/')}
          onVideoSelect={setSelectedVideoId}
          onProgressChange={handleProgressChange}
        />
      </div>
    </div>
  );
}
