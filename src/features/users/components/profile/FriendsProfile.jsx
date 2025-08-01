import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Info,
  Lock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FriendsProfile = ({
  isOwnProfile,
  friendsList,
  viewedProfileFriends,
  pendingRequests,
  openChat,
  onSendRequest,
  onCancelRequest,
  onRemove,
  onAccept,
  onReject,
  isAnonymous,
  tasks,
  privacy ,
}) => {
  const [friends, setFriends] = useState(
    isOwnProfile ? friendsList : viewedProfileFriends.friends || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();



  useEffect(() => {
    setFriends(isOwnProfile ? friendsList : viewedProfileFriends.friends || []);
  }, [isOwnProfile, friendsList, viewedProfileFriends]);

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filteredPendingRequests = pendingRequests.filter((request) => {
    const matchesSearch =
      request.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleAddFriend = (friendId) => {
    if (isAnonymous) return;
    onSendRequest(friendId);
  };

  const handleCancelFriendRequest = (request) => {
    if (isAnonymous) return;
    onCancelRequest(request);
  };

  const handleAcceptFriendRequest = (request) => {
    if (isAnonymous) return;
    onAccept(request);
  };

  const handleRejectFriendRequest = (request) => {
    if (isAnonymous) return;
    onReject(request);
  };

  const handleRemoveFriend = (friend) => {
    if (isAnonymous) return;
    onRemove(friend);
  };

  const navigateToProfile = (username) => {
    const cleanUsername = username?.replace("@", "");
    navigate(`/${cleanUsername}`);
  };


  if (isAnonymous) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="text-center">
              <Lock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-amber-900 mb-2">
                Friends Feature Unavailable
              </h3>
              <p className="text-amber-800 max-w-md mx-auto">
                The friends feature is not available for anonymous users. Please
                create an account or link your account to connect with friends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Friends {friends.length > 0 && `(${friends.length})`}
          </CardTitle>
         
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "all"
                  ? "Search for friends..."
                  : "Search friend requests..."
              }
              className="!pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isOwnProfile && (
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
                className="flex-1"
              >
                Everyone
              </Button>

              <Button
                variant={activeTab === "requests" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("requests")}
                className="flex-1"
              >
                Friend requests ({pendingRequests.length})
              </Button>
            </div>
          )}
        </div>

        {activeTab === "requests" && isOwnProfile ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredPendingRequests.length > 0 ? (
                filteredPendingRequests.map((request) => (
                  <div
                    key={request.request_id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigateToProfile(request.username)}
                      >
                        <AvatarImage
                          src={request.avatar_url || "/placeholder.svg"}
                          alt={request.full_name}
                        />
                        <AvatarFallback>
                          {request.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-medium cursor-pointer hover:underline transition-all duration-200"
                          onClick={() => navigateToProfile(request.username)}
                        >
                          {request.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {request.shared_tasks_count > 0 && (
                        <Badge variant="outline" className="hidden sm:flex">
                          {request.shared_tasks_count} shared tasks
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500"
                        onClick={() =>
                          handleRejectFriendRequest(request.request_id)
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAcceptFriendRequest(request.request_id)
                        }
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery
                    ? "No friend requests found with that search."
                    : "You don't have any pending friend requests."}
                </p>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.friendship_id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigateToProfile(friend.username)}
                        >
                          <AvatarImage
                            src={friend.avatar_url || "/placeholder.svg"}
                            alt={friend.full_name}
                          />
                          <AvatarFallback>
                            {friend.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p
                          className="font-medium cursor-pointer hover:underline transition-all duration-200"
                          onClick={() => navigateToProfile(friend.username)}
                        >
                          {friend.full_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {friend.username}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {friend.shared_tasks_count > 0 && (
                        <Badge variant="outline" className="hidden sm:flex">
                          {friend.shared_tasks_count} shared tasks
                        </Badge>
                      )}
                      {isOwnProfile && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openChat(friend)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                      {(isOwnProfile || friend?.is_my_friend) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() =>
                                handleRemoveFriend(friend.friend_id)
                              }
                            >
                              Remove friend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {!isOwnProfile && !friend.am_i_this_friend && (
                        <>
                          {friend.has_pending_request &&
                            !friend.i_sent_request && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm">Reply</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleAcceptFriendRequest(
                                        friend.pending_request_id
                                      )
                                    }
                                  >
                                    Accept
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 cursor-pointer"
                                    onClick={() =>
                                      handleRejectFriendRequest(
                                        friend.pending_request_id
                                      )
                                    }
                                  >
                                    Reject
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                          {friend.has_pending_request &&
                            friend.i_sent_request && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCancelFriendRequest(
                                    friend.pending_request_id
                                  )
                                }
                              >
                                Cancel request
                              </Button>
                            )}

                          {!friend.is_my_friend &&
                            !friend.has_pending_request && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAddFriend(friend.friend_id)
                                }
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Friend
                              </Button>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery
                    ? "No friends were found with that search."
                    : "No friends to show."}
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsProfile;
