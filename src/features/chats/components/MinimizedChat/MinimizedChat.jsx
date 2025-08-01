import React, { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MinimizedChat = ({ chat, onOpen, onClose, isAnimated }) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!chat) return null;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          <div
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div
              className={`h-12 w-12 rounded-full overflow-hidden cursor-pointer shadow-md ${
                isAnimated
                  ? "animate-bounce border-blue-500"
                  : "border-gray-200"
              }`}
              onClick={() => onOpen(chat)}
            >
              {chat.other_user_avatar_url ? (
                <img
                  src={chat.other_user_avatar_url}
                  alt={chat.other_user_full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                  {chat.other_user_full_name.charAt(0)}
                </div>
              )}
              {chat.unread_count > 0 && (
                <Badge className="absolute -bottom-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {chat.unread_count}
                </Badge>
              )}
            </div>
            {isHovering && (
              <Button
                variant="destructive"
                size="icon"
                className="h-5 w-5 p-0 rounded-full absolute -top-1 -right-1 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(chat.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" align="center" sideOffset={5}>
          <div className="p-1 w-[190px] ">
            <h4 className="font-bold text-white">
              {chat.other_user_full_name}
            </h4>
            <p className="text-xs text-white-70 truncate">
              {chat.last_message}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MinimizedChat;
