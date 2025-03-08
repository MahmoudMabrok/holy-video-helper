
import { Badge as BadgeType, BadgeType as BadgeTypeEnum } from "@/store/badgeStore";
import { Badge } from "@/components/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useUsageTimerStore } from "@/store/usageTimerStore";
import { useVideoStore } from "@/store/videoStore";
import { useBadgeStore } from "@/store/badgeStore";

interface UserAchievementsProps {
  badges: Record<BadgeTypeEnum, BadgeType>;
}

export function UserAchievements({ badges }: UserAchievementsProps) {
  // Get store data for progress calculations
  const { getTotalUsageMinutes } = useUsageTimerStore();
  const { getCompletedVideosCount } = useVideoStore();
  const { consecutiveDays } = useBadgeStore();
  
  // Calculate current statistics
  const totalWatchMinutes = getTotalUsageMinutes();
  const completedVideos = getCompletedVideosCount();
  
  // Group badges by type, ensuring we handle potentially undefined badges
  const timeBadges: BadgeType[] = ['time-30min', 'time-1hour', 'time-5hour']
    .map(id => badges[id as BadgeTypeEnum])
    .filter(Boolean); // Filter out any undefined values

  const videoCompletionBadges: BadgeType[] = ['video-first', 'video-5complete']
    .map(id => badges[id as BadgeTypeEnum])
    .filter(Boolean);

  const appUsageBadges: BadgeType[] = ['app-first-open', 'app-5-days', 'app-10-days', 'app-20-days']
    .map(id => badges[id as BadgeTypeEnum])
    .filter(Boolean);

  // Helper function to calculate progress percentage
  const calculateProgress = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Time badge thresholds in minutes
  const timeThresholds = {
    'time-30min': 30,
    'time-1hour': 60,
    'time-5hour': 300
  };

  // Video completion thresholds
  const videoThresholds = {
    'video-first': 1,
    'video-5complete': 5
  };

  // App usage thresholds in days
  const appUsageThresholds = {
    'app-first-open': 1,
    'app-5-days': 5,
    'app-10-days': 10,
    'app-20-days': 20
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Your Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="time">
          <TabsList className="mb-4">
            <TabsTrigger value="time">Watch Time</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="app">App Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="time" className="mt-0">
            <div className="space-y-4">
              {timeBadges.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {timeBadges.map(badge => (
                      <Badge key={badge.id} badge={badge} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {timeBadges.map(badge => !badge.earned && (
                      <div key={`progress-${badge.id}`} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{badge.name}</span>
                          <span>{totalWatchMinutes}/{timeThresholds[badge.id as keyof typeof timeThresholds]} minutes</span>
                        </div>
                        <Progress value={calculateProgress(totalWatchMinutes, timeThresholds[badge.id as keyof typeof timeThresholds])} />
                      </div>
                    ))}
                    {timeBadges.every(badge => badge.earned) && (
                      <p className="text-sm text-muted-foreground">All watch time badges earned! 🎉</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No watch time badges earned yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <div className="space-y-4">
              {videoCompletionBadges.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {videoCompletionBadges.map(badge => (
                      <Badge key={badge.id} badge={badge} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {videoCompletionBadges.map(badge => !badge.earned && (
                      <div key={`progress-${badge.id}`} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{badge.name}</span>
                          <span>{completedVideos}/{videoThresholds[badge.id as keyof typeof videoThresholds]} videos</span>
                        </div>
                        <Progress value={calculateProgress(completedVideos, videoThresholds[badge.id as keyof typeof videoThresholds])} />
                      </div>
                    ))}
                    {videoCompletionBadges.every(badge => badge.earned) && (
                      <p className="text-sm text-muted-foreground">All video completion badges earned! 🎉</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No video completion badges earned yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="app" className="mt-0">
            <div className="space-y-4">
              {appUsageBadges.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {appUsageBadges.map(badge => (
                      <Badge key={badge.id} badge={badge} />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {appUsageBadges.map(badge => !badge.earned && (
                      <div key={`progress-${badge.id}`} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{badge.name}</span>
                          <span>{consecutiveDays}/{appUsageThresholds[badge.id as keyof typeof appUsageThresholds]} days</span>
                        </div>
                        <Progress value={calculateProgress(consecutiveDays, appUsageThresholds[badge.id as keyof typeof appUsageThresholds])} />
                      </div>
                    ))}
                    {appUsageBadges.every(badge => badge.earned) && (
                      <p className="text-sm text-muted-foreground">All app usage badges earned! 🎉</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No app usage badges earned yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
