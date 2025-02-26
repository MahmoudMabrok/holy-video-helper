
import { useVideoStore } from "@/store/videoStore";
import { useCallback, useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  startTime?: number;
  onProgressChange: (seconds: number, duration: number) => void;
  autoplay?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ 
  videoId, 
  startTime = 0, 
  onProgressChange,
  autoplay = false 
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<string>(videoId);
  const startTimeRef = useRef<number>(startTime);
  const hasInitialSeekRef = useRef<boolean>(false);
  const currentProgressRef = useRef<{ time: number; duration: number }>({
    time: 0,
    duration: 0,
  });
  const playerContainerId = `youtube-player-${videoId}`;
  const lastUpdateRef = useRef<number>(0);

  const { updateVideoProgress, updateLastVideo } = useVideoStore();

  const saveProgress = useCallback(() => {
    updateVideoProgress(
      videoId,
      currentProgressRef.current.time,
      currentProgressRef.current.duration
    );

    updateLastVideo({ videoId, seconds: currentProgressRef.current.time });
  }, [videoId, updateVideoProgress, updateLastVideo]);

  const cleanupPlayer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Save progress before cleanup
    if (currentProgressRef.current.time > 0 && currentProgressRef.current.duration > 0) {
      console.log('Saving progress on cleanup:', currentProgressRef.current);
      saveProgress();
    }

    if (playerRef.current && playerRef.current.destroy) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Error destroying player:', e);
      }
      playerRef.current = null;
    }
  }, [saveProgress]);

  useEffect(() => {
    console.log("VideoPlayer mounted/updated:", { videoId, startTime, autoplay });
    startTimeRef.current = startTime;
    hasInitialSeekRef.current = false;

    let container = document.getElementById(playerContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = playerContainerId;
      document
        .getElementById("youtube-player-container")
        ?.appendChild(container);
    }

    if (containerRef.current !== videoId) {
      cleanupPlayer();
      containerRef.current = videoId;
    }

    const initYouTubePlayer = () => {
      if (!videoId || !document.getElementById(playerContainerId)) return;

      console.log("Initializing player with:", {
        videoId,
        startTime: startTimeRef.current,
        autoplay
      });

      if (playerRef.current) {
        try {
          if (autoplay) {
            playerRef.current.loadVideoById({
              videoId: videoId,
              startSeconds: startTimeRef.current,
            });
          } else {
            playerRef.current.cueVideoById({
              videoId: videoId,
              startSeconds: startTimeRef.current,
            });
          }
          return;
        } catch (e) {
          console.error("Error loading video:", e);
          playerRef.current = null;
          initializeNewPlayer();
        }
        return;
      }

      initializeNewPlayer();
    };

    const initializeNewPlayer = () => {
      try {
        playerRef.current = new window.YT.Player(playerContainerId, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            start: startTimeRef.current,
          },
          height: "100%",
          width: "100%",
          events: {
            onReady: (event: any) => {
              const videoDuration = event.target.getDuration();
              console.log("Player ready, duration:", videoDuration);
              currentProgressRef.current.duration = videoDuration;

              if (startTimeRef.current > 0) {
                console.log("Seeking to startTime:", startTimeRef.current);
                event.target.seekTo(startTimeRef.current, true);
                
                if (autoplay) {
                  event.target.playVideo();
                }
              }
            },
            onStateChange: onPlayerStateChange,
            onError: (event: any) => {
              console.error("YouTube player error:", event.data);
            },
          },
        });
      } catch (e) {
        console.error("Error creating YouTube player:", e);
      }
    };

    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    } else {
      initYouTubePlayer();
    }

    return cleanupPlayer;
  }, [videoId, startTime, autoplay, cleanupPlayer]);

  const onPlayerStateChange = (event: any) => {
    if (!videoId || !playerRef.current) return;

    console.log('Player state changed:', event.data);

    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!hasInitialSeekRef.current && startTimeRef.current > 0) {
        hasInitialSeekRef.current = true;
        console.log('Initial seek to:', startTimeRef.current);
        playerRef.current.seekTo(startTimeRef.current, true);
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          try {
            const time = Math.floor(playerRef.current.getCurrentTime());
            const duration = playerRef.current.getDuration();
            currentProgressRef.current = { time, duration };
          } catch (e) {
            console.error('Error getting player time:', e);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }
        }
      }, 1000);
    } else if (event.data === window.YT.PlayerState.PAUSED || 
               event.data === window.YT.PlayerState.ENDED) {
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Debounce progress update
      const now = Date.now();
      if (now - lastUpdateRef.current > 500) {
        lastUpdateRef.current = now;
        console.log('Saving progress on pause/end:', currentProgressRef.current);
        saveProgress();
      }
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      <div id="youtube-player-container" className="absolute inset-0" />
    </div>
  );
}
