
import { Playlist } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { PlaySquare } from "lucide-react";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:scale-105 group"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        <PlaySquare className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{playlist.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {playlist.videos.length} videos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
