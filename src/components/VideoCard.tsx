
import { Video } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  isSelected?: boolean;
  progress?: number;
}

export function VideoCard({ video, onClick, isSelected, progress = 0 }: VideoCardProps) {
  const isMobile = useIsMobile();

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(video.url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : null;
  const completionPercentage = Math.round(progress * 100);

  if (!videoId || !thumbnailUrl) {
    return null;
  }

  if (isMobile) {
    return (
      <Card 
        className={`cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : ''}`} 
        onClick={onClick}
      >
        <CardContent className="p-3 space-y-2">
          <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completionPercentage}% completed</span>
          </div>
          <Progress value={completionPercentage} className="h-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:scale-105 group cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : ''
      }`} 
      onClick={onClick}
    >
      <CardContent className="p-0 relative">
        <div className="aspect-video relative">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
          {completionPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress value={completionPercentage} className="h-1" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% completed</p>
        </div>
      </CardContent>
    </Card>
  );
}
