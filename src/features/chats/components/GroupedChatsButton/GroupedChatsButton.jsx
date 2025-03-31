import React from "react";
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
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full shadow-md relative bg-gray-200 hover:bg-gray-300"
            >
              <span className="text-sm font-bold">+{groupedChats.length}</span>
            </Button>
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
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          <div className="p-1">
            <h4 className="font-medium mb-1">Chats agrupados</h4>
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
