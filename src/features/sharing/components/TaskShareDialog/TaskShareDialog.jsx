import { useState, useCallback, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTaskContext } from "@/context/TaskContext";
import { ShareWithFriends, UserSearchShare } from "@/features";

const TaskShareDialog = ({ taskId, open, setOpen }) => {
  const {shareTask, getAvailableFriendsForTask } = useTaskContext();
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

    if (taskId && open) {
      fetchFriends();
    }
  }, [taskId, getAvailableFriendsForTask, open]); 

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
    [shareTask, taskId]
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
        const response = await shareTask(taskId, friendIds);
        setMessage(response.message || "Task successfully shared with friends");
      } catch (error) {
        setShareError("Error sharing with friends");
        console.error("Error sharing with friends:", error);
      } finally {
        setIsSharing(false);
      }
    },
    [shareTask, taskId]
  );

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setMessage("");
      setShareError(null);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md text-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Share Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <UserSearchShare onShareTask={handleShareWithUser} />

          <ShareWithFriends
            friendsList={friendsList}
            onShareWithFriends={handleShareWithFriends}
            isSharing={isSharing}
          />

          {message && (
            <Alert variant="success">
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}

          {shareError && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                {shareError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskShareDialog;