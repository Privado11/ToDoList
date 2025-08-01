import React from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ContactSelector = ({ conversations, onSelectContact, onClose }) => {
  const getAvatarForChat = (conversation) => {
    return (
      <Avatar className="h-10 w-10">
        {conversation.other_user_avatar_url ? (
          <AvatarImage
            src={conversation.other_user_avatar_url}
            alt={conversation.other_user_full_name}
          />
        ) : (
          <AvatarFallback>
            {conversation.other_user_full_name.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
    );
  };

  return (
    <Card className="fixed bottom-20 right-6 w-64 shadow-xl z-50">
      <div className="flex justify-between items-center bg-primary text-primary-foreground p-3 rounded-t-lg">
        <h3 className="text-sm font-medium">New message</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary-foreground hover:bg-primary/90"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-0">
        <ScrollArea className="h-64 py-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-center text-gray-500 py-8">No chats</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectContact(conversation)}
              >
                {getAvatarForChat(conversation)}
                <div>
                  <p className="text-sm font-medium">
                    {conversation.other_user_full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.last_message}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContactSelector;
