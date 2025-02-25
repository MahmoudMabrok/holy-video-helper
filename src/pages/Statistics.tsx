
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyStats {
  date: string;
  minutes: number;
}

interface VideoProgress {
  [key: string]: {
    seconds: number;
    duration: number;
    lastUpdated: string;
  };
}

export default function Statistics() {
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    const videoProgress = localStorage.getItem('video_progress');
    if (!videoProgress) return;

    try {
      const progressData: VideoProgress = JSON.parse(videoProgress);
      const statsMap: { [date: string]: number } = {};

      // Process each video's progress data
      Object.values(progressData).forEach(({ seconds, lastUpdated }) => {
        const date = new Date(lastUpdated).toLocaleDateString();
        if (!statsMap[date]) {
          statsMap[date] = 0;
        }
        statsMap[date] += Math.floor(seconds / 60);
      });

      // Convert to array and sort by date
      const stats: DailyStats[] = Object.entries(statsMap).map(([date, minutes]) => ({
        date,
        minutes
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDailyStats(stats);
    } catch (e) {
      console.error('Error processing video progress data:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 bg-background z-10 p-4 border-b flex items-center gap-4">
          <Button
            variant="ghost"
            className="group"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Watch Statistics</h1>
        </div>

        <div className="p-4">
          <div className="grid gap-4">
            {dailyStats.length > 0 ? (
              dailyStats.map((stat) => (
                <Card key={stat.date}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.date}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.minutes} minutes</div>
                    <p className="text-xs text-muted-foreground">
                      Total watch time
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No watch statistics available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
