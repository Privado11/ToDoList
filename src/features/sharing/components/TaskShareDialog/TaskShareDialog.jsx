import { useState, useCallback, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareWithFriends, UserSearchShare } from "@/features";
import { useTaskContext } from "@/context";

const TaskShareDialog = ({ taskId, open, setOpen }) => {
  const {
    shareTask,
    friendsList,
    getAvailableFriendsForTask,
    setTasksToShare,
    setSelectedUsers,
    loadingStates,
  } = useTaskContext();

  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      setTasksToShare(taskId);
    }

    return () => {
      if (!open) {
        setTasksToShare(null);
      }
    };
  }, [open, taskId, setTasksToShare]);

  const fetchFriends = useCallback(async () => {
    if (!taskId || !open) return;
    getAvailableFriendsForTask();
  }, [taskId, open, getAvailableFriendsForTask]);

  useEffect(() => {
    if (open && taskId) {
      fetchFriends();
    }
  }, [open, taskId, fetchFriends]);

  const handleShareWithFriends = useCallback(
    async (selectedFriends) => {
      if (!selectedFriends || selectedFriends.length === 0) {
        return;
      }

      setIsSharing(true);

      try {
        const friendIds = selectedFriends.map((friend) => friend.friend_id);
        await shareTask(friendIds);
      } catch (error) {
      } finally {
        setIsSharing(false);
      }
    },
    [shareTask]
  );

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setTasksToShare(null);
      setSelectedUsers([]);
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
          <UserSearchShare handleOpenChange={handleOpenChange} />

          <ShareWithFriends
            friendsList={friendsList}
            onShareWithFriends={handleShareWithFriends}
            isSharing={isSharing}
            loadingFriends={loadingStates.getFriends}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskShareDialog;
