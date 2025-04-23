import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Share, Users } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

const UserSearchShare = ({ onShareTask }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { query, setQuery, users, isLoading, error } = useTaskContext();
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    console.log(selectedUsers);
  }, [selectedUsers]);

  const handleSelectUser = useCallback(
    (user) => {
      setSelectedUsers((prev) => [...prev, user]);
      setQuery("");
    },
    [selectedUsers]
  );

  const removeUser = useCallback((userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  const handleShareWithUser = useCallback(
    async (user) => {
      setSharing(true);
      try {
        await onShareTask(user.user_id);
        removeUser(user.id);
      } catch (error) {
        console.error("Sharing error:", error);
      } finally {
        setSharing(false);
      }
    },
    [onShareTask, removeUser]
  );

  const handleShareWithAll = useCallback(
    async (user) => {
      if (selectedUsers.length === 0) return;
      setSharing(true);
      try {
        const userIds = selectedUsers.map((user) => user.user_id);
        await onShareTask(userIds);
        setSelectedUsers([]);
      } catch (error) {
        console.error("Sharing error:", error);
      } finally {
        setSharing(false);
      }
    },
    [selectedUsers, onShareTask]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <h3 className="text-lg font-medium mb-2">Share with user</h3>
        <div className="flex gap-2">
          <div className="relative flex-1 text-sm">
            <Input
              type="text"
              placeholder="Search user..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm w-full"
            />

            {query.trim() !== "" && (
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
                    {users.map((user, index) => (
                      <li
                        key={`search-${user.id || index}`}
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

      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          {selectedUsers.length > 1 && (
            <div className="flex justify-end mb-2">
              <Button
                onClick={handleShareWithAll}
                disabled={sharing}
                className="flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                {sharing
                  ? "Sharing..."
                  : `Share with all (${selectedUsers.length})`}
              </Button>
            </div>
          )}

          {selectedUsers.map((user, index) => (
            <div
              key={`selected-${user.id || index}`}
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
                  onClick={() => handleShareWithUser(user)}
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
      )}
    </div>
  );
};

export default UserSearchShare;
