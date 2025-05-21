import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

const SharedTaskUserList = ({ users }) => {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      {users.length > 0 ? (
        <div className="flex -space-x-2 overflow-hidden">
          <TooltipProvider>
            {users.slice(0, 4).map((collaborator, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900">
                    <AvatarImage
                      src={
                        collaborator?.profile?.full_name?.[0] || collaborator
                      }
                      alt={
                        collaborator?.profile?.full_name ||
                        `Collaborator ${i + 1}`
                      }
                    />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {collaborator?.profile?.full_name?.[0] || `C${i + 1}`}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {collaborator?.profile?.full_name ||
                      `Collaborator ${i + 1}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
            {users.length > 3 && (
              <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700">
                <AvatarFallback className="text-xs text-gray-600 dark:text-gray-300">
                  +{users.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </TooltipProvider>
        </div>
      ) : (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          No collaborators
        </span>
      )}
    </div>
  );
};

export default SharedTaskUserList;
