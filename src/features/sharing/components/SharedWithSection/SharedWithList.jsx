import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

function SharedWithList({ SharedWithList, onDeleteUser }) {
  return (
    <div className="space-y-4">
      {SharedWithList.length === 0 ? (
        <p className="text-gray-500 text-base sm:text-lg">
          This task has not been shared.
        </p>
      ) : (
        SharedWithList.map((user, index) => (
          <div
            key={`${user.profile.full_name}-${index}`}
            className="flex items-center justify-between bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-grow overflow-hidden">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user?.profile?.avatar || "/api/placeholder/32/32"}
                />
                <AvatarFallback>
                  {user?.profile?.full_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-base sm:text-lg">
                  {user.profile?.full_name || "Unknown User"}
                </p>
                <p className="text-sm sm:text-lg text-gray-500  ">
                  {user.profile?.username || "No username provided"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <Badge
                variant={user.status === "Accepted" ? "success" : "warning"}
                className="capitalize text-xs sm:text-lg"
              >
                {user.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${user.recipient_name}`}
                onClick={() => onDeleteUser(user)}
                className="hover:bg-red-100 text-red-500"
                title="Delete"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SharedWithList;
