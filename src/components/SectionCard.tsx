
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
        <CardHeader className="pb-2">
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex space-x-4 pb-4">
              {section.playlists.map((playlist) => {
                const thumbnail = getFirstVideoThumbnail(playlist.videos[0]?.url);
                return (
                  <div
                    key={playlist.name}
                    className="flex-none w-[280px]"
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
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1">{playlist.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {playlist.videos.length} videos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-4">
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
