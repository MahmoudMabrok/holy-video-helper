
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { VideoCard } from "@/components/VideoCard";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { toast } = useToast();
  const videoPlayerRef = useRef<HTMLDivElement>(null);

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

  // Set first video as default when playlist is selected
  useEffect(() => {
    if (selectedPlaylistId && sections) {
      const playlist = sections.flatMap(s => s.playlists).find(p => p.name === selectedPlaylistId);
      if (playlist && playlist.videos.length > 0) {
        const firstVideo = playlist.videos[0];
        const videoId = getVideoId(firstVideo.url);
        if (videoId) {
          setSelectedVideoId(videoId);
        }
      }
    }
  }, [selectedPlaylistId, sections]);

  // Auto scroll to video player when video changes
  useEffect(() => {
    if (selectedVideoId && videoPlayerRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      videoPlayerRef.current.focus();
    }
  }, [selectedVideoId]);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {selectedPlaylist ? (
          <div className="animate-fade-in">
            <div className="sticky top-0 bg-background z-10 p-4 border-b">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="group"
                  onClick={() => {
                    setSelectedPlaylistId(null);
                    setSelectedVideoId(null);
                  }}
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </Button>
                <h1 className="text-2xl font-semibold">{selectedPlaylist.name}</h1>
              </div>
            </div>

            {selectedVideoId && (
              <div 
                ref={videoPlayerRef} 
                className="w-full aspect-video"
                tabIndex={-1}
              >
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPlaylist.videos.map((video) => {
                  const currentVideoId = getVideoId(video.url);
                  return (
                    <VideoCard
                      key={video.title}
                      video={video}
                      isSelected={currentVideoId === selectedVideoId}
                      onClick={() => {
                        if (currentVideoId) {
                          setSelectedVideoId(currentVideoId);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-4">
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
