
import { Trophy, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserStatsProps {
  userPosition: number;
  consecutiveDays: number;
}

export function UserStats({ userPosition, consecutiveDays }: UserStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Current Streak: <span className="text-primary">{consecutiveDays} days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-1">
            Open the app daily to earn consecutive day badges
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
