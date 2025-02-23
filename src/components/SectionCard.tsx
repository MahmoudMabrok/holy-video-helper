
import { Section } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaylistCard } from "./PlaylistCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionCardProps {
  section: Section;
  onPlaylistClick: (playlistId: string) => void;
}

const getFirstVideoThumbnail = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
};

export function SectionCard({ section, onPlaylistClick }: SectionCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card className="animate-fade-up">
        <CardHeader className="pb-0">
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2">
            {section.playlists.map((playlist) => {
              const thumbnail = getFirstVideoThumbnail(playlist.videos[0]?.url);
              return (
                <div
                  key={playlist.name}
                  onClick={() => onPlaylistClick(playlist.name)}
                >
                  <Card className="overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                    <div className="aspect-video relative">
                      <img
                        src={thumbnail || '/placeholder.svg'}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-2">
                      <h3 className="font-medium text-sm line-clamp-1">{playlist.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {playlist.videos.length} videos
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up w-full">
      <CardHeader className="pb-2">
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="max-h-[80vh]">
          <div className="grid grid-cols-3 gap-4 pr-4">
            {section.playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.name}
                playlist={playlist}
                onClick={() => onPlaylistClick(playlist.name)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
