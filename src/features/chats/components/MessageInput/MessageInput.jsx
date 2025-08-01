import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

const MessageInput = ({
  conversation,
  message,
  setMessage,
  handleSendMessage,
  loadingMessages,
  isSelected,
  onSelectChat,
}) => {
  const inputRef = useRef(null);


  useEffect(() => {
    if (isSelected && inputRef.current && !loadingMessages) {
      inputRef.current.focus();
    }
  }, [isSelected, loadingMessages]);

  return (
    <form
      onSubmit={handleSendMessage}
      className="border-t p-3 flex gap-2 bg-card"
    >
      <Input
        ref={inputRef}
        placeholder="Write a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
        onClick={() => !isSelected && onSelectChat(conversation)}
        disabled={loadingMessages}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || loadingMessages}
      >
        <SendHorizontal size={18} />
      </Button>
    </form>
  );
};

export default MessageInput;
