import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatToggleButton = ({
  isChatOpen,
  toggleChat,
  unreadCount,
  newMessageAnimation,
}) => {
  return (
    <Button
      onClick={toggleChat}
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50",
        newMessageAnimation && "animate-bounce"
      )}
    >
      {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
      {unreadCount > 0 && !isChatOpen && (
        <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default ChatToggleButton;
