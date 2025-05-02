import React from "react";
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
import { usePopover } from "@/context/PopoverContext";

const AppNotifications = () => {
  const {
    notifications,
    loading,
    hasMore,
    anonymousMessage,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotification();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendShipContext();
  const { acceptTaskShare, rejectedTaskShare } = useTaskContext();
  const navigate = useNavigate();

  const { activePopover, openPopover, closePopover, isPopoverOpen } =
    usePopover();
  const isOpen = isPopoverOpen("notifications");

  const handleOpenChange = (open) => {
    if (open) {
      openPopover("notifications");
    } else {
      closePopover();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.type === "task_comment" && notification.content.task_id) {
      closePopover();
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
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task_comment":
        return <MessageSquare className="h-3 w-3 text-blue-500" />;
      case "task_share_request":
        return <Share className="h-3 w-3 text-purple-500" />;
      case "task_share_accepted":
        return <Share className="h-3 w-3 text-purple-500" />;
      case "friend_request":
        return <UserPlus className="h-3 w-3 text-green-500" />;
      default:
        return <Bell className="h-3 w-3 text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "task_comment":
        return {
          name: notification.content.from_full_name,
          nameLetter: notification.content.from_full_name[0],
          message: (
            <>
              commented on{" "}
              <strong title={notification.content.task_title}>
                {notification.content.task_title.length > 20
                  ? `${notification.content.task_title.substring(0, 20)}...`
                  : notification.content.task_title}
              </strong>{" "}
            </>
          ),
          comment: notification.content.comment_excerpt,
        };
      case "task_share_request":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: (
            <>
              wants to share the task{" "}
              <strong title={notification.content.task_title}>
                {notification.content.task_title.length > 20
                  ? `${notification.content.task_title.substring(0, 20)}...`
                  : notification.content.task_title}
              </strong>{" "}
              with you.
            </>
          ),
        };
      case "task_share_accepted":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          message: (
            <>
              has accepted the shared task{" "}
              <strong title={notification.content.task_title}>
                {notification.content.task_title.length > 20
                  ? `${notification.content.task_title.substring(0, 20)}...`
                  : notification.content.task_title}
              </strong>
              . You can now collaborate on it together!
            </>
          ),
        };
      case "friend_request":
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
      isOpen={isOpen}
      setIsOpen={handleOpenChange}
      loading={loading}
      refreshAction={fetchNotifications}
      markAllAsReadAction={markAllAsRead}
      hasUnread={notifications.some((n) => !n.is_read)}
    >
      {notifications.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-4">
          {anonymousMessage
            ? anonymousMessage
            : loading
            ? "Loading notifications..."
            : "You have no notifications"}
        </p>
      ) : (
        <>
          {notifications.map((notification, index) => {
            const content = getNotificationContent(notification);

            return (
              <div key={notification.id}>
                <div
                  className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {content.nameLetter}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-0.5">
                      <span className="text-xs font-bold">{content.name}</span>{" "}
                      <span className="text-xs">
                        {content.message}
                        {notification.type === "task_comment" &&
                          content.comment && (
                            <>
                              : "
                              <span className="line-clamp-1 break-words overflow-hidden">
                                {content.comment}
                              </span>
                              "
                            </>
                          )}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      <Clock className="h-2.5 w-2.5 inline mr-1" />
                      {formatTime(notification.created_at)}
                    </div>

                    {!notification.is_replied && (
                      <>
                        {notification.type === "task_share_request" && (
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              className="h-6 px-2 py-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "acceptTaskShare"
                                );
                              }}
                            >
                              <Check className="w-2.5 h-2.5 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 py-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "rejectedTaskShare"
                                );
                              }}
                            >
                              <X className="w-2.5 h-2.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}

                        {notification.type === "friend_request" && (
                          <div className="flex gap-2 mt-1">
                            <Button
                              size="sm"
                              className="h-6 px-2 py-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "accept"
                                );
                              }}
                            >
                              <Check className="w-2.5 h-2.5 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 py-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(
                                  notification.content.request_id,
                                  "reject"
                                );
                              }}
                            >
                              <X className="w-2.5 h-2.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {notification.is_read ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
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
            <div className="p-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreNotifications}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 text-xs h-6"
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
