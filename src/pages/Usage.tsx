
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useUsageTimerStore } from "@/store/usageTimerStore";

interface UsageChartData {
  name: string;
  minutes: number;
}

export default function Usage() {
  const navigate = useNavigate();
  const { dailyUsage, loadSavedUsage } = useUsageTimerStore();
  const [chartData, setChartData] = useState<UsageChartData[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [averageMinutes, setAverageMinutes] = useState(0);

  useEffect(() => {
    loadSavedUsage();
    
    // Transform data for the chart and statistics
    if (dailyUsage.length > 0) {
      // Sort by date (oldest to newest)
      const sortedUsage = [...dailyUsage].sort((a, b) => {
        return new Date(a.day).getTime() - new Date(b.day).getTime();
      });
      
      // Format dates for chart display
      const formattedData = sortedUsage.map(item => ({
        name: new Date(item.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        minutes: item.minutes
      }));
      
      setChartData(formattedData);
      
      // Calculate statistics
      const total = sortedUsage.reduce((sum, day) => sum + day.minutes, 0);
      setTotalMinutes(total);
      setAverageMinutes(Math.round(total / sortedUsage.length));
    }
  }, [dailyUsage, loadSavedUsage]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Usage Metrics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{totalMinutes} minutes</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {dailyUsage.length} days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageMinutes} minutes/day
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on days with activity
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Most Active Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyUsage.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {dailyUsage.reduce((max, day) => day.minutes > max.minutes ? day : max, dailyUsage[0]).minutes} minutes
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(dailyUsage.reduce((max, day) => day.minutes > max.minutes ? day : max, dailyUsage[0]).day).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Daily Usage</h2>
        
        {dailyUsage.length > 0 ? (
          <div className="relative">
            {/* Simple bar chart visualization */}
            <div className="h-60 flex items-end space-x-2">
              {chartData.map((data, index) => {
                const maxMinutes = Math.max(...chartData.map(d => d.minutes));
                const height = (data.minutes / maxMinutes) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-500 ease-in-out hover:bg-primary/80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    ></div>
                    <div className="text-xs mt-2 text-muted-foreground">{data.name}</div>
                    <div className="text-xs font-semibold">{data.minutes} min</div>
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis label */}
            <div className="absolute -left-10 top-1/2 -rotate-90 text-xs text-muted-foreground">
              Minutes
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No usage data recorded yet</p>
                <p className="text-sm mt-2">
                  Your app usage will be tracked as you use the application
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Daily Log</h2>
          <div className="space-y-2">
            {dailyUsage.length > 0 ? (
              [...dailyUsage]
                .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
                .map((day) => (
                  <Card key={day.day} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {new Date(day.day).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-bold">{day.minutes} minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No usage logs available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
