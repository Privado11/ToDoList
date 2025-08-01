import React, { useState } from "react";
import MinimizedChat from "../MinimizedChat";
import GroupedChatsButton from "../GroupedChatsButton";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NewChatButton from "../NewChatButton";
import ContactSelector from "../ContactSelector";

const MinimizedChatsContainer = ({
  minimizedChatIds,
  conversations,
  newMessageAnimation,
  onOpenChat,
  onCloseChat,
}) => {
  const [showCloseAll, setShowCloseAll] = useState(false);
  const [showNewChatButton, setShowNewChatButton] = useState(true);
  let visibleMinimizedChats = [];
  let groupedChats = [];

  if (minimizedChatIds.length <= 5) {
    visibleMinimizedChats = [...minimizedChatIds];
    groupedChats = [];
  } else {
    visibleMinimizedChats = minimizedChatIds.slice(-1);
    groupedChats = minimizedChatIds.slice(0, -1).reverse();
  }

  const hasGroupedChats = groupedChats.length > 0;

  // Función para cerrar todos los chats minimizados
  const closeAllChats = () => {
    minimizedChatIds.forEach((chatId) => {
      onCloseChat(chatId);
    });
  };

  const handleSelectContact = (conversation) => {
    onOpenChat(conversation);
    setShowNewChatButton(true);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end space-y-reverse space-y-2"
      onMouseEnter={() => setShowCloseAll(true)}
      onMouseLeave={() => setShowCloseAll(false)}
    >
      {/* Botón X para cerrar todos los chats (visible solo al pasar el mouse) */}
      {/* {showCloseAll && minimizedChatIds.length > 0 && (
        <div className="absolute -top-10 right-0 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={closeAllChats}
                  variant="destructive"
                  size="icon"
                  className="rounded-full shadow-md h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cerrar todos los chats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )} */}

      {showNewChatButton ? (
        <NewChatButton onClick={() => setShowNewChatButton(false)} />
      ) : (
        <ContactSelector
          conversations={conversations}
          onSelectContact={handleSelectContact}
          onClose={() => setShowNewChatButton(true)}
        />
      )}

      {/* Chats agrupados */}
      {hasGroupedChats && (
        <GroupedChatsButton
          groupedChats={groupedChats}
          conversations={conversations}
          onOpenChat={onOpenChat}
          onCloseChat={onCloseChat}
        />
      )}

      {/* Chats minimizados individuales */}
      {visibleMinimizedChats.map((chatId) => {
        const chat = conversations.find((c) => c.id === chatId);
        return (
          <MinimizedChat
            key={chatId}
            chat={chat}
            onOpen={onOpenChat}
            onClose={onCloseChat}
            isAnimated={newMessageAnimation[chatId]}
          />
        );
      })}
    </div>
  );
};

export default MinimizedChatsContainer;
