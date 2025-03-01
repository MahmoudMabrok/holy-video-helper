
import { useVideoStore } from "@/store/videoStore";
import { useCallback, useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  startTime?: number;
  onProgressChange: (seconds: number, duration: number) => void;
  autoplay?: boolean;
  onVideoEnd?: () => void;
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
  autoplay = false,
  onVideoEnd
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
  const isPlayerInitialized = useRef<boolean>(false);

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
      isPlayerInitialized.current = false;
    }
  }, [saveProgress]);

  useEffect(() => {
    console.log("VideoPlayer mounted/updated:", { videoId, startTime, autoplay });
    startTimeRef.current = startTime;
    hasInitialSeekRef.current = false;

    // Create a container if it doesn't exist
    let container = document.getElementById(playerContainerId);
    if (!container) {
      // Create a dedicated container for this specific video
      container = document.createElement("div");
      container.id = playerContainerId;
      const mainContainer = document.getElementById("youtube-player-container");
      if (mainContainer) {
        // Clear any previous content if videoId changed
        if (containerRef.current !== videoId) {
          mainContainer.innerHTML = '';
        }
        mainContainer.appendChild(container);
      }
    }

    // Only destroy and recreate the player if the videoId changes
    if (containerRef.current !== videoId) {
      cleanupPlayer();
      containerRef.current = videoId;
      isPlayerInitialized.current = false;
    }

    const initYouTubePlayer = () => {
      if (!videoId || !document.getElementById(playerContainerId)) return;

      // If we already have a valid player instance for this video, just update it
      if (playerRef.current && isPlayerInitialized.current) {
        console.log("Updating existing player with:", { videoId, startTime });
        if (startTimeRef.current > 0 && !hasInitialSeekRef.current) {
          try {
            playerRef.current.seekTo(startTimeRef.current, true);
            hasInitialSeekRef.current = true;
            
            if (autoplay) {
              playerRef.current.playVideo();
            }
          } catch (e) {
            console.error("Error seeking/playing video:", e);
            initializeNewPlayer(); // Fallback to new player if there's an error
          }
        }
        return;
      }

      console.log("Initializing new player with:", {
        videoId,
        startTime: startTimeRef.current,
        autoplay
      });
      
      initializeNewPlayer();
    };

    const initializeNewPlayer = () => {
      try {
        // If we have a player instance, destroy it first
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.error("Error destroying player:", e);
          }
          playerRef.current = null;
        }

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
              isPlayerInitialized.current = true;

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
  }, [videoId, autoplay, cleanupPlayer]); // Removed startTime from dependencies to prevent reloads

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
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Debounce progress update
      const now = Date.now();
      if (now - lastUpdateRef.current > 500) {
        lastUpdateRef.current = now;
        console.log('Saving progress on pause:', currentProgressRef.current);
        saveProgress();
      }
    } else if (event.data === window.YT.PlayerState.ENDED) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Save progress on video end
      console.log('Saving progress on video end:', currentProgressRef.current);
      saveProgress();
      
      // Call onVideoEnd callback if provided
      if (onVideoEnd) {
        console.log('Video ended, calling onVideoEnd callback');
        onVideoEnd();
      }
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      <div id="youtube-player-container" className="absolute inset-0" />
    </div>
  );
}
