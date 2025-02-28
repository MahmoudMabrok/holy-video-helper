
import { create } from 'zustand';

interface LastVideoState {
  videoId: string;
  seconds: number;
}

interface VideoProgress {
  [videoId: string]: {
    seconds: number;
    duration: number;
    lastUpdated: string;
  };
}

interface VideoData {
  seconds: number;
  duration: number;
  lastUpdated: string;
}

interface VideoStore {
  videoProgress: VideoProgress;
  // used to store last video (id) as progress is saved with Video progress
  lastVideoState: LastVideoState | null;
  updateVideoProgress: (videoId: string, seconds: number, duration: number) => void;
  updateLastVideo: (state: LastVideoState) => void;
  loadSavedState: () => void;
  loadSavedVideoState: (videoId: string) => VideoData;
  deleteVideoProgress: (videoId: string) => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videoProgress: {},
  lastVideoState: null,
  updateVideoProgress: (videoId, seconds, duration) => {
    console.log('updateVideoProgress ', videoId, seconds);

    const progressData: VideoData = {
      seconds,
      duration,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(videoId, JSON.stringify(progressData));
  },
  loadSavedVideoState: (videoId) => {
    const savedProgress = localStorage.getItem(videoId);

    console.log('loadSavedVideoState ', videoId, savedProgress);

    if (!savedProgress) {
      return { seconds: 0, duration: 1, lastUpdated: new Date().toISOString() };
    }

    try {
      return JSON.parse(savedProgress);
    } catch (e) {
      console.error('Error parsing saved video state:', e);
      return { seconds: 0, duration: 1, lastUpdated: new Date().toISOString() };
    }
  },
  updateLastVideo: (state) => {
    console.log('save last video ', state);
    
    localStorage.setItem('last_video', JSON.stringify(state));
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
  },
  deleteVideoProgress: (videoId) => {
    console.log('Deleting video progress for:', videoId);
    
    // Remove from localStorage
    localStorage.removeItem(videoId);
    
    // If this was the last video, clear that too
    const { lastVideoState } = get();
    if (lastVideoState && lastVideoState.videoId === videoId) {
      localStorage.removeItem('last_video');
      set({ lastVideoState: null });
    }
    
    // Update the videoProgress state
    const updatedProgress = { ...get().videoProgress };
    delete updatedProgress[videoId];
    set({ videoProgress: updatedProgress });
  }
}));
