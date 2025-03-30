// NotificationsPopover.jsx
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";

const NotificationsPopover = ({
  icon,
  title,
  unreadCount,
  isOpen,
  setIsOpen,
  loading,
  refreshAction,
  markAllAsReadAction,
  hasUnread,
  children,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {icon}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={refreshAction}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={markAllAsReadAction}
              disabled={loading || !hasUnread}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto py-1">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;