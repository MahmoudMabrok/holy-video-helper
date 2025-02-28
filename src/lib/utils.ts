import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatVideoProgress = (progress: number, duration: number) => {
  const formatTime = (time: number) => `${Math.floor(time / 60)}:${(time % 60).toFixed(0).padStart(2, "0")}`;
  const percentage = ((progress / duration) * 100).toFixed(0);
  return `Progress: ${formatTime(progress)} / ${formatTime(duration)} (${percentage}%)`;
};
