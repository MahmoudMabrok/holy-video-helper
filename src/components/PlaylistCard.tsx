
import { Playlist } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <Card 
      className="cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={playlist.thunmbnail || '/placeholder.svg'}
          alt={playlist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white font-medium">Play Playlist</div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1">{playlist.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {playlist.playlist_id ? "Click to view videos" : "No videos available"}
        </p>
      </CardContent>
    </Card>
  );
}
