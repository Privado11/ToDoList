import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationsPopover from "./NotificationsPopover";
import { useChat } from "@/context/ChatContex";
import { formatConversationDate } from "@/lib/formatConversationDate";

const ChatNotifications = () => {
  const {
    conversations,
    loading,
    openChat,
    fetchConversations,
    markAllAsRead,
  } = useChat();
  const [showConversations, setShowConversations] = useState(false);

  const handleConversationClick = (conversation) => {
    openChat(conversation);
    setShowConversations(false);
  };

  const totalUnread = conversations.reduce(
    (acc, conversation) => acc + conversation.unread_count,
    0
  );

  const hasUnread = conversations.some((conv) => !conv.is_read);

  return (
    <NotificationsPopover
      icon={<MessageSquare className="h-5 w-5" />}
      title="Chats"
      unreadCount={totalUnread}
      isOpen={showConversations}
      setIsOpen={setShowConversations}
      loading={loading}
      refreshAction={fetchConversations}
      markAllAsReadAction={markAllAsRead}
      hasUnread={hasUnread}
    >
      {conversations.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-8">
          {loading ? "Loading conversations..." : "You have no conversations"}
        </p>
      ) : (
        <>
          {conversations.map((conversation, index) => (
            <div key={conversation.id}>
              <div
                className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                  !conversation.is_read ? "bg-blue-50" : ""
                }`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="h-8 w-8">
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
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1 mb-1">
                    <p className="font-medium text-sm mr-1 truncate">
                      {conversation.other_user_full_name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatConversationDate(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 mr-1 truncate">
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
              {index < conversations.length - 1 && (
                <div className="h-px bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </>
      )}
    </NotificationsPopover>
  );
};

export default ChatNotifications;
