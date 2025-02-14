
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { VideoCard } from "@/components/VideoCard";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    onError: (error) => {
      console.error('Query error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content. Please try again later.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !sections) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-red-500">Error Loading Content</h1>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const selectedPlaylist = sections.flatMap(s => s.playlists).find(p => p.id === selectedPlaylistId);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {selectedPlaylist ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="group"
                onClick={() => setSelectedPlaylistId(null)}
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
              <h1 className="text-2xl font-semibold">{selectedPlaylist.name}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedPlaylist.videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VideoCard video={video} />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onPlaylistClick={setSelectedPlaylistId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
