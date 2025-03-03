
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Clock, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { userId, leaderboard, fetchLeaderboard, syncWithLeaderboard } = useUsageTimerStore();
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
      toast.success("Your usage time has been updated on the leaderboard");
    } catch (error) {
      console.error("Error syncing with leaderboard:", error);
      toast.error("Failed to update your usage time");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Find user's position in leaderboard
  const userPosition = leaderboard.findIndex(entry => entry.id === userId) + 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="group"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold">Usage Leaderboard</h1>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Sync My Time
          </Button>
        </div>

        <div className="grid gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Your Leaderboard Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <div className="text-2xl font-bold">
                  {userPosition > 0 ? `#${userPosition}` : "Not ranked yet"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sync your usage time to climb the leaderboard
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-amber-500" />
          Top Users by App Usage Time
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard data...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] w-full">
                <div className="relative">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Rank</th>
                        <th className="text-left p-4 font-medium">User ID</th>
                        <th className="text-left p-4 font-medium">Total Time</th>
                        <th className="text-left p-4 font-medium">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length > 0 ? (
                        leaderboard.map((entry, index) => {
                          const isCurrentUser = entry.id === userId;
                          return (
                            <tr
                              key={entry.id}
                              className={`
                                border-b 
                                ${isCurrentUser ? "bg-primary/10 font-medium" : ""}
                                ${index % 2 === 0 && !isCurrentUser ? "bg-muted/30" : ""}
                              `}
                            >
                              <td className="p-4">#{index + 1}</td>
                              <td className="p-4 flex items-center">
                                <User className={`w-4 h-4 mr-2 ${isCurrentUser ? "text-primary" : "text-muted-foreground"}`} />
                                <span>{isCurrentUser ? "You" : entry.id.substring(0, 8)}</span>
                                {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">({entry.id.substring(0, 8)}...)</span>}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <Clock className={`w-4 h-4 mr-2 ${isCurrentUser ? "text-primary" : "text-muted-foreground"}`} />
                                  {formatTime(entry.total_minutes)}
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground text-sm">
                                {new Date(entry.last_updated).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">
                            No leaderboard data available yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
