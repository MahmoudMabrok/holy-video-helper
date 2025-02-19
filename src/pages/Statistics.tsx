
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
  [key: string]: number;
}

export default function Statistics() {
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    const videoProgress = localStorage.getItem('video_progress');
    const progressData: VideoProgress = videoProgress ? JSON.parse(videoProgress) : {};

    const today = new Date().toLocaleDateString();
    const totalMinutes = Object.values(progressData).reduce((acc, seconds) => {
      return acc + Math.floor(seconds / 60);
    }, 0);

    const stats: DailyStats[] = [{
      date: today,
      minutes: totalMinutes
    }];

    setDailyStats(stats);
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
            {dailyStats.map((stat) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
