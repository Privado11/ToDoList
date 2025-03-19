import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Share } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

const UserSearchShare = ({ onShareTask }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const {users, isLoading, error, fetchUsers } = useTaskContext();
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchUsers(searchQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchUsers]);

  const handleSelectUser = useCallback(
    (user) => {
      if (!selectedUsers.some((selected) => selected.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
      setSearchQuery("");
      setShowResults(false);
    },
    [selectedUsers]
  );

  const removeUser = useCallback((userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  const handleShare = useCallback(
    async (user) => {
      setSharing(true);
      console.log("sharing with user_id:", user.user_id);
      try {
        await onShareTask(user.user_id);
        removeUser(user.id);
      } catch (error) {
        console.error("Error al compartir:", error);
      } finally {
        setSharing(false);
      }
    },
    [onShareTask, removeUser]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <h3 className="text-lg font-medium mb-2">Share with user</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Remove the user from the selected list after successful sharing
              className="text-lg w-full"
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setShowResults(true);
                }
              }}
            />

            {showResults && (
              <div
                className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading && (
                  <div className="p-4 text-center text-gray-500">
                    Searching for...
                  </div>
                )}

                {!isLoading && error && (
                  <div className="p-4 text-center text-red-500">{error}</div>
                )}

                {!isLoading && !error && users && users.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No users found
                  </div>
                )}

                {!isLoading && !error && users && users.length > 0 && (
                  <ul>
                    {users.map((user) => (
                      <li
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.username?.[0] || user.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || "Sin nombre"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.username}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.[0] || user.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {user.full_name || "Sin nombre"}
                </div>
                <div className="text-sm text-gray-500">{user.username}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(user)}
                className="flex items-center gap-1"
                disabled={sharing}
              >
                <Share className="w-4 h-4" />
                {sharing ? "Sharing..." : "Share"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUser(user.id)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchShare;
