
import { Badge as BadgeType, BadgeType as BadgeTypeEnum } from "@/store/badgeStore";
import { Badge } from "@/components/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserAchievementsProps {
  badges: Record<BadgeTypeEnum, BadgeType>;
}

export function UserAchievements({ badges }: UserAchievementsProps) {
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
            <div className="flex flex-wrap gap-2">
              {timeBadges.length > 0 ? (
                timeBadges.map(badge => (
                  <Badge key={badge.id} badge={badge} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No watch time badges earned yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {videoCompletionBadges.length > 0 ? (
                videoCompletionBadges.map(badge => (
                  <Badge key={badge.id} badge={badge} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No video completion badges earned yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="app" className="mt-0">
            <div className="flex flex-wrap gap-2">
              {appUsageBadges.length > 0 ? (
                appUsageBadges.map(badge => (
                  <Badge key={badge.id} badge={badge} />
                ))
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
