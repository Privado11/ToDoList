import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ChatHeader = ({ conversation }) => {
  const getOtherUserInitials = () => {
    if (!conversation?.other_user_full_name) return "U";
    const nameParts = conversation.other_user_full_name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
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
        <span>{conversation.other_user_full_name}</span>
      </CardTitle>
    </CardHeader>
  );
};

export default ChatHeader;
