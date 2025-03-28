import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

const MessageInput = ({
  message,
  setMessage,
  handleSendMessage,
  loadingMessages,
  selectedConversation,
}) => {
  return (
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
        disabled={!message.trim() || loadingMessages || !selectedConversation}
      >
        <SendHorizontal size={18} />
      </Button>
    </form>
  );
};

export default MessageInput;
