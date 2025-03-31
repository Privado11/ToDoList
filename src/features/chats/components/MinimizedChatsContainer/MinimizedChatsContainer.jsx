import React from "react";
import MinimizedChat from "../MinimizedChat";
import GroupedChatsButton from "../GroupedChatsButton";


const MinimizedChatsContainer = ({
  minimizedChatIds,
  conversations,
  newMessageAnimation,
  onOpenChat,
  onCloseChat,
}) => {
  // Obtenemos los chats agrupados (más allá de 5 minimizados)
  const visibleMinimizedChats = minimizedChatIds.slice(0, 4);
  const groupedChats = minimizedChatIds.slice(4);
  const hasGroupedChats = groupedChats.length > 0;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse items-end space-y-reverse space-y-2">
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
