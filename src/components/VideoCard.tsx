
import { Video } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  // Extract video ID from URL
  const videoId = video.url.split('v=')[1];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:scale-105 group" onClick={onClick}>
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
