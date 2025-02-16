
import { Section } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaylistCard } from "./PlaylistCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionCardProps {
  section: Section;
  onPlaylistClick: (playlistId: string) => void;
}

export function SectionCard({ section, onPlaylistClick }: SectionCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card className="animate-fade-up">
        <CardHeader className="pb-2">
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {section.playlists.map((playlist) => (
              <div
                key={playlist.name}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => onPlaylistClick(playlist.name)}
              >
                <span className="font-medium">{playlist.name}</span>
                <span className="text-sm text-muted-foreground">{playlist.videos.length} videos</span>
              </div>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
