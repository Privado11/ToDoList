import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SharedTaskUserList = ({ users = [] }) => {
  const navigate = useNavigate();

  const navigateToProfile = (e, collaborator) => {
    e.stopPropagation();
    const username = collaborator?.profile?.username?.replace("@", "");
    navigate(`/${username}`);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              {users.length > 0 ? (
                <div className="flex -space-x-2 overflow-hidden">
                  {users.slice(0, 3).map((collaborator, i) => (
                    <Avatar
                      key={i}
                      className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => navigateToProfile(e, collaborator)}
                    >
                      <AvatarImage
                        src={collaborator?.profile?.avatar_url}
                        alt={collaborator?.profile?.full_name}
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {collaborator?.profile?.full_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {users.length > 3 && (
                    <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700">
                      <AvatarFallback className="text-xs text-gray-600 dark:text-gray-300">
                        +{users.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No collaborators
                </span>
              )}
            </div>
          </TooltipTrigger>
          {users.length > 0 && (
            <TooltipContent className="ml-4 p-0 rounded-lg bg-white border border-gray-200">
              <div className="rounded-lg dark:border-gray-800 shadow-sm w-full max-w-md bg-white">
                <div className="px-4 py-3 bg-white dark:bg-gray-950">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Collaborators
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    People who have access to this task
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {users.map((collaborator, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 border-t border-gray-100 dark:border-gray-800"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                        onClick={(e) => navigateToProfile(e, collaborator)}
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          <Avatar className="h-10 w-10 rounded-full">
                            <AvatarImage
                              src={collaborator?.profile?.avatar_url}
                              alt={collaborator?.profile?.full_name}
                            />
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {collaborator?.profile?.full_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {collaborator.is_me
                              ? collaborator?.profile?.full_name + " (You)"
                              : collaborator?.profile?.full_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {collaborator?.profile?.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SharedTaskUserList;
