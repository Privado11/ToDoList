import { useState, useCallback, useEffect } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTaskContext } from "@/context/TaskContext";
import { ShareWithFriends, UserSearchShare } from "@/features";

const TaskShareDialog = ({ taskId, isShared }) => {
  const { shareTask, getAvailableFriendsForTask } = useTaskContext();
  const [friendsList, setFriendsList] = useState([]);
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friends = await getAvailableFriendsForTask(taskId);
        setFriendsList(friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setShareError("Failed to load friends list");
      }
    };

    if (taskId) {
      fetchFriends();
    }
  }, [taskId, getAvailableFriendsForTask, shareTask]);

  const handleShareWithUser = useCallback(
    async (recipientId) => {
      setIsSharing(true);
      setShareError(null);
      try {
        const response = await shareTask(recipientId);
        setMessage(response.message || "Task successfully shared");
      } catch (error) {
        setShareError("Error when sharing the task");
        console.error("Error sharing task:", error);
      } finally {
        setIsSharing(false);
      }
    },
    [shareTask]
  );

  const handleShareWithFriends = useCallback(
    async (selectedFriends) => {
      if (!selectedFriends || selectedFriends.length === 0) {
        setShareError("Please select at least one friend");
        return;
      }

      setIsSharing(true);
      setShareError(null);
      try {
        const friendIds = selectedFriends.map((friend) => friend.friend_id);

        const response = await shareTask(friendIds);

        setMessage(response.message || "Task successfully shared with friends");
      } catch (error) {
        setShareError("Error sharing with friends");
        console.error("Error sharing with friends:", error);
      } finally {
        setIsSharing(false);
      }
    },
    [taskId, shareTask]
  );

  const handleDialogClose = useCallback(() => {
    setMessage("");
    setShareError(null);
  }, []);

  const ShareButton = () => (
    <Button variant="outline" className="gap-2 text-lg" disabled={isShared}>
      <Share className="w-5 h-5" />
      Share
    </Button>
  );

  return (
      <Dialog onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          {isShared ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <ShareButton />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    You cannot share this task because it is being shared with
                    you. <br /> Only the author can share it.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <ShareButton />
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md text-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Share Task</DialogTitle>
          </DialogHeader> 

          <div className="space-y-6">
            <UserSearchShare onShareTask={handleShareWithUser} />

            <ShareWithFriends
              friendsList={friendsList}
              onShareWithFriends={handleShareWithFriends}
              isSharing={isSharing}
            />

            {message && (
              <Alert variant="success">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {shareError && (
              <Alert variant="destructive">
                <AlertDescription>{shareError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default TaskShareDialog;
