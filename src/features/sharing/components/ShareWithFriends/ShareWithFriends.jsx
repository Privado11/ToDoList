import { useState, useCallback } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const SharedWithFriends = ({ friendsList, onShareWithFriends, isSharing, loadingFriends }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


  const filteredFriends = friendsList?.filter(friend =>
    friend.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFriendSelect = useCallback(
    (friendId) => {
      const friend = filteredFriends.find((f) => f.friend_id === friendId);
      if (
        friend &&
        !selectedFriends.some((f) => f.friend_id === friend.friend_id)
      ) {
        setSelectedFriends((prev) => [...prev, friend]);
        setSearchTerm(""); 
      }
    },
    [filteredFriends, selectedFriends]
  );

  const removeFriend = useCallback((friendId) => {
    setSelectedFriends((prev) =>
      prev.filter((friend) => friend.friend_id !== friendId)
    );
  }, []);

  const handleShare = useCallback(() => {
    onShareWithFriends(selectedFriends);
    setSelectedFriends([]);
  }, [selectedFriends, onShareWithFriends]);

  const noFriendsAvailable = !friendsList || friendsList.length === 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Share with friends</h3>

      {loadingFriends ? (
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md flex items-center">
          <Loader2 className="w-4 h-4 mr-2 text-gray-400 animate-spin" />
          Friends to share with...
        </div>
      ) : noFriendsAvailable ? (
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          No friends available to share this task with
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />

            <Select onValueChange={handleFriendSelect} value="">
              <SelectTrigger className="text-sm font-normal">
                <SelectValue placeholder="Select a friend" />
              </SelectTrigger>
              <SelectContent>
                {filteredFriends.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    {searchTerm ? "No friends found" : "No friends available"}
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <SelectItem key={friend.friend_id} value={friend.friend_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>{friend.full_name[0]}</AvatarFallback>
                        </Avatar>
                        {friend.full_name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedFriends.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="text-sm font-medium">Selected friends:</div>
              <div className="space-y-2 text-sm">
                {selectedFriends.map((friend) => (
                  <div
                    key={friend.friend_id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback>{friend.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{friend.full_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFriend(friend.friend_id)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedFriends.length > 0 && (
            <Button
              className="w-full mt-4"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Users className="w-4 h-4 mr-2" />
              Share with {selectedFriends.length} friend
              {selectedFriends.length !== 1 ? "s" : ""}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SharedWithFriends;