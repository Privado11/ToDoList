"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useChat } from "@/context/ChatContex";

const ConversationNotifications = () => {
  const { conversations, openChat } = useChat();

  useEffect(() => {
    console.log("Conversaciones actualizadas", conversations);
  }, [conversations]);

  const [showConversations, setShowConversations] = useState(false);


 const handleConversationClick = (conversation) => {
   openChat(conversation); 
   setShowConversations(false); 
 };


  const totalUnread = conversations.reduce(
    (acc, conversation) => acc + conversation.unread_count,
    0
  );

  return (
    <>
      <Popover open={showConversations} onOpenChange={setShowConversations}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            {totalUnread > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {totalUnread}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h3 className="font-semibold">Chats</h3>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleConversationClick(conversation)}
              >
                <Avatar>
                  <AvatarImage
                    src={
                      conversation.other_user_avatar_url ||
                      "/api/placeholder/32/32"
                    }
                    alt={conversation.other_user_full_name}
                  />
                  <AvatarFallback>
                    {conversation.other_user_full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {conversation.other_user_full_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <Badge>{conversation.unread_count}</Badge>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ConversationNotifications;
