import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotification } from "@/context";
import { formatDistanceToNow } from "date-fns";
import { Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ActivityFeed() {
  const { notifications, loading, markAsRead } = useNotification();
  const navigate = useNavigate();

  const latestNotifications = notifications
    ?.filter((n) => n.type === "update_task_status" || n.type === "task_comment")
    .slice(0, 3);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const commentAnchor = notification.content.comment_id
      ? `#comment-${notification.content.comment_id}`
      : "";
    navigate(`/task-detail/${notification.content.task_id}${commentAnchor}`);
  };

  const formatNotificationMessage = (notification) => {
    const maxTitleLength = 27;
    const taskTitle = notification.content.task_title;
    const shortTitle =
      taskTitle.length > maxTitleLength
        ? taskTitle.slice(0, maxTitleLength) + "..."
        : taskTitle;

    switch (notification.type) {
      case "task_comment":
        return (
          <>
            <strong>{notification.content.from_full_name}</strong> commented on
            "{shortTitle}"
          </>
        );
      case "update_task_status":
        const isCompleted = notification.content.new_status === "Completed";
        return (
          <>
            <strong>{notification.content.changed_by}</strong>{" "}
            {isCompleted ? "completed" : "reopened"} "{shortTitle}"
          </>
        );

      case "task_created":
        return (
          <>
            <strong>{notification.content.from_full_name}</strong> created "
            {shortTitle}"
          </>
        );
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
            <div
              key={notification.id}
              className="flex gap-4 cursor-pointer hover:bg-gray-100"
              onClick={() => handleNotificationClick(notification)}
            >
              {notification.is_read ? (
                <Circle className="mt-0.5 h-2 w-2 text-gray-300" />
              ) : (
                <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
              )}
              <div className="space-y-1 w-full">
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
