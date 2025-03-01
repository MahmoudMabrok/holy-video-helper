
import { Playlist } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

const getFirstVideoThumbnail = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
};

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const thumbnail = getFirstVideoThumbnail(playlist.videos[0]?.url);

  return (
    <Card 
      className="cursor-pointer hover-card group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={thumbnail || '/placeholder.svg'}
          alt={playlist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white font-medium">Play Playlist</div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1">{playlist.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {playlist.videos.length} videos
        </p>
      </CardContent>
    </Card>
  );
}
