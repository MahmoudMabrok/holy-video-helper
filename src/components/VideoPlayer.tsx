import { useVideoStore } from "@/store/videoStore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsageTimerStore } from "@/store/usageTimerStore";

interface VideoPlayerProps {
  videoId: string;
  playlist_id?: string;
  startTime?: number;
  onProgressChange?: (seconds: number, duration: number) => void;
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
  playlist_id = 'aa',
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
  const [videoQuality, setVideoQuality] = useState<string>(localStorage.getItem('video_quality') || 'auto');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(parseFloat(localStorage.getItem('playback_speed') || '1'));
  const isMobile = useIsMobile();
  
  const visibilityChangeRef = useRef<boolean>(false);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState<boolean>(false);

  const { updateVideoProgress, updateLastVideo } = useVideoStore();
  const { startTimer, stopTimer } = useUsageTimerStore();

  useEffect(() => {
    const handleStorageChange = () => {
      const newQuality = localStorage.getItem('video_quality') || 'auto';
      const newSpeed = parseFloat(localStorage.getItem('playback_speed') || '1');
      
      setVideoQuality(newQuality);
      setPlaybackSpeed(newSpeed);
      
      if (playerRef.current && playerRef.current.setPlaybackRate) {
        try {
          playerRef.current.setPlaybackRate(newSpeed);
        } catch (e) {
          console.error('Error setting playback rate:', e);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveProgress = useCallback(() => {
    updateVideoProgress(
      videoId,
      playlist_id,
      currentProgressRef.current.time,
      currentProgressRef.current.duration
    );

    updateLastVideo({ videoId, seconds: currentProgressRef.current.time , playlist_id});
  }, [updateVideoProgress, videoId, updateLastVideo, playlist_id]);

  useEffect(() => {
    if (!isMobile) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityChangeRef.current = true;
        console.log('App went to background, attempting to keep playback alive');
        
        if (playerRef.current && playerRef.current.getPlayerState && 
            playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
          try {
            saveProgress();
            stopTimer();
            setIsAudioOnlyMode(true);
            
            if (playerRef.current.setPlaybackQuality) {
              playerRef.current.setPlaybackQuality('small');
            }
            
            if ('wakeLock' in navigator) {
              navigator.wakeLock.request('screen').catch(err => {
                console.log('Wake Lock error:', err);
              });
            }
          } catch (e) {
            console.error('Error keeping video alive in background:', e);
          }
        }
      } else if (visibilityChangeRef.current) {
        visibilityChangeRef.current = false;
        console.log('App returned from background');
        
        if (playerRef.current && playerRef.current.getPlayerState) {
          try {
            if (isAudioOnlyMode) {
              setIsAudioOnlyMode(false);
              if (playerRef.current.setPlaybackQuality) {
                playerRef.current.setPlaybackQuality(videoQuality === 'auto' ? 'auto' : videoQuality);
              }
            }
            
            if (playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
              playerRef.current.playVideo();
            }
            
            startTimer();
          } catch (e) {
            console.error('Error resuming video after background:', e);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile, playerContainerId, saveProgress, videoQuality, isAudioOnlyMode, startTimer, stopTimer]);

  const cleanupPlayer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

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

    let container = document.getElementById(playerContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = playerContainerId;
      const mainContainer = document.getElementById("youtube-player-container");
      if (mainContainer) {
        if (containerRef.current !== videoId) {
          mainContainer.innerHTML = '';
        }
        mainContainer.appendChild(container);
      }
    }

    if (containerRef.current !== videoId) {
      cleanupPlayer();
      containerRef.current = videoId;
      isPlayerInitialized.current = false;
    }

    const initYouTubePlayer = () => {
      if (!videoId || !document.getElementById(playerContainerId)) return;

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
            initializeNewPlayer();
          }
        }
        return;
      }

      console.log("Initializing new player with:", {
        videoId,
        startTime: startTimeRef.current,
        autoplay,
        quality: videoQuality,
        speed: playbackSpeed
      });
      
      initializeNewPlayer();
    };

    const initializeNewPlayer = () => {
      try {
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
            playsinline: 1,
          },
          height: "100%",
          width: "100%",
          events: {
            onReady: (event: any) => {
              const videoDuration = event.target.getDuration();
              console.log("Player ready, duration:", videoDuration);
              currentProgressRef.current.duration = videoDuration;
              isPlayerInitialized.current = true;

              if (playbackSpeed !== 1) {
                console.log("Setting playback speed to:", playbackSpeed);
                event.target.setPlaybackRate(playbackSpeed);
              }
              
              if (videoQuality !== 'auto') {
                console.log("Setting video quality to:", videoQuality);
                event.target.setPlaybackQuality(videoQuality);
              }

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
  }, [videoId, autoplay, cleanupPlayer, videoQuality, playbackSpeed]); 

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
      
      console.log('Saving progress on video end:', currentProgressRef.current);
      saveProgress();
      
      if (onVideoEnd) {
        console.log('Video ended, calling onVideoEnd callback');
        onVideoEnd();
      }
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      <div id="youtube-player-container" className="absolute inset-0" />
      {isAudioOnlyMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 text-white">
          <p className="text-center p-4">
            Background playback active (audio only). 
            <br />Tap to restore video.
          </p>
        </div>
      )}
    </div>
  );
}
