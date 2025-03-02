
import { Section } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaylistCard } from "./PlaylistCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionCardProps {
  section: Section;
  onPlaylistClick: (playlistId: string, playlistName: string) => void;
}

export function SectionCard({ section, onPlaylistClick }: SectionCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card className="animate-fade-up p-2 mb-4">
        <CardHeader className="pb-0 px-4">
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-4">
          <div className="grid grid-cols-2 gap-2">
            {section.playlists.map((playlist) => (
              <div
                key={playlist.name}
                onClick={() => onPlaylistClick(playlist.playlist_id, playlist.name)}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all">
                  <div className="aspect-video relative">
                    <img
                      src={playlist.thunmbnail || '/placeholder.svg'}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-2">
                    <h3 className="font-medium text-sm line-clamp-1">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {playlist.playlist_id ? "Click to view" : "No videos"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up w-full p-4 mb-8">
      <CardHeader className="pb-2 px-6">
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-6">
        <ScrollArea className="max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
            {section.playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.name}
                playlist={playlist}
                onClick={() => onPlaylistClick(playlist.playlist_id,playlist.name)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
