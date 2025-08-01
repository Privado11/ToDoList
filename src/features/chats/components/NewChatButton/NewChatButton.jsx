import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NewChatButton = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg z-50"
          >
            <Edit size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <span>New message</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NewChatButton;
