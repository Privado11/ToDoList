  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { useNotification } from "@/context/NotificationContext";
  import { formatDistanceToNow } from "date-fns";

  function ActivityFeed() {
    const { notifications, loading } = useNotification();

    const latestNotifications = notifications
      ?.filter((n) => n.type === "task_completed" || n.type === "task_comment")
      .slice(-3);

    const formatNotificationMessage = (notification) => {
      switch (notification.type) {
        case "task_comment":
          return `${notification.content.from_full_name} commented on "${notification.content.task_title}"`;
        case "task_completed":
          return `${notification.content.from_full_name} completed "${notification.content.task_title}"`;
        case "task_created":
          return `${notification.content.from_full_name} created "${notification.content.task_title}"`;
      }
    };

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
      } catch (error) {
        return "recently";
      }
    };

    return (
      <Card className="h-[326px]">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Recent task updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading activities...</p>
          ) : latestNotifications.length > 0 ? (
            latestNotifications.map((notification) => (
              <div key={notification.id} className="flex gap-4">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm">
                    {formatNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activities</p>
          )}
        </CardContent>
      </Card>
    );
  }

  export default ActivityFeed;
