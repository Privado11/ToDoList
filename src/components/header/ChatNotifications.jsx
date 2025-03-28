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
import { formatConversationDate } from "@/lib/formatConversationDate";

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
        <PopoverContent className="w-80 p-2">
          <div className="space-y-2">
            <h3 className="font-semibold px-2 pt-1">Chats</h3>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer relative"
                onClick={() => handleConversationClick(conversation)}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm mr-1 truncate">
                      {conversation.other_user_full_name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatConversationDate(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 mr-1  truncate">
                      {conversation.last_message}
                    </p>
                    {conversation.unread_count > 0 && (
                      <Badge className="h-4 px-1.5 text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ConversationNotifications;
