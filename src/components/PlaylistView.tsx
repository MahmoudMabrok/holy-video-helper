
import { Playlist, Video } from "@/services/api";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useVideoStore } from "@/store/videoStore";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlaylistViewProps {
  playlist: Playlist;
  selectedVideoId: string | null;
  videoProgress: { [key: string]: number };
  onBack: () => void;
  onVideoSelect: (videoId: string) => void;
  onProgressChange: (videoId: string, seconds: number, duration: number) => void;
}

const getVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function PlaylistView({ 
  playlist, 
  selectedVideoId, 
  onBack,
  onVideoSelect,
}: PlaylistViewProps) {
    const {  
      loadSavedVideoState, 
    } = useVideoStore();
    const isMobile = useIsMobile();

    // Maintain a current index state to track the currently playing video
    const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(-1);

    // Update the current index when selected video changes
    useEffect(() => {
      if (selectedVideoId) {
        const index = playlist.videos.findIndex(
          (video) => getVideoId(video.url) === selectedVideoId
        );
        if (index !== -1) {
          setCurrentVideoIndex(index);
        }
      }
    }, [selectedVideoId, playlist.videos]);

    const getStartTime = (videoId: string) => {
      const progressData = loadSavedVideoState(videoId);
      if (!progressData) return 0;
  
      try {
        return progressData.seconds || 0;
      } catch (e) {
        console.error('Error getting start time:', e);
        return 0;
      }
    };

    const handleVideoEnd = () => {
      console.log('Video ended, current index:', currentVideoIndex);
      
      // If there's a next video in the playlist, play it
      if (currentVideoIndex >= 0 && currentVideoIndex < playlist.videos.length - 1) {
        const nextVideo = playlist.videos[currentVideoIndex + 1];
        const nextVideoId = getVideoId(nextVideo.url);
        
        if (nextVideoId) {
          console.log('Auto-playing next video:', nextVideoId);
          onVideoSelect(nextVideoId);
        }
      } else {
        console.log('Reached the end of the playlist');
      }
    };

  return (
    <div className="w-full animate-fade-in pt-4">
      <div className="w-full mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="group"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold truncate">{playlist.name}</h1>
        </div>
      </div>

      {selectedVideoId && (
        <div className="w-full mb-6">
          <div className="aspect-video max-w-full">
            <VideoPlayer 
              videoId={selectedVideoId}
              playlist_id={playlist.playlist_id}
              startTime={getStartTime(selectedVideoId)}
              autoplay={true}
              onVideoEnd={handleVideoEnd}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-medium mb-4">Playlist Videos</h2>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {playlist.videos.map((video: Video) => {
            const videoId = getVideoId(video.url);
            if (!videoId) return null;

            const videoData = loadSavedVideoState(videoId);
            const progress = videoData && videoData.duration ? videoData.seconds / videoData.duration : 0;
            
            return (
              <VideoCard
                key={videoId}
                video={video}
                isSelected={videoId === selectedVideoId}
                progress={progress || 0}
                onClick={() => onVideoSelect(videoId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
