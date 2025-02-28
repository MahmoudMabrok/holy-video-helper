
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useVideoStore } from "@/store/videoStore";
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { format } from "path";
import { formatVideoProgress } from "@/lib/utils";

interface RecentVideo {
  videoId: string;
  title: string;
  seconds: number;
  duration: number;
  lastUpdated: string;
  playlistName?: string;
}

export default function RecentVideos() {
  const navigate = useNavigate();
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { loadSavedVideoState, updateVideoProgress, deleteVideoProgress } = useVideoStore();
  
  const { data: sections } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  // Find video titles and playlists
  const findVideoInfo = useCallback((videoId: string) => {
    if (!sections) return { title: "Unknown Video", playlistName: undefined };
    
    for (const section of sections) {
      for (const playlist of section.playlists) {
        const video = playlist.videos.find(v => {
          const idMatch = v.url.match(/(?:v=|\/)([\w-]{11})(?:\?|$|&)/);
          return idMatch && idMatch[1] === videoId;
        });
        
        if (video) {
          return { title: video.title, playlistName: playlist.name };
        }
      }
    }
    
    return { title: "Unknown Video", playlistName: undefined };
  }, [sections]);

  const loadRecentVideos = useCallback(() => {
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Filter for YouTube video IDs (11 characters)
    const videoKeys = allKeys.filter(key => /^[A-Za-z0-9_-]{11}$/.test(key));
    
    // Get data for each video
    const videos: RecentVideo[] = videoKeys.map(videoId => {
      const data = loadSavedVideoState(videoId);
      const { title, playlistName } = findVideoInfo(videoId);

      console.log(data);
      
      
      return {
        videoId,
        title,
        playlistName,
        seconds: data.seconds || 0,
        duration: data.duration || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    });
    
    // Sort by last updated (newest first) and take the first 3
    const sortedVideos = videos
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);
    
    setRecentVideos(sortedVideos);
  }, [sections, findVideoInfo, loadSavedVideoState]);

  useEffect(() => {
    loadRecentVideos();
  }, [loadRecentVideos]);
  
  const handleProgressChange = (videoId: string, seconds: number, duration: number) => {
    // Update progress for videos played on the recent videos page
    updateVideoProgress(videoId, seconds, duration);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (activeVideoId === videoId) {
      setActiveVideoId(null);
    }
    deleteVideoProgress(videoId);
    loadRecentVideos();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Recent Videos</h1>
        </div>
        
        {recentVideos.length > 0 ? (
          <div className="space-y-8">
            {recentVideos.map((video) => (
              <Card key={video.videoId} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-medium">{video.title}</h2>
                        {video.playlistName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {video.playlistName}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteVideo(video.videoId)}
                        title="Remove from recent videos"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                      <span>
                        { formatVideoProgress(video.seconds, video.duration)} 
                      </span>
                      <span>
                        {new Date(video.lastUpdated).toLocaleDateString()} {new Date(video.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-4">
                      {activeVideoId === video.videoId ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveVideoId(null)}
                        >
                          Hide Player
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setActiveVideoId(video.videoId)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                      )}
                    </div>
                  </div>
                  {activeVideoId === video.videoId && (
                    <div className="w-full">
                      <VideoPlayer
                        videoId={video.videoId}
                        startTime={video.seconds}
                        onProgressChange={(seconds, duration) => 
                          handleProgressChange(video.videoId, seconds, duration)
                        }
                        autoplay={false}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recent videos found</p>
          </div>
        )}
      </div>
    </div>
  );
}
