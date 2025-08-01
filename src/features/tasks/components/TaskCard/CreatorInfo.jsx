import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatorInfo = ({ creator, date }) => {
  const navigate = useNavigate();

  const navigateToProfile = (e) => {
    e.stopPropagation();
    const username = creator?.username?.replace("@", "");
    navigate(`/${username}`);
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {creator.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Creator
              </p>
            </div>
            <Avatar
              className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => navigateToProfile(e)}
            >
              <AvatarImage src={creator.avatar_url} alt={creator.full_name} />
              <AvatarFallback className="bg-purple-500 text-white text-xs">
                {creator.full_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-0 rounded-lg bg-white">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm w-full max-w-md bg-white">
            <div className="px-4 py-3 bg-white dark:bg-gray-950">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Author Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Task details
              </p>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                onClick={(e) => navigateToProfile(e)}
              >
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                      src={creator.avatar_url}
                      alt={creator.full_name}
                    />
                    <AvatarFallback className="bg-purple-500 text-white text-xs">
                      {creator.full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {creator.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {creator.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Created on:{" "}
                  {new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreatorInfo;
