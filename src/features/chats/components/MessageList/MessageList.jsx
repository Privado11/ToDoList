import React, { useLayoutEffect } from "react";
import { MessageItem } from "..";

const MessageList = ({

  messages,
  loadingMessages,
  groupedMessages,
  chatContainerRef,
  onRetryMessage,
  onDeleteMessage,
}) => {
  useLayoutEffect(() => {
    if (chatContainerRef && chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, chatContainerRef]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          There are no messages in this conversation.
          <br />
          Send a message to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
      ref={chatContainerRef}
    >
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex justify-center my-2">
            <div className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
              {date}
            </div>
          </div>
          {msgs.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onRetryMessage={onRetryMessage}
              onDeleteMessage={onDeleteMessage}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
