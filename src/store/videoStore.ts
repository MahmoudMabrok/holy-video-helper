
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
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videoProgress: {},
  lastVideoState: null,
  updateVideoProgress: (videoId, seconds, duration) => {
    console.log('updateVideoProgress ',videoId, seconds);

    const progressData : VideoData = {
      seconds,
      duration,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(videoId,JSON.stringify(progressData));
  },
  loadSavedVideoState: (videoId) => {
    const savedProgress = localStorage.getItem(videoId);

    console.log('loadSavedVideoState ',videoId, savedProgress);

    return savedProgress ? JSON.parse(savedProgress) : { second: 0, duration:1};
  }, 
  updateLastVideo: (state) => {
    console.log('save last video ',state);
    
    localStorage.setItem('last_video',JSON.stringify(state));
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

