import { useState, useEffect, useRef } from "react";
import { MessageSquare, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import NotificationsPopover from "./NotificationsPopover";
import { formatConversationDate } from "@/lib/formatConversationDate";
import { useChat, usePopover } from "@/context";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DialogConfirmation } from "@/view/DialogConfirmation";

const ChatNotifications = () => {
  const {
    conversations,
    loading,
    openChat,
    fetchConversations,
    markAllAsRead,
    deleteConversation,
    anonymousMessage,
  } = useChat();
  const navigate = useNavigate();

  const { activePopover, openPopover, closePopover, isPopoverOpen } =
    usePopover();
  const isOpen = isPopoverOpen("chat");

  const [hoveredConversation, setHoveredConversation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [deleteChatDialogOpen, setDeleteChatDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const filteredConversations = conversations.filter(
    (conversation) => conversation.is_virtual !== true
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenChange = (open) => {
    if (open) {
      openPopover("chat");
    } else {
      closePopover();
    }
  };

  const handleConversationClick = (conversation) => {
    openChat(conversation);
    closePopover();
  };

  const handleChatDialogOpen = (e, conversationId) => {
    e.stopPropagation();

    setChatToDelete(conversationId);
    setDeleteChatDialogOpen(true);
  };

  const handleDeleteConversation = async (e) => {
    e.stopPropagation();

    await deleteConversation(chatToDelete);

    setShowDropdown(null);
    setHoveredConversation(null);
  };

  const totalUnread = filteredConversations.reduce(
    (acc, conversation) => acc + conversation.unread_count,
    0
  );

  const hasUnread = filteredConversations.some((conv) => !conv.is_read);

  const navigateToProfile = (e, conversation) => {
    e.stopPropagation();
    const username = conversation?.other_user_username?.replace("@", "");
    navigate(`/${username}`);
    closePopover();
  };

  return (
    <NotificationsPopover
      icon={<MessageSquare className="!h-5 !w-5" />}
      title="Chats"
      unreadCount={totalUnread}
      isOpen={isOpen}
      setIsOpen={handleOpenChange}
      loading={loading}
      refreshAction={fetchConversations}
      markAllAsReadAction={markAllAsRead}
      hasUnread={hasUnread}
    >
      {filteredConversations.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-8">
          {anonymousMessage
            ? anonymousMessage
            : loading
            ? "Loading conversations..."
            : "You have no conversations"}
        </p>
      ) : (
        <>
          {filteredConversations.map((conversation, index) => (
            <div key={conversation.id}>
              <div
                className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer group relative ${
                  !conversation.is_read ? "bg-blue-50" : ""
                }`}
                onClick={() => handleConversationClick(conversation)}
                onMouseEnter={() => setHoveredConversation(conversation.id)}
                onMouseLeave={() => {
                  if (showDropdown !== conversation.id) {
                    setHoveredConversation(null);
                  }
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  <Avatar
                    className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => navigateToProfile(e, conversation)}
                  >
                    <AvatarImage
                      src={conversation.other_user_avatar_url}
                      alt={conversation.other_user_full_name}
                    />
                    <AvatarFallback>
                      {conversation.other_user_full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1 mb-1">
                    <p
                      className="font-medium text-base mr-1 truncate cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => navigateToProfile(e, conversation)}
                    >
                      {conversation.other_user_full_name}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatConversationDate(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 mr-1 truncate">
                      {conversation.last_message}
                    </p>
                    {conversation.unread_count > 0 && (
                      <Badge className="h-4 px-1.5 text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>

                {hoveredConversation === conversation.id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-6 z-10">
                    <Button
                      ref={buttonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(
                          showDropdown === conversation.id
                            ? null
                            : conversation.id
                        );
                      }}
                      className={cn(
                        "w-9 h-9 bg-background/95 backdrop-blur-sm border border-border/50 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200",
                        "hover:bg-muted hover:scale-105 active:scale-95",
                        showDropdown === conversation.id && "bg-muted scale-105"
                      )}
                      title="Conversation options"
                    >
                      <MoreHorizontal
                        size={14}
                        className="text-muted-foreground"
                      />
                    </Button>

                    {showDropdown === conversation.id && (
                      <div
                        ref={dropdownRef}
                        className={cn(
                          "absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl py-1 min-w-[160px] z-50",
                          "animate-in fade-in-0 zoom-in-95 duration-200"
                        )}
                      >
                        <button
                          onClick={(e) =>
                            handleChatDialogOpen(e, conversation.id)
                          }
                          className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 flex items-center gap-2.5 text-destructive transition-colors group/item"
                        >
                          <Trash2
                            size={14}
                            className="group-hover/item:scale-110 transition-transform"
                          />
                          Delete Chat
                        </button>

                        <div className="absolute top-0 right-4 w-2 h-2 bg-background/95 border-l border-t border-border/50 rotate-45 -translate-y-1" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {index < conversations.length - 1 && (
                <div className="h-px bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}

          <DialogConfirmation
            isOpen={deleteChatDialogOpen}
            onClose={() => setDeleteChatDialogOpen(false)}
            onConfirm={handleDeleteConversation}
            title="Delete Chat"
            description={
              <>
                Are you sure you want to delete this chat?
                <br />
                This action is permanent and cannot be undone.
              </>
            }
            cancelText="Cancel"
            confirmText="Yes, delete chat"
          />
        </>
      )}
    </NotificationsPopover>
  );
};

export default ChatNotifications;
