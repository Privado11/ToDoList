import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { groupMessagesByDate } from "../../utils/messageUtils";
import { useNavigate } from "react-router-dom";
import MessageList from "../MessageList";
import MessageInput from "../MessageInput";

const MobileChat = ({
  conversation,
  messages,
  loadingMessages,
  message,
  setMessage,
  onSendMessage,
  onRetryMessage,
  onClose,
  chatContainerRef,
  onDeleteConversation,
  onDeleteMessage,
}) => {
  const isMounted = useRef(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const setContainerRef = (el) => {
    if (el) {
      containerRef.current = el;
      chatContainerRef(el);
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    if (isMounted.current && containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    } else {
      isMounted.current = true;
    }
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  const navigateToProfile = (e) => {
    e.stopPropagation();
    const username = conversation?.other_user_username?.replace("@", "");
    onClose(null);
    navigate(`/${username}`);
  };

  const handleDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation(conversation.id);
    }
  };

  const handleBack = () => {
    onClose(true);
  };

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
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

            <div className="flex-1 cursor-pointer" onClick={navigateToProfile}>
              <h2 className="font-semibold text-base truncate">
                {conversation.other_user_full_name}
              </h2>
              <p className="text-sm text-primary-foreground/80">
                {conversation.other_user_username}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-20"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleDeleteConversation}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {conversation.is_blocked ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-center">
              You cannot send messages to this conversation
            </p>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              loadingMessages={loadingMessages}
              groupedMessages={groupedMessages}
              chatContainerRef={setContainerRef}
              onRetryMessage={onRetryMessage}
              onDeleteMessage={onDeleteMessage}
            />

            <div className="border-t bg-white">
              <MessageInput
                conversation={conversation}
                message={message}
                setMessage={setMessage}
                handleSendMessage={(e) => onSendMessage(e, conversation.id)}
                loadingMessages={loadingMessages}
                selectedConversation={conversation}
                isSelected={true}
                onSelectChat={() => {}}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileChat;
