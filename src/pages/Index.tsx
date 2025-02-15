
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { VideoCard } from "@/components/VideoCard";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content. Please try again later.",
      });
    }
  }, [error, toast]);

  // Function to extract video ID from URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

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

  const selectedPlaylist = sections.flatMap(s => s.playlists).find(p => p.name === selectedPlaylistId);

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

            {selectedVideoId && (
              <div className="w-full aspect-video mb-8">
                <iframe
                  className="w-full h-full rounded-lg shadow-lg"
                  src={`https://www.youtube.com/embed/${selectedVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedPlaylist.videos.map((video) => {
                return (
                  <VideoCard
                    key={video.title}
                    video={video}
                    onClick={() => {
                      const videoId = getVideoId(video.url);
                      if (videoId) {
                        setSelectedVideoId(videoId);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {sections.map((section) => (
              <SectionCard
                key={section.title}
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
