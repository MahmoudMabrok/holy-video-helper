
import { Playlist, Video } from "@/services/api";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

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
  videoProgress,
  onBack,
  onVideoSelect,
  onProgressChange
}: PlaylistViewProps) {
  const getStartTime = (videoId: string, duration: number) => {
    const progress = videoProgress[videoId] || 0;
    return Math.floor(progress * duration);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="sticky top-[73px] bg-background z-10 p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="group"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{playlist.name}</h1>
        </div>
      </div>

      {selectedVideoId && (
        <div className="w-full px-4">
          <VideoPlayer 
            videoId={selectedVideoId}
            startTime={videoProgress[selectedVideoId] ? -1 : 0} // Use -1 as flag to indicate we should get progress
            onProgressChange={(seconds, duration) => {
              if (seconds === 0 && videoProgress[selectedVideoId]) {
                // Initial load - seek to saved progress
                const startTime = getStartTime(selectedVideoId, duration);
                console.log('Seeking to saved progress:', { videoId: selectedVideoId, startTime, duration });
                onProgressChange(selectedVideoId, startTime, duration);
              } else {
                onProgressChange(selectedVideoId, seconds, duration);
              }
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlist.videos.map((video: Video) => {
            const videoId = getVideoId(video.url);
            if (!videoId) return null;
            
            return (
              <VideoCard
                key={video.title}
                video={video}
                isSelected={videoId === selectedVideoId}
                progress={videoProgress[videoId] || 0}
                onClick={() => onVideoSelect(videoId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
