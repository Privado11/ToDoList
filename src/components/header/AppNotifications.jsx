import React, { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AppNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "friend_request",
      from: "Alice Johnson",
      timestamp: "2024-11-06T10:30:00",
      status: "pending",
    },
    {
      id: 2,
      type: "task_shared",
      from: "Bob Wilson",
      taskId: 1,
      taskTitle: "Presentación del proyecto Q4",
      timestamp: "2024-11-06T09:15:00",
      status: "unread",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationAction = async (notificationId, action) => {
    try {
      console.log(`Notification ${notificationId} ${action}`);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Failed to process notification");
    }
  };

  return (
    <Popover open={showNotifications} onOpenChange={setShowNotifications}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            {notifications.filter((n) => n.status === "unread").length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold">Notificaciones</h3>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50"
            >
              <Avatar>
                <AvatarFallback>{notification.from[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{notification.from}</span>{" "}
                  {notification.type === "friend_request"
                    ? "te envió una solicitud de amistad"
                    : `compartió "${notification.taskTitle}" contigo`}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
                {notification.type === "friend_request" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleNotificationAction(notification.id, "accept")
                      }
                    >
                      <Check className="w-4 h-4 mr-1" /> Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleNotificationAction(notification.id, "reject")
                      }
                    >
                      <X className="w-4 h-4 mr-1" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppNotifications;
