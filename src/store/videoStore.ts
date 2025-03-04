
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useBadgeStore } from './badgeStore';

interface LastVideoState {
  videoId: string;
  seconds: number;
  playlist_id: string;
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
  playlist_id: string;
}

interface CompletedVideo {
  videoId: string;
  completedAt: string;
}

interface VideoStore {
  videoProgress: VideoProgress;
  // used to store last video (id) as progress is saved with Video progress
  lastVideoState: LastVideoState | null;
  completedVideos: CompletedVideo[];
  updateVideoProgress: (videoId: string, playlist_id: string, seconds: number, duration: number) => void;
  updateLastVideo: (state: LastVideoState) => void;
  loadSavedState: () => void;
  loadSavedVideoState: (videoId: string) => VideoData;
  deleteVideoProgress: (videoId: string) => void;
  markVideoCompleted: (videoId: string) => void;
  getCompletedVideosCount: () => number;
  isVideoCompleted: (videoId: string) => boolean;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      videoProgress: {},
      lastVideoState: null,
      completedVideos: [],
      
      updateVideoProgress: (videoId, playlist_id, seconds, duration) => {
        console.log('updateVideoProgress ', videoId, seconds);

        // Track video completion if seconds is close to duration (within 5% or less remaining)
        if (duration > 0 && seconds >= duration * 0.95) {
          get().markVideoCompleted(videoId);
        }

        const progressData: VideoData = {
          playlist_id,
          seconds,
          duration,
          lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(videoId, JSON.stringify(progressData));
      },
      
      markVideoCompleted: (videoId) => {
        const { completedVideos } = get();
        
        // Check if already marked as completed
        if (completedVideos.some(v => v.videoId === videoId)) {
          return;
        }
        
        const newCompletedVideos = [
          ...completedVideos,
          { videoId, completedAt: new Date().toISOString() }
        ];
        
        set({ completedVideos: newCompletedVideos });
        
        // Check for video completion badges
        const completedCount = newCompletedVideos.length;
        useBadgeStore.getState().checkVideoCompletionBadges(completedCount);
      },
      
      getCompletedVideosCount: () => {
        return get().completedVideos.length;
      },
      
      isVideoCompleted: (videoId) => {
        return get().completedVideos.some(v => v.videoId === videoId);
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
          
          // Check for video completion badges after loading state
          const completedCount = get().completedVideos.length;
          useBadgeStore.getState().checkVideoCompletionBadges(completedCount);
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
    }),
    {
      name: 'video-store',
    }
  )
);
