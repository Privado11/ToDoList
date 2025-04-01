import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GroupedChatsButton = ({
  groupedChats,
  conversations,
  onOpenChat,
  onCloseChat,
  isAnimated,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const chat = conversations.find((c) => c.id === groupedChats[0]);

   const totalUnreadCount = groupedChats.reduce((total, chatId) => {
     const currentChat = conversations.find((c) => c.id === chatId);
     return total + (currentChat?.unread_count || 0);
   }, 0);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>
          <div
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="h-12 w-12 rounded-full overflow-hidden cursor-pointer shadow-md relative">
              {chat.other_user_avatar_url ? (
                <img
                  src={chat.other_user_avatar_url}
                  alt={chat.other_user_full_name}
                  className="h-full w-full object-cover opacity-80"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground opacity-80">
                  {chat.other_user_full_name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold bg-opacity-30 text-black px-1 rounded">
                  +{groupedChats.length}
                </span>
              </div>
            </div>
            {totalUnreadCount > 0 && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white rounded-full text-xs">
                {totalUnreadCount}
              </div>
            )}
            {isHovering && (
              <Button
                variant="destructive"
                size="icon"
                className="h-5 w-5 p-0 rounded-full absolute -top-1 -right-1 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  groupedChats.forEach((id) => onCloseChat(id));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          <div className="p-1">
            <h4 className="font-medium mb-1">Grouped chats</h4>
            <ul className="space-y-1">
              {groupedChats.map((chatId) => {
                const chat = conversations.find((c) => c.id === chatId);
                return (
                  <li
                    key={chatId}
                    className="flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => onOpenChat(chat)}
                  >
                    <span className="text-sm truncate">
                      {chat?.other_user_full_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-2 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseChat(chatId);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GroupedChatsButton;
