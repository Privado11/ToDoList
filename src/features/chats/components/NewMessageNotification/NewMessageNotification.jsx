import React from "react";
import { Bell } from "lucide-react";

const NewMessageNotification = () => {
  return (
    <div className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-40 animate-fade-in-out flex items-center gap-2">
      <Bell size={16} />
      <span>New message</span>
    </div>
  );
};

export default NewMessageNotification;
