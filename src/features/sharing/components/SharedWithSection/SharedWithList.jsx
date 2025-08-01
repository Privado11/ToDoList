import React, { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SharedWithList = ({ SharedWithList, onDeleteUser }) => {
  const navigate = useNavigate();

  const is_shared = useMemo(
    () => SharedWithList.some((user) => user.shared_status === "creator"),
    [SharedWithList]
  );

  const handleUserClick = (user) => {
    const username = user?.username.replace("@", "");
    navigate(`/${username}`);
  };

  return (
    <div className="space-y-4">
      {SharedWithList.length === 0 ? (
        <p className="text-gray-500 text-base sm:text-lg">
          This task has not been shared.
        </p>
      ) : (
        SharedWithList.map((user, index) => (
          <div
            key={`${user.user_id || index}`}
            className="flex items-center justify-between bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors p-2"
          >
            <div className="flex items-center gap-3 flex-grow overflow-hidden">
              <Avatar
                className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleUserClick(user)}
              >
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback>
                  {user?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p
                  className="font-medium text-base sm:text-lg hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  {user.full_name} {user.is_current_user && "(You)"}
                  {user.is_creator && " (Creator)"}
                </p>
                <p className="text-sm sm:text-base text-gray-500 truncate">
                  {user.username}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <Badge
                variant={
                  user.shared_status === "accepted" ? "success" : "warning"
                }
                className="capitalize text-xs sm:text-sm"
              >
                {user.shared_status}
              </Badge>
              {!is_shared || (is_shared && user.is_current_user) ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${user.full_name}`}
                  onClick={() => onDeleteUser(user)}
                  className="hover:bg-red-100 text-red-500"
                  title="Delete"
                >
                  <X className="w-5 h-5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SharedWithList;
