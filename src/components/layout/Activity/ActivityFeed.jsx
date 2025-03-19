import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Recent task updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
          <div className="space-y-1">
            <p className="text-sm">Mi Cosita Hermosa completed "Design Review"</p>
            <p className="text-xs text-muted-foreground">2 minutes ago</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
          <div className="space-y-1">
            <p className="text-sm">John commented on "User Research"</p>
            <p className="text-xs text-muted-foreground">15 minutes ago</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
          <div className="space-y-1">
            <p className="text-sm">Alex created "Content Strategy"</p>
            <p className="text-xs text-muted-foreground">1 hour ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;