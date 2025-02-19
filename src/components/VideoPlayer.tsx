
import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  onProgressChange: (seconds: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ videoId, onProgressChange }: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!videoId) return;

    playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
      events: {
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerStateChange = (event: any) => {
    if (!videoId) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = Math.floor(playerRef.current.getCurrentTime());
          onProgressChange(currentTime);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  return (
    <div className="w-full aspect-video">
      <div id={`youtube-player-${videoId}`}>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
