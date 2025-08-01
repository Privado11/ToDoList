import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Check,
  Clock,
  CircleCheckBig,
  MessageSquare,
  Share,
  X,
  UserPlus,
  Users,
  FilePlus,
  CheckCircle,
  PlusCircle,
  Edit3,
  Star,
  Target,
  Award,
  Zap,
  Crown,
  UserCheck,
  Trophy,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationsPopover from "./NotificationsPopover";
import {
  useNotification,
  usePopover,
  useProfileContext,
  useTaskContext,
} from "@/context";
import { useNavigate } from "react-router-dom";
import { DialogConfirmation } from "@/view/DialogConfirmation";

const AppNotifications = () => {
  const {
    notifications,
    loading,
    hasMore,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    deleteNotification,
  } = useNotification();
  const { getUserById, acceptFriendRequest, rejectFriendRequest } =
    useProfileContext();
  const { acceptTaskShare, rejectedTaskShare } = useTaskContext();
  const navigate = useNavigate();

  const { activePopover, openPopover, closePopover, isPopoverOpen } =
    usePopover();
  const isOpen = isPopoverOpen("notifications");

  const [hoveredNotification, setHoveredNotification] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [deleteNotificationDialogOpen, setDeleteNotificationDialogOpen] =
    useState(false);
  const [noticationToDelete, setNotificationToDelete] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBadgeIcon = (iconName) => {
    const icons = {
      FilePlus,
      PlusCircle,
      Edit3,
      Star,
      CheckCircle,
      Target,
      Zap,
      Trophy,
      Crown,
      Users,
      UserPlus,
      UserCheck,
      Award,
    };
    return icons[iconName] || Star;
  };

  const textColorMap = {
    gray: "text-gray-700",
    blue: "text-blue-700",
    purple: "text-purple-700",
    green: "text-green-700",
    emerald: "text-emerald-700",
    gold: "text-yellow-800",
    cyan: "text-cyan-700",
  };

  const handleOpenChange = (open) => {
    if (open) {
      openPopover("notifications");
    } else {
      closePopover();
    }
  };

  const handleNotificationDialogOpen = (e, notificationId) => {
    e.stopPropagation();

    setNotificationToDelete(notificationId);
    setDeleteNotificationDialogOpen(true);
  };

  const handleDeleteNotification = async (e) => {
    e.stopPropagation();

    await deleteNotification(noticationToDelete);

    setShowDropdown(null);
    setHoveredNotification(null);
  };

  const handleUsernameClick = async (e, userId) => {
    e.stopPropagation();
    handleOpenChange();

    try {
      if (userId) {
        const userData = await getUserById(userId);

        if (userData && userData.username) {
          const usernameAux = userData.username?.replace("@", "");
          navigate(`/${usernameAux}`);
        }
      }
    } catch (error) {}
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    closePopover();

    const navigationHandlers = {
      task_comment: () => {
        if (notification.content.task_id) {
          const commentAnchor = notification.content.comment_id
            ? `#comment-${notification.content.comment_id}`
            : "";
          navigate(
            `/task-detail/${notification.content.task_id}${commentAnchor}`
          );
        }
      },
      update_task_status: () => {
        if (notification.content.task_id) {
          navigate(`/task-detail/${notification.content.task_id}`);
        }
      },
      task_share_accepted: () => {
        if (notification.content.request_id) {
          navigate(`/task-detail/${notification.content.request_id}`);
        }
      },
      friend_request: () => {
        if (notification.content.from_user_id) {
          navigate(`/profile/${notification.content.from_user_id}`);
        }
      },
      friendship_accepted: () => {
        if (notification.content.from_user_id) {
          navigate(`/profile/${notification.content.from_user_id}`);
        }
      },
    };

    if (navigationHandlers[notification.type]) {
      navigationHandlers[notification.type]();
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

  const getNotificationIcon = (notification) => {
    const { type, content } = notification;

    switch (type) {
      case "update_task_status":
        if (content?.new_status === "Completed") {
          return <CircleCheckBig className="h-4 w-4 text-green-500" />;
        } else {
          return <Clock className="h-4 w-4 text-yellow-500" />;
        }

      case "task_comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "task_share_request":
      case "task_share_accepted":
        return <Share className="h-4 w-4 text-purple-500" />;
      case "friend_request":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "badge_earned":
        const BadgeIcon = getBadgeIcon(content?.icon);
        return (
          <BadgeIcon className={`h-4 w-4 ${textColorMap[content?.color]}`} />
        );

      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "update_task_status":
        const isCompleted = notification.content.new_status === "Completed";
        return {
          name: notification.content.changed_by,
          nameLetter: notification.content.changed_by[0],
          userId: notification.related_user_id,
          message: (
            <>
              has {isCompleted ? "completed" : "reopened"} the task{" "}
              <strong title={notification.content.task_title}>
                {notification.content.task_title.length > 20
                  ? `${notification.content.task_title.substring(0, 20)}...`
                  : notification.content.task_title}
              </strong>
              .
            </>
          ),
        };

      case "task_comment":
        return {
          name: notification.content.from_full_name,
          nameLetter: notification.content.from_full_name[0],
          userId: notification.related_user_id,
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
          userId: notification.related_user_id,
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
          userId: notification.related_user_id,
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
          userId: notification.related_user_id,
          message: "has sent you a friend request.",
        };
      case "friendship_accepted":
        return {
          name: notification.content.full_name,
          nameLetter: notification.content.full_name[0],
          userId: notification.related_user_id,
          message: "has accepted your friend request. You are now connected!",
        };
      case "badge_earned":
        const BadgeIcon = getBadgeIcon(notification.content?.icon);
        return {
          nameLetter: (
            <BadgeIcon
              className={`h-4 w-4 ${textColorMap[notification.content?.color]}`}
            />
          ),
          message: (
            <>
              Congratulations! You earned the{" "}
              <strong> {notification.content.name}</strong> badge!
            </>
          ),
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
      icon={<Bell className="!h-5 !w-5" />}
      title="Notifications"
      unreadCount={unreadCount}
      isOpen={isOpen}
      setIsOpen={handleOpenChange}
      loading={loading}
      refreshAction={refreshNotifications}
      markAllAsReadAction={markAllAsRead}
      hasUnread={notifications.some((n) => !n.is_read)}
    >
      {notifications.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-4">
          {loading ? "Loading notifications..." : "You have no notifications"}
        </p>
      ) : (
        <>
          {notifications.map((notification, index) => {
            const content = getNotificationContent(notification);

            return (
              <div key={notification.id}>
                <div
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer group relative ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredNotification(notification.id)}
                  onMouseLeave={() => {
                    if (showDropdown !== notification.id) {
                      setHoveredNotification(null);
                    }
                  }}
                >
                  <div className="flex-shrink-0 relative mt-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-xs">
                        {content.nameLetter}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {getNotificationIcon(notification)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1 mb-1">
                      <div className="flex-1 min-w-0">
                        {content.userId ? (
                          <span
                            className="text-base font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={(e) =>
                              handleUsernameClick(e, content.userId)
                            }
                          >
                            {content.name}
                          </span>
                        ) : (
                          <span className="text-base font-bold">
                            {content.name}
                          </span>
                        )}{" "}
                        <span className="text-base">
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
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>

                    {!notification.is_replied && (
                      <>
                        {notification.type === "task_share_request" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="h-8 px-2 py-0 text-xs"
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
                              size="base"
                              variant="outline"
                              className="h-8 px-2 py-0 text-sm"
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
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="base"
                              className="h-8 px-2 py-0 text-sm"
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
                              size="base"
                              variant="outline"
                              className="h-8 px-2 py-0 text-sm"
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

                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-gray-500">
                        <Clock className="h-2.5 w-2.5 inline mr-1" />
                        {formatTime(notification.created_at)}
                      </div>
                      <div className="flex items-center">
                        {notification.is_read ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {hoveredNotification === notification.id && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-6 z-10">
                      <Button
                        ref={buttonRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(
                            showDropdown === notification.id
                              ? null
                              : notification.id
                          );
                        }}
                        className={cn(
                          "w-9 h-9 bg-background/95 backdrop-blur-sm border border-border/50 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200",
                          "hover:bg-muted hover:scale-105 active:scale-95",
                          showDropdown === notification.id &&
                            "bg-muted scale-105"
                        )}
                        title="Notification options"
                      >
                        <MoreHorizontal
                          size={14}
                          className="text-muted-foreground"
                        />
                      </Button>

                      {showDropdown === notification.id && (
                        <div
                          ref={dropdownRef}
                          className={cn(
                            "absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl py-1 min-w-[160px] z-50",
                            "animate-in fade-in-0 zoom-in-95 duration-200"
                          )}
                        >
                          <button
                            onClick={(e) =>
                              handleNotificationDialogOpen(e, notification.id)
                            }
                            className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 flex items-center gap-2.5 text-destructive transition-colors group/item"
                          >
                            <Trash2
                              size={14}
                              className="group-hover/item:scale-110 transition-transform"
                            />
                            Delete Notification
                          </button>

                          <div className="absolute top-0 right-4 w-2 h-2 bg-background/95 border-l border-t border-border/50 rotate-45 -translate-y-1" />
                        </div>
                      )}
                    </div>
                  )}
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
                size="base"
                onClick={loadMoreNotifications}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 text-sm h-8"
              >
                {loading ? <span className="mr-2">Loading</span> : "Load more"}
              </Button>
            </div>
          )}

          <DialogConfirmation
            isOpen={deleteNotificationDialogOpen}
            onClose={() => setDeleteNotificationDialogOpen(false)}
            onConfirm={handleDeleteNotification}
            title="Delete Notification"
            description={
              <>
                Are you sure you want to delete this notification?
                <br />
                It will be removed from your list and cannot be restored.
              </>
            }
            cancelText="Cancel"
            confirmText="Yes, delete notification"
          />
        </>
      )}
    </NotificationsPopover>
  );
};

export default AppNotifications;
