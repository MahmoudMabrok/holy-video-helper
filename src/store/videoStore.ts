
import { create } from 'zustand';

interface LastVideoState {
  playlistId: string;
  videoId: string;
  position: number;
}

interface VideoProgress {
  [videoId: string]: {
    seconds: number;
    duration: number;
    lastUpdated: string;
  };
}

interface VideoStore {
  videoProgress: VideoProgress;
  lastVideoState: LastVideoState | null;
  updateProgress: (videoId: string, seconds: number, duration: number) => void;
  updateLastVideo: (state: LastVideoState) => void;
  loadSavedState: () => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videoProgress: {},
  lastVideoState: null,
  updateProgress: (videoId, seconds, duration) => {
    const progressData = {
      seconds,
      duration,
      lastUpdated: new Date().toISOString(),
    };
    
    set(state => ({
      videoProgress: {
        ...state.videoProgress,
        [videoId]: progressData
      }
    }));
  },
  updateLastVideo: (state) => {
    set({ lastVideoState: state });
  },
  loadSavedState: () => {
    try {
      const savedProgress = localStorage.getItem('video_progress');
      const lastVideo = localStorage.getItem('last_video');
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        set({ videoProgress: parsedProgress });
      }
      
      if (lastVideo) {
        const parsedLastVideo = JSON.parse(lastVideo);
        set({ lastVideoState: parsedLastVideo });
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
  }
}));

