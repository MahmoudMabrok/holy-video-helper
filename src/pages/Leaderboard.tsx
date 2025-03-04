
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { useBadgeStore } from "@/store/badgeStore";
import { useVideoStore } from "@/store/videoStore";

// Import our new components
import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { UserStats } from "@/components/leaderboard/UserStats";
import { UserAchievements } from "@/components/leaderboard/UserAchievements";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export default function Leaderboard() {
  const { userId, leaderboard, fetchLeaderboard, syncWithLeaderboard, getTotalUsageMinutes } = useUsageTimerStore();
  const { badges, consecutiveDays } = useBadgeStore();
  const { getCompletedVideosCount } = useVideoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      await fetchLeaderboard();
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncWithLeaderboard();
      
      // Update badges based on current stats
      const totalMinutes = getTotalUsageMinutes();
      useBadgeStore.getState().checkTimeBadges(totalMinutes);
      
      const completedVideos = getCompletedVideosCount();
      useBadgeStore.getState().checkVideoCompletionBadges(completedVideos);
      
      toast.success("Your usage time has been updated on the leaderboard");
    } catch (error) {
      console.error("Error syncing with leaderboard:", error);
      toast.error("Failed to update your usage time");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Find user's position in leaderboard
  const userPosition = leaderboard.findIndex(entry => entry.id === userId) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <LeaderboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        <div className="grid gap-6 mb-8">
          <UserStats userPosition={userPosition} consecutiveDays={consecutiveDays} />
          <UserAchievements badges={badges} />
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-amber-500" />
          Top Users by App Usage Time
        </h2>

        <LeaderboardTable 
          leaderboard={leaderboard} 
          userId={userId} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
