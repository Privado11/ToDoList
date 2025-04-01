import React, { useEffect } from "react";
import {
  Bell,
  Check,
  Clock,
  MessageSquare,
  Share,
  X,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationsPopover from "./NotificationsPopover";
import { useNotification } from "@/context/NotificationContext";
import { useFriendShipContext } from "@/context/FriendShipContext";
import { useTaskContext } from "@/context/TaskContext";
import { useNavigate } from "react-router-dom";

const AppNotifications = () => {
  const {
    notifications,
    loading,
    hasMore,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotification();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendShipContext();
  const { acceptTaskShare, rejectedTaskShare } = useTaskContext();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = React.useState(false);

  useEffect(() => {
    console.log("notifications", notifications);
  }, [notifications]);

 const handleNotificationClick = async (notification) => {
   if (!notification.is_read) {
     await markAsRead(notification.id);
   }
   if (notification.type === "task_comment" && notification.content.task_id) {
     setShowNotifications(false);
     const commentAnchor = notification.content.comment_id
       ? `#comment-${notification.content.comment_id}`
       : "";
     navigate(`/task-detail/${notification.content.task_id}${commentAnchor}`);
   }
 };

  const handleNotificationAction = async (requestId, action) => {
    try {
      const actionHandlers = {
        acceptTaskShare: () => acceptTaskShare(requestId),
        rejectedTaskShare: () => rejectedTaskShare(requestId),
        accept: () => acceptFriendRequest(requestId),
        reject: () => rejectFriendRequest(requestId),
      };

      if (actionHandlers[action]) {
        await actionHandlers[action]();
      }

      return { success: true, requestId, action };
    } catch (err) {
      console.error(`Failed to process notification action ${action}:`, err);
      throw err;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "task_share_request":
        return <Share className="h-4 w-4 text-purple-500" />;
      case "task_share_accepted":
        return <Share className="h-4 w-4 text-purple-500" />;
      case "friendship_request":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "task_comment":
        return {
          name: notification.content.from_full_name,
          nameLetter: notification.content.from_full_name[0],
          message: `Commented on "${notification.content.task_title}"`,
          comment: notification.content.comment_excerpt,
        };
      case "task_share_request":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: `wants to share the task "${notification.content.task_title}" with you.`,
        };
      case "task_share_accepted":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: `has accepted the shared task "${notification.content.task_title}". You can now collaborate on it together!`,
        };
      case "friendship_request":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: "has sent you a friend request.",
        };
      case "friendship_accepted":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: "has accepted your friend request. You are now connected!",
        };
      default:
        return {
          name: "User",
          nameLetter: "U",
          message: notification.message || "New notification",
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationsPopover
      icon={<Bell className="h-5 w-5" />}
      title="Notifications"
      unreadCount={unreadCount}
      isOpen={showNotifications}
      setIsOpen={setShowNotifications}
      loading={loading}
      refreshAction={fetchNotifications}
      markAllAsReadAction={markAllAsRead}
      hasUnread={notifications.some((n) => !n.is_read)}
    >
      {notifications.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-8">
          {loading ? "Loading notifications..." : "You have no notifications"}
        </p>
      ) : (
        <>
          {notifications.map((notification, index) => {
            const content = getNotificationContent(notification);

            return (
              <div key={notification.id}>
                <div
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {content.nameLetter}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      {getNotificationIcon(notification.type)}
                      <p className="text-sm font-medium">{content.name}</p>
                    </div>
                    <p className="text-sm text-gray-600">{content.message}</p>
                    {notification.type === "task_comment" &&
                      content.comment && (
                        <p className="text-sm italic mt-1 text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          "{content.comment}"
                        </p>
                      )}
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(notification.created_at)}
                    </div>

                    {!notification.is_replied && (
                      <>
                        {notification.type === "task_share_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="h-7 px-2 py-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "acceptTaskShare"
                                );
                              }}
                            >
                              <Check className="w-3 h-3 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 py-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "rejectedTaskShare"
                                );
                              }}
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}

                        {notification.type === "friendship_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="h-7 px-2 py-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "accept"
                                );
                              }}
                            >
                              <Check className="w-3 h-3 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 py-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "reject"
                                );
                              }}
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {notification.is_read ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                {index < notifications.length - 1 && (
                  <div className="h-px bg-gray-200 mx-4"></div>
                )}
              </div>
            );
          })}
          {hasMore && (
            <div className="p-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreNotifications}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800"
              >
                {loading ? <span className="mr-2">Loading</span> : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </NotificationsPopover>
  );
};

export default AppNotifications;
