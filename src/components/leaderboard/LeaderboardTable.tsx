
import { User, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeaderboardEntry {
  id: string;
  total_minutes: number;
  last_updated: string;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  userId: string;
  isLoading: boolean;
}

export function LeaderboardTable({ leaderboard, userId, isLoading }: LeaderboardTableProps) {
  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading leaderboard data...</p>
      </div>
    );
  }

  return (
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
  );
}
