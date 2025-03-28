import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

const MessageItem = ({ message, user }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex mb-3",
        message.is_from_current_user ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex items-end gap-1.5">
        {!message.is_from_current_user && (
          <Avatar className="h-6 w-6 mb-1">
            {message.sender_avatar_url ? (
              <AvatarImage
                src={message.sender_avatar_url}
                alt={message.sender_fullname}
              />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getUserInitials(message.sender_fullname)}
              </AvatarFallback>
            )}
          </Avatar>
        )}

        <div
          className={cn(
            "rounded-lg px-2.5 py-1.5 max-w-[240px]", 
            "break-words overflow-wrap-break-word",
            message.is_from_current_user
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <p className="text-xs">{message.content}</p>
          <span className="text-[0.65rem] opacity-70 block text-right mt-0.5 flex justify-end items-center gap-1">
            {formatTime(message.created_at)}
            {message.is_from_current_user &&
              (message.is_read_by_others ? (
                <CheckCheck size={12} className="text-green-500" />
              ) : (
                <Check size={12} />
              ))}
          </span>
        </div>

        {message.is_from_current_user && (
          <Avatar className="h-6 w-6 mb-1">
            {user?.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt="User" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getUserInitials(user?.full_name)}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
