import React from "react";
import { X, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageList, MessageInput } from "..";
import { groupMessagesByDate } from "../../utils/messageUtils";

const ActiveChat = ({
  conversation,
  messages,
  isSelected,
  position,
  loadingMessages,
  user,
  message,
  setMessage,
  onSendMessage,
  onSelectChat,
  onMinimize,
  onClose,
  chatContainerRef,
}) => {
  if (!conversation) return null;

  const groupedMessages = groupMessagesByDate(messages);

  const getOtherUserInitials = () => {
    if (!conversation?.other_user_full_name) return "U";
    const nameParts = conversation.other_user_full_name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  const getAvatarForChat = (conversation) => {
    return (
      <Avatar className="h-8 w-8">
        {conversation.other_user_avatar_url ? (
          <AvatarImage
            src={conversation.other_user_avatar_url}
            alt={conversation.other_user_full_name}
          />
        ) : (
          <AvatarFallback className="bg-primary-foreground text-primary">
            {getOtherUserInitials()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  };

  return (
    <Card
      className={`fixed shadow-xl z-40 border-none ${
        position === 0 ? "bottom-20 right-20" : "bottom-20 right-[23rem]"
      } w-80 sm:w-96`}
    >
      <div className="flex justify-between items-center bg-primary text-primary-foreground rounded-t-lg p-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onSelectChat(conversation)}
        >
          {getAvatarForChat(conversation)}
          <span className="text-lg font-medium truncate">
            {conversation.other_user_full_name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground "
            onClick={() => onMinimize(conversation.id)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground "
            onClick={() => onClose(conversation.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="flex flex-col h-96 overflow-hidden">
          <MessageList
            messages={messages}
            loadingMessages={loadingMessages && isSelected}
            groupedMessages={groupedMessages}
            user={user}
            chatContainerRef={chatContainerRef}
          />
          <MessageInput
            message={isSelected ? message : ""}
            setMessage={setMessage}
            handleSendMessage={(e) => onSendMessage(e, conversation.id)}
            loadingMessages={loadingMessages && isSelected}
            selectedConversation={conversation}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveChat;
