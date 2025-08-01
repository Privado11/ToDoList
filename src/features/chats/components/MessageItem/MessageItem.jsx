import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  AlertCircle,
  RotateCcw,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

const MessageItem = ({ message, onRetryMessage, onDeleteMessage }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRetry = () => {
    if (onRetryMessage && message.failed) {
      onRetryMessage(message.id);
    }
  };

  const handleDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
    setShowDropdown(false);
    setShowActions(false);
  };

  const isOptimistic =
    message.is_optimistic || (message.status && message.status === "sending");
  const isFailed = message.failed || false;
  const isDeleted = message.is_deleted || false;
  const canShowActions =
    message.is_from_current_user &&
    !isOptimistic &&
    !isFailed &&
    onDeleteMessage;

  if (isDeleted) {
    return (
      <div
        className={cn(
          "flex mb-3 opacity-50",
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

          <div className="rounded-lg px-2.5 py-1.5 max-w-[240px] bg-muted/50 border border-dashed border-muted-foreground/30">
            <p className="text-xs text-muted-foreground italic">
              This message was deleted
            </p>
          </div>

          {message.is_from_current_user && (
            <Avatar className="h-6 w-6 mb-1">
              {message.sender_avatar_url ? (
                <AvatarImage src={message.sender_avatar_url} alt="User" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials(message.sender_fullname)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-3 group relative",
        message.is_from_current_user ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => canShowActions && setShowActions(true)}
      onMouseLeave={() => {
        if (!showDropdown) {
          setShowActions(false);
        }
      }}
    >
      <div className="flex items-end gap-1.5 relative">
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

        <div className="relative">
          <div
            className={cn(
              "rounded-lg px-2.5 py-1.5 max-w-[240px] relative",
              "break-words overflow-wrap-break-word",
              message.is_from_current_user
                ? isFailed
                  ? "bg-destructive/20 text-destructive border border-destructive/30"
                  : "bg-primary text-primary-foreground"
                : "bg-muted",
              isFailed && "opacity-70"
            )}
          >
            <p className={cn("text-xs", isFailed && "text-destructive")}>
              {message.content}
            </p>

            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[0.65rem] opacity-70 flex items-center gap-1">
                {formatTime(message.created_at)}

                {message.is_from_current_user && (
                  <>
                    {isFailed ? (
                      <AlertCircle size={12} className="text-destructive" />
                    ) : isOptimistic ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-50" />
                    ) : message.is_read_by_others ? (
                      <CheckCheck size={12} className="text-green-500" />
                    ) : (
                      <Check size={12} />
                    )}
                  </>
                )}
              </span>

              {isFailed && message.is_from_current_user && onRetryMessage && (
                <button
                  onClick={handleRetry}
                  className="text-[0.65rem] text-destructive hover:text-destructive/80 flex items-center gap-1 ml-2 transition-colors"
                  title="Retry sending message"
                >
                  <RotateCcw size={10} />
                  Retry
                </button>
              )}
            </div>
          </div>

          {showActions && canShowActions && (
            <div
              className={cn(
                "absolute top-0 transition-all duration-200 ease-out",
                message.is_from_current_user ? "-left-10" : "-right-10"
              )}
            >
              <button
                ref={buttonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                  "bg-background/95 backdrop-blur-sm border border-border/50 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200",
                  "hover:bg-muted hover:scale-105 active:scale-95",
                  showDropdown && "bg-muted scale-105"
                )}
                title="Message options"
              >
                <MoreHorizontal size={14} className="text-muted-foreground" />
              </button>

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className={cn(
                    "absolute top-full mt-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl py-1 min-w-[120px] z-50",
                    "animate-in fade-in-0 zoom-in-95 duration-200",
                    message.is_from_current_user ? "right-0" : "left-0"
                  )}
                >
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-0 text-sm text-left hover:bg-destructive/10 flex items-center gap-2.5 text-destructive transition-colors group/item"
                  >
                    <Trash2
                      size={14}
                      className="group-hover/item:scale-110 transition-transform"
                    />
                    Delete
                  </button>

                  <div
                    className={cn(
                      "absolute top-0 w-2 h-2 bg-background/95 border-l border-t border-border/50 rotate-45 -translate-y-1",
                      message.is_from_current_user ? "right-4" : "left-4"
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {message.is_from_current_user && (
          <Avatar className="h-6 w-6 mb-1">
            {message.sender_avatar_url ? (
              <AvatarImage src={message.sender_avatar_url} alt="User" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getUserInitials(message.sender_fullname)}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
