import { useVideoStore } from "@/store/videoStore";
import { useCallback, useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  startTime?: number;
  onProgressChange: (seconds: number, duration: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ videoId, startTime = 0 }: VideoPlayerProps) {
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
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { updateVideoProgress, updateLastVideo } = useVideoStore();

  const saveProgress = useCallback(() => {
    updateVideoProgress(
      videoId,
      currentProgressRef.current.time,
      currentProgressRef.current.duration
    );

    updateLastVideo({ videoId, seconds: currentProgressRef.current.time });
  }, [videoId, currentProgressRef, updateVideoProgress, updateLastVideo]);

  useEffect(() => {
    console.log("VideoPlayer mounted/updated:", { videoId, startTime });
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
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      containerRef.current = videoId;
    }

    const initYouTubePlayer = () => {
      if (!videoId || !document.getElementById(playerContainerId)) return;

      console.log("Initializing player with:", {
        videoId,
        startTime: startTimeRef.current,
      });

      if (playerRef.current) {
        try {
          playerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: startTimeRef.current,
          });
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
            autoplay: 1,
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
              }
              event.target.playVideo();
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

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      if (
        currentProgressRef.current.time > 0 &&
        currentProgressRef.current.duration > 0
      ) {
        console.log(
          "Saving final progress on unmount:",
          currentProgressRef.current
        );
        saveProgress();
      }

      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, startTime, playerContainerId, saveProgress]);

  useEffect(() => {
    return () => {
      console.log("VideoPlayer cleared", videoId);

      saveProgress();
    };
  }, [videoId, currentProgressRef, saveProgress]);

  const onPlayerStateChange = (event: any) => {
    if (!videoId || !playerRef.current) return;

    console.log("Player state changed:", event.data);

    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!hasInitialSeekRef.current && startTimeRef.current > 0) {
        hasInitialSeekRef.current = true;
        console.log("Initial seek to:", startTimeRef.current);
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
            console.error("Error getting player time:", e);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }
        }
      }, 1000);
    } else if (
      event.data === window.YT.PlayerState.PAUSED ||
      event.data === window.YT.PlayerState.ENDED
    ) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Debounce the progress update to prevent rapid state updates
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }

      progressUpdateTimeoutRef.current = setTimeout(() => {
        console.log(
          "Saving progress on pause/end:",
          currentProgressRef.current
        );
        saveProgress();
      }, 300);
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      <div id="youtube-player-container" className="absolute inset-0" />
    </div>
  );
}
