import { useState, useRef, useEffect } from "react";
import {
  SendHorizontal,
  X,
  MessageSquare,
  Check,
  CheckCheck,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContex";
import { useAuthLogic } from "@/features/auth";

const ChatComponent = () => {
  const {
    isChatOpen,
    loadingMessages,
    selectedConversation,
    currentMessages,
    closeChat,
    sendMessage,
  } = useChat();
  const { user } = useAuthLogic();
  const [message, setMessage] = useState("");
  const [newMessageAnimation, setNewMessageAnimation] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    console.log("Messages:", currentMessages);
  }, [currentMessages]);


  useEffect(() => {
    if (isChatOpen && chatContainerRef.current && currentMessages?.length > 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [isChatOpen, currentMessages]);

  useEffect(() => {
    if (selectedConversation?.unread_count > 0 && !isChatOpen) {
      setNewMessageAnimation(true);
      setTimeout(() => setNewMessageAnimation(false), 2000);
    }
  }, [selectedConversation, isChatOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    sendMessage(selectedConversation?.other_user_id, message);
    setMessage("");
  };

  const toggleChat = () => {
    closeChat(!isChatOpen);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };


  const groupMessagesByDate = (messages) => {
    if (!messages || !Array.isArray(messages)) return {};

    const groups = {};

    messages.forEach((msg) => {
      const date = new Date(msg.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;

      if (date.toDateString() === today.toDateString()) {
        dateKey = "Hoy";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Ayer";
      } else {
        dateKey = date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(msg);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(currentMessages);

 
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getOtherUserInitials = () => {
    if (!selectedConversation?.other_user_full_name) return "U";
    const nameParts = selectedConversation.other_user_full_name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
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
        {selectedConversation?.unread_count > 0 && !isChatOpen && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
            {selectedConversation.unread_count}
          </Badge>
        )}
      </Button>

      {newMessageAnimation && !isChatOpen && (
        <div className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-40 animate-fade-in-out flex items-center gap-2">
          <Bell size={16} />
          <span>New message</span>
        </div>
      )}


      {isChatOpen && selectedConversation && (
        <Card className="fixed bottom-20 right-6 w-80 sm:w-96 shadow-xl z-40 border-none">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {selectedConversation.other_user_avatar_url ? (
                  <AvatarImage
                    src={selectedConversation.other_user_avatar_url}
                    alt={selectedConversation.other_user_full_name}
                  />
                ) : (
                  <AvatarFallback className="bg-primary-foreground text-primary">
                    {getOtherUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span>{selectedConversation.other_user_full_name}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col h-96 overflow-hidden">
              {/* Loading state */}
              {loadingMessages && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              )}

              {/* Empty state */}
              {!loadingMessages &&
                (!currentMessages || currentMessages.length === 0) && (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-muted-foreground text-center">
                      There are no messages in this conversation.
                      <br />
                      Send a message to get started.
                    </p>
                  </div>
                )}

              {/* Chat messages */}
              {!loadingMessages &&
                currentMessages &&
                currentMessages.length > 0 && (
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    ref={chatContainerRef}
                  >
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        {/* Date separator */}
                        <div className="flex justify-center my-2">
                          <div className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                            {date}
                          </div>
                        </div>

                        {/* Messages for this date */}
                        {msgs.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex mb-3",
                              msg.is_from_current_user
                                ? "justify-end"
                                : "justify-start"
                            )}
                          >
                            <div className="flex items-end gap-1.5">
                              {!msg.is_from_current_user && (
                                <Avatar className="h-6 w-6 mb-1">
                                  {msg.sender_avatar_url ? (
                                    <AvatarImage
                                      src={msg.sender_avatar_url}
                                      alt={msg.sender_fullname}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      {getUserInitials(msg.sender_fullname)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}

                              <div
                                className={cn(
                                  "rounded-lg px-2.5 py-1.5 max-w-[240px]",
                                  msg.is_from_current_user
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                              >
                                <p className="text-xs">{msg.content}</p>
                                <span className="text-[0.65rem] opacity-70 block text-right mt-0.5 flex justify-end items-center gap-1">
                                  {formatTime(msg.created_at)}
                                  {msg.is_from_current_user &&
                                    (msg.is_read_by_others ? (
                                      <CheckCheck
                                        size={12}
                                        className="text-green-500"
                                      />
                                    ) : (
                                      <Check size={12} />
                                    ))}
                                </span>
                              </div>

                              {msg.is_from_current_user && (
                                <Avatar className="h-6 w-6 mb-1">
                                  {user?.avatar_url ? (
                                    <AvatarImage
                                      src={user.avatar_url}
                                      alt="User"
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      {getUserInitials(
                                        user?.full_name
                                      )}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

              {/* Message input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t p-3 flex gap-2 bg-card"
              >
                <Input
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  disabled={loadingMessages || !selectedConversation}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    !message.trim() || loadingMessages || !selectedConversation
                  }
                >
                  <SendHorizontal size={18} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estilos adicionales para animaciones */}
      <style jsx global>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
