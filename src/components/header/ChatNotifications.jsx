import React from 'react'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"

function ChatNotifications({
  chats,
  showChats,
  setShowChats,
  handleChatClick,
}) {
  return (
    <Popover open={showChats} onOpenChange={setShowChats}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            {/* {chats.reduce((acc, chat) => acc + chat.unread, 0)} */}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-semibold">Chats</h3>
          {/* {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleChatClick(chat.id)}
            >
              <Avatar>
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{chat.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && <Badge>{chat.unread}</Badge>}
            </div>
          ))} */}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export  {ChatNotifications}