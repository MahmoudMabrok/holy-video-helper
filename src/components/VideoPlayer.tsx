
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

  useEffect(() => {
    console.log('VideoPlayer mounted/updated:', { videoId, startTime });
    // Cleanup previous player when videoId changes
    if (containerRef.current !== videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      containerRef.current = videoId;
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => initializePlayer();
    } else {
      initializePlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, startTime]);

  const initializePlayer = () => {
    if (!videoId) return;
    console.log('Initializing player with:', { videoId, startTime: startTimeRef.current });

    if (playerRef.current) {
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: startTimeRef.current
      });
      return;
    }

    playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
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
          event.target.playVideo();
        },
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerStateChange = (event: any) => {
    if (!videoId) return;

    console.log('Player state changed:', event.data);

    if (event.data === window.YT.PlayerState.PLAYING) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = Math.floor(playerRef.current.getCurrentTime());
          const videoDuration = playerRef.current.getDuration();
          console.log('Progress update:', { currentTime, videoDuration });
          onProgressChange(currentTime, videoDuration);
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
      <div id={`youtube-player-${videoId}`} className="absolute inset-0" />
    </div>
  );
}
