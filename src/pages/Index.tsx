
import { useQuery } from "@tanstack/react-query";
import { fetchContent, PlaylistEntry } from "@/services/api";
import { SectionCard } from "@/components/SectionCard";
import { useState, useEffect, lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "@/store/videoStore";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, ListChecks, Settings2 } from "lucide-react";
import { formatVideoProgress } from "@/lib/utils";

// Lazy load the VideoPlayer component
const VideoPlayer = lazy(() =>
  import("@/components/VideoPlayer").then((mod) => ({
    default: mod.VideoPlayer,
  }))
);

const ID_COUNTER = "1306546/t/0";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getAppMode(): 'basic' | 'advanced' {
  return (localStorage.getItem('app_mode') as 'basic' | 'advanced') || 'basic';
}

function getAdvancedDataUrl(): string {
  return localStorage.getItem('advanced_data_url') || '';
}

function loadSelectedPlaylists(): PlaylistEntry[] {
  try {
    // Selected ids
    const ids: string[] = JSON.parse(localStorage.getItem('advanced_selected_playlists') || '[]');
    // We store the full list title alongside as well so we can render names
    // Both are written by Settings when the user saves
    const titlesMap: Record<string, string> = JSON.parse(
      localStorage.getItem('advanced_playlist_titles') || '{}'
    );
    return ids.map((id) => ({ id, title: titlesMap[id] || id }));
  } catch {
    return [];
  }
}

// ─── Advanced mode home view ──────────────────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  const [showLastVideo, setShowLastVideo] = useState(false);
  const [appMode, setAppMode] = useState<'basic' | 'advanced'>(getAppMode);
  const [advancedUrl, setAdvancedUrl] = useState<string>(getAdvancedDataUrl);
  const [selectedPlaylists, setSelectedPlaylists] = useState<PlaylistEntry[]>(loadSelectedPlaylists);

  const { lastVideoState, loadSavedState, loadSavedVideoState } = useVideoStore();
  const { startTimer, stopTimer, loadSavedUsage, syncWithLeaderboard } = useUsageTimerStore();

  // ── Basic mode query ──────────────────────────────────────────────────────
  const {
    data,
    isLoading: basicLoading,
    error: basicError,
  } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: appMode === 'basic',
  });

  const sections = data?.sections;
  const isLoading = appMode === 'basic' ? basicLoading : false;

  // Re-sync state when settings are saved  
  useEffect(() => {
    const onStorage = () => {
      setAppMode(getAppMode());
      setAdvancedUrl(getAdvancedDataUrl());
      setSelectedPlaylists(loadSelectedPlaylists());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    loadSavedState();
    loadSavedUsage();
    startTimer();
    return () => { stopTimer(); };
  }, [loadSavedState, loadSavedUsage, startTimer, stopTimer, syncWithLeaderboard]);

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

    syncWithLeaderboard().catch(err => {
      console.error("Error syncing with leaderboard on initial load:", err);
    });
  }, []);

  const handlePlaylistClick = (playlistId: string, playlistName: string) => {
    navigate(`/playlist/${playlistId}?name=${encodeURIComponent(playlistName)}`);
  };

  const handleContinueWatching = () => {
    if (!lastVideoState) return;
    setShowLastVideo(!showLastVideo);
  };

  const navigateToPlaylist = () => {
    if (!lastVideoState) return;
    if (sections && lastVideoState.playlist_id) {
      navigate(`/playlist/${lastVideoState.playlist_id}`);
      return;
    }
    navigate("/recent");
  };

  const getLastVideoInfo = () => {
    if (!lastVideoState || !sections)
      return { title: "Unknown", progress: 0, duration: 0 };

    const videoData = loadSavedVideoState(lastVideoState.videoId);
    let videoTitle = "Unknown Video";

    for (const section of sections) {
      for (const playlist of section.playlists) {
        const video = playlist.videos.find((v) => {
          const idMatch = v.url.match(/(?:v=|\/)([\\w-]{11})(?:\\?|$|&)/);
          return idMatch && idMatch[1] === lastVideoState.videoId;
        });
        if (video) { videoTitle = video.title; break; }
      }
    }

    return { title: videoTitle, progress: videoData.seconds, duration: videoData.duration };
  };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Advanced mode view ────────────────────────────────────────────────────
  if (appMode === 'advanced') {
    if (!advancedUrl || selectedPlaylists.length === 0) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
            <div className="text-center space-y-4 px-4">
              <ListChecks className="mx-auto h-12 w-12 text-purple-400" />
              <h1 className="text-2xl font-semibold">No playlists selected</h1>
              <p className="text-muted-foreground">
                Go to <strong>Settings</strong>, enter your Advanced Data URL and pick the playlists you want.
              </p>
              <Button onClick={() => navigate('/settings')}>
                <Settings2 className="mr-2 h-4 w-4" />
                Open Settings
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-4 space-y-6">
          {/* Mode badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <ListChecks className="h-4 w-4" />
            Advanced Mode — {selectedPlaylists.length} playlist{selectedPlaylists.length !== 1 ? 's' : ''}
          </div>

          {/* Playlist cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedPlaylists.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePlaylistClick(p.id, p.title)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Play className="h-5 w-5 text-purple-500 shrink-0" />
                  <span className="font-medium line-clamp-2">{p.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full py-4 flex items-center justify-center">
            <img
              className="my-8"
              src={`https://www.freevisitorcounters.com/en/counter/render/${ID_COUNTER}`}
              alt="Visitor Counter"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Basic mode error ──────────────────────────────────────────────────────
  if (basicError || !sections) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-500">Error Loading Content</h1>
            <p className="text-muted-foreground">
              Please try refreshing the page. If the issue persists, clear data from the settings page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lastVideo = lastVideoState ? getLastVideoInfo() : null;
  const totals = { playlists: data.playlist_count, videos: data.total_video_count };

  // ── Basic mode main view ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        {/* Smart Banner */}
        <div className="w-full py-4 animate-fade-up">
          <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Content Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    We have{" "}
                    <span className="font-medium text-purple-600 dark:text-purple-400">{totals.playlists}</span>{" "}
                    playlists with a total of{" "}
                    <span className="font-medium text-purple-600 dark:text-purple-400">{totals.videos}</span>{" "}
                    videos
                  </p>
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
                    <h3 className="font-medium">{lastVideo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatVideoProgress(lastVideo.progress, lastVideo.duration)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleContinueWatching}>
                      <Play className="mr-2 h-4 w-4" />
                      {showLastVideo ? "Hide Player" : "Play Video"}
                    </Button>
                    <Button variant="outline" onClick={navigateToPlaylist}>Go to Playlist</Button>
                  </div>
                </div>

                {showLastVideo && lastVideoState && (
                  <div className="mt-4">
                    <Suspense fallback={
                      <div className="w-full aspect-video bg-muted flex items-center justify-center">
                        Loading player...
                      </div>
                    }>
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
          <img className="my-16" src={`https://www.freevisitorcounters.com/en/counter/render/${ID_COUNTER}`} alt="Visitor Counter" />
        </div>
      </div>
    </div>
  );
};

export default Index;
