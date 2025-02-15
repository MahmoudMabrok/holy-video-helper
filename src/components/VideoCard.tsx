
import { Video } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  isSelected?: boolean;
}

export function VideoCard({ video, onClick, isSelected }: VideoCardProps) {
  const isMobile = useIsMobile();

  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(video.url);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg` : null;

  if (!videoId || !thumbnailUrl) {
    return null;
  }

  if (isMobile) {
    return (
      <Card 
        className={`cursor-pointer ${isSelected ? 'bg-primary/10 border-primary' : ''}`} 
        onClick={onClick}
      >
        <CardContent className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:scale-105 group cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
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
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
