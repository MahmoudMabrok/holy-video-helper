
import { useEffect, useRef, useState } from "react";

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

export function VideoPlayer({ videoId, startTime = 0, onProgressChange }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<string>(videoId);
  const [duration, setDuration] = useState<number>(0);
  const startTimeRef = useRef<number>(startTime);
  const hasInitialSeekRef = useRef<boolean>(false);
  const playerContainerId = `youtube-player-${videoId}`;

  useEffect(() => {
    console.log('VideoPlayer mounted/updated:', { videoId, startTime });
    startTimeRef.current = startTime;
    hasInitialSeekRef.current = false;
    
    // Create container if it doesn't exist
    let container = document.getElementById(playerContainerId);
    if (!container) {
      container = document.createElement('div');
      container.id = playerContainerId;
      document.getElementById('youtube-player-container')?.appendChild(container);
    }

    // Reset state when videoId changes
    if (containerRef.current !== videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      containerRef.current = videoId;
    }

    const initYouTubePlayer = () => {
      if (!videoId || !document.getElementById(playerContainerId)) return;
      
      console.log('Initializing player with:', { videoId, startTime: startTimeRef.current });
      
      if (playerRef.current) {
        try {
          playerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: startTimeRef.current
          });
        } catch (e) {
          console.error('Error loading video:', e);
          // Recreate player if loading fails
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
            start: startTimeRef.current
          },
          height: '100%',
          width: '100%',
          events: {
            onReady: (event: any) => {
              const videoDuration = event.target.getDuration();
              console.log('Player ready, duration:', videoDuration);
              setDuration(videoDuration);
              
              // If we have a startTime, seek to it
              if (startTimeRef.current > 0) {
                console.log('Seeking to startTime:', startTimeRef.current);
                event.target.seekTo(startTimeRef.current, true);
              }
              event.target.playVideo();
            },
            onStateChange: onPlayerStateChange,
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
            }
          },
        });
      } catch (e) {
        console.error('Error creating YouTube player:', e);
      }
    };

    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYouTubePlayer;
    } else {
      initYouTubePlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, startTime]);

  const onPlayerStateChange = (event: any) => {
    if (!videoId || !playerRef.current) return;

    console.log('Player state changed:', event.data);

    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!hasInitialSeekRef.current && startTimeRef.current > 0) {
        hasInitialSeekRef.current = true;
        console.log('Initial seek to:', startTimeRef.current);
        playerRef.current.seekTo(startTimeRef.current, true);
      }

      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          try {
            const currentTime = Math.floor(playerRef.current.getCurrentTime());
            const videoDuration = playerRef.current.getDuration();
            console.log('Progress update:', { currentTime, videoDuration });
            onProgressChange(currentTime, videoDuration);
          } catch (e) {
            console.error('Error getting player time:', e);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      <div id="youtube-player-container" className="absolute inset-0" />
    </div>
  );
}
