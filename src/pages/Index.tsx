import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect, lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "@/store/videoStore";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BarChart3 } from "lucide-react";
import { formatVideoProgress } from "@/lib/utils";

// Lazy load the VideoPlayer component
const VideoPlayer = lazy(() =>
  import("@/components/VideoPlayer").then((mod) => ({
    default: mod.VideoPlayer,
  }))
);

const ID_COUNTER = "1306546/t/0";

const Index = () => {
  const navigate = useNavigate();
  const [showLastVideo, setShowLastVideo] = useState(false);

  const { lastVideoState, loadSavedState, loadSavedVideoState } =
    useVideoStore();

  const { startTimer, stopTimer, loadSavedUsage } = useUsageTimerStore();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const sections = data?.sections;

  useEffect(() => {
    // Load saved video state
    loadSavedState();

    // Load saved usage data
    loadSavedUsage();

    // Start the timer when the page loads
    startTimer();

    // Stop the timer when the component unmounts
    return () => {
      stopTimer();
    };
  }, [loadSavedState, loadSavedUsage, startTimer, stopTimer]);

  useEffect(() => {
    fetch(`https://www.freevisitorcounters.com/en/home/counter/${ID_COUNTER}`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "priority": "u=1",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "script",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
        "sec-fetch-storage-access": "active"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    });
  }, []);

  const handlePlaylistClick = (playlistId: string, playlistName: string) => {
    console.log("Navigating to playlist", playlistId, playlistName);

    // Navigate using the playlist ID with the name as a URL parameter
    navigate(`/playlist/${playlistId}?name=${encodeURIComponent(playlistName)}`);
  };

  const handleContinueWatching = () => {
    if (!lastVideoState) return;

    // Toggle the video player visibility
    setShowLastVideo(!showLastVideo);
  };

  const navigateToPlaylist = () => {
    if (!lastVideoState) return;
    console.log("Navigating to playlist", lastVideoState.playlist_id);


    // Navigate to the playlist that contains this video
    if (sections && lastVideoState.playlist_id) {
      navigate(`/playlist/${lastVideoState.playlist_id}`);
      return;
    }

    // If we couldn't find the playlist, go to recent videos
    navigate("/recent");
  };

  const getLastVideoInfo = () => {
    if (!lastVideoState || !sections)
      return { title: "Unknown", progress: 0, duration: 0 };

    const videoData = loadSavedVideoState(lastVideoState.videoId);
    let videoTitle = "Unknown Video";

    // Find the video title
    for (const section of sections) {
      for (const playlist of section.playlists) {
        const video = playlist.videos.find((v) => {
          const idMatch = v.url.match(/(?:v=|\/)([\w-]{11})(?:\?|$|&)/);
          return idMatch && idMatch[1] === lastVideoState.videoId;
        });

        if (video) {
          videoTitle = video.title;
          break;
        }
      }
    }

    return {
      title: videoTitle,
      progress: videoData.seconds,
      duration: videoData.duration,
    };
  };

  // Calculate total playlists and videos - memoized by React Query's cache
  const calculateTotals = () => {
    if (!sections) return { playlists: 0, videos: 0 };

    return { playlists: data.playlist_count, videos: data.total_video_count };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !sections) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 73px)" }}
        >
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-500">
              Error Loading Content
            </h1>
            <p className="text-muted-foreground">
              Please try refreshing the page. If the issue persists, please clear data from the settings page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lastVideo = lastVideoState ? getLastVideoInfo() : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4" >
        {/* Smart Banner with totals */}
        <div className="w-full py-4 animate-fade-up">
          <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      Content Overview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      We have{" "}
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {totals.playlists}
                      </span>{" "}
                      playlists with a total of{" "}
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {totals.videos}
                      </span>{" "}
                      videos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {lastVideo && (
          <div className="w-full py-4 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Continue Watching</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatVideoProgress(
                        lastVideo.progress,
                        lastVideo.duration
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleContinueWatching}>
                      <Play className="mr-2 h-4 w-4" />
                      {showLastVideo ? "Hide Player" : "Play Video"}
                    </Button>
                    <Button variant="outline" onClick={navigateToPlaylist}>
                      Go to Playlist
                    </Button>
                  </div>
                </div>

                {showLastVideo && lastVideoState && (
                  <div className="mt-4">
                    <Suspense
                      fallback={
                        <div className="w-full aspect-video bg-muted flex items-center justify-center">
                          Loading player...
                        </div>
                      }
                    >
                      <VideoPlayer
                        videoId={lastVideoState.videoId}
                        startTime={lastVideo.progress}
                        onProgressChange={() => { }}
                        autoplay={false}
                      />
                    </Suspense>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-8 py-4">
          {sections.map((section) => (
            <SectionCard
              key={section.title}
              section={section}
              onPlaylistClick={handlePlaylistClick}
            />
          ))}
        </div>

        <div className="w-full py-4 animate-fade-up flex items-center justify-center">
          <img className="my-16 " src={`https://www.freevisitorcounters.com/en/counter/render/${ID_COUNTER}`} />
        </div>

      </div>
    </div>
  );
};

export default Index;
