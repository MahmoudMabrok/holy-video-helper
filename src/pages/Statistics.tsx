
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { Header } from "@/components/Header";

interface VideoProgress {
  [key: string]: {
    seconds: number;
    duration: number;
    lastUpdated: string;
  };
}

export default function Statistics() {
  const navigate = useNavigate();
  const { dailyUsage, loadSavedUsage } = useUsageTimerStore();
  const [videoStats, setVideoStats] = useState<{ count: number, totalMinutes: number }>({ count: 0, totalMinutes: 0 });

  useEffect(() => {
    loadSavedUsage();
    
    // Calculate video stats
    const allKeys = Object.keys(localStorage);
    const videoKeys = allKeys.filter(key => /^[A-Za-z0-9_-]{11}$/.test(key));
    
    let totalDuration = 0;
    videoKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data && data.seconds) {
          totalDuration += data.seconds;
        }
      } catch (e) {
        console.error('Error parsing video data:', e);
      }
    });
    
    setVideoStats({
      count: videoKeys.length,
      totalMinutes: Math.floor(totalDuration / 60)
    });
  }, []);

  // Sort usage data by date (newest first)
  const sortedUsage = [...dailyUsage].sort((a, b) => {
    const dateA = new Date(a.day);
    const dateB = new Date(b.day);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6 gap-4">
          <Button
            variant="ghost"
            className="group"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Statistics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Videos Watched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <PlayCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{videoStats.count}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total video minutes: {videoStats.totalMinutes}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total App Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  {dailyUsage.reduce((total, day) => total + day.minutes, 0)} minutes
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {dailyUsage.length} days
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Daily Usage</h2>
        <div className="grid gap-4">
          {sortedUsage.length > 0 ? (
            sortedUsage.map((stat) => (
              <Card key={stat.day}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {new Date(stat.day).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.minutes} minutes</div>
                  <p className="text-xs text-muted-foreground">
                    App usage time
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No usage statistics available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
