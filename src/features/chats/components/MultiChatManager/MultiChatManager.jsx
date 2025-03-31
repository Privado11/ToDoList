import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContex";
import NewChatButton from "../NewChatButton";
import ContactSelector from "../ContactSelector";
import MinimizedChatsContainer from "../MinimizedChatsContainer";
import ActiveChat from "../ActiveChat";


const MultiChatManager = ({user}) => {
  const {
    conversations,
    selectedConversation,
    currentMessages,
    loadingMessages,
    closeChat,
    sendMessage,
    openChat,
    fetchConversations,
  } = useChat();


  // Estados para gestionar múltiples chats
  const [activeChatIds, setActiveChatIds] = useState([]);
  const [minimizedChatIds, setMinimizedChatIds] = useState([]);
  const [message, setMessage] = useState("");
  const [showNewChatButton, setShowNewChatButton] = useState(true);
  const [newMessageAnimation, setNewMessageAnimation] = useState({});

  const chatContainerRefs = useRef({});

  // Efecto para actualizar los chats activos cuando se selecciona uno nuevo
  useEffect(() => {
    if (
      selectedConversation &&
      !activeChatIds.includes(selectedConversation.id)
    ) {
      handleOpenChat(selectedConversation);
    }
  }, [selectedConversation]);

  // Efecto para hacer scroll al final del chat cuando llegan nuevos mensajes
  useEffect(() => {
    if (currentMessages?.length > 0 && selectedConversation) {
      const ref = chatContainerRefs.current[selectedConversation.id];
      if (ref) {
        ref.scrollTop = ref.scrollHeight;
      }
    }
  }, [currentMessages, selectedConversation]);

  // Efecto para animar notificaciones de nuevos mensajes
  useEffect(() => {
    conversations.forEach((conv) => {
      if (conv.unread_count > 0 && !activeChatIds.includes(conv.id)) {
        setNewMessageAnimation((prev) => ({
          ...prev,
          [conv.id]: true,
        }));

        setTimeout(() => {
          setNewMessageAnimation((prev) => ({
            ...prev,
            [conv.id]: false,
          }));
        }, 2000);
      }
    });
  }, [conversations, activeChatIds]);

  // Función para abrir un chat
  const handleOpenChat = (conversation) => {
    // Si el chat ya está activo, solo lo seleccionamos
    if (activeChatIds.includes(conversation.id)) {
      openChat(conversation);
      return;
    }

    // Si ya tenemos 2 chats activos, minimizamos el más antiguo
    if (activeChatIds.length >= 2) {
      const oldestChatId = activeChatIds[0];
      minimizeChat(oldestChatId);
    }

    // Removemos el chat de los minimizados si estaba allí
    if (minimizedChatIds.includes(conversation.id)) {
      setMinimizedChatIds((prev) =>
        prev.filter((id) => id !== conversation.id)
      );
    }

    // Añadimos el nuevo chat a los activos
    setActiveChatIds((prev) => [...prev, conversation.id]);
    openChat(conversation);
  };

  // Función para minimizar un chat
  const minimizeChat = (chatId) => {
    // Removemos el chat de los activos
    setActiveChatIds((prev) => prev.filter((id) => id !== chatId));

    // Añadimos el chat a los minimizados
    if (!minimizedChatIds.includes(chatId)) {
      setMinimizedChatIds((prev) => [...prev, chatId]);
    }
  };

  // Función para cerrar un chat
  const closeSpecificChat = (chatId) => {
    setActiveChatIds((prev) => prev.filter((id) => id !== chatId));
    setMinimizedChatIds((prev) => prev.filter((id) => id !== chatId));

    // Si cerramos el chat seleccionado y hay otros activos, seleccionamos el primero
    if (selectedConversation?.id === chatId && activeChatIds.length > 1) {
      const nextChatId = activeChatIds.find((id) => id !== chatId);
      const nextChat = conversations.find((conv) => conv.id === nextChatId);
      if (nextChat) {
        openChat(nextChat);
      }
    } else if (selectedConversation?.id === chatId) {
      closeChat();
    }
  };

  // Función para enviar un mensaje
  const handleSendMessage = (e, conversationId) => {
    e.preventDefault();
    if (!message.trim()) return;

    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      sendMessage(conversation.other_user_id, message);
      setMessage("");
    }
  };

  // Función para seleccionar un contacto desde el selector
  const handleSelectContact = (conversation) => {
    handleOpenChat(conversation);
    setShowNewChatButton(true);
  };

  return (
    <div className="relative">
      {showNewChatButton ? (
        <NewChatButton onClick={() => setShowNewChatButton(false)} />
      ) : (
        <ContactSelector
          conversations={conversations}
          onSelectContact={handleSelectContact}
          onClose={() => setShowNewChatButton(true)}
        />
      )}

      <MinimizedChatsContainer
        minimizedChatIds={minimizedChatIds}
        conversations={conversations}
        newMessageAnimation={newMessageAnimation}
        onOpenChat={handleOpenChat}
        onCloseChat={closeSpecificChat}
      />

      {activeChatIds.map((chatId, index) => {
        const conversation = conversations.find((conv) => conv.id === chatId);
        if (!conversation) return null;

        const isSelected = selectedConversation?.id === chatId;
        const messages = isSelected ? currentMessages : [];

        return (
          <ActiveChat
            key={chatId}
            conversation={conversation}
            messages={messages}
            isSelected={isSelected}
            position={index}
            loadingMessages={loadingMessages}
            user={user}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onSelectChat={openChat}
            onMinimize={minimizeChat}
            onClose={closeSpecificChat}
            chatContainerRef={(el) => (chatContainerRefs.current[chatId] = el)}
          />
        );
      })}
    </div>
  );
};

export default MultiChatManager;
