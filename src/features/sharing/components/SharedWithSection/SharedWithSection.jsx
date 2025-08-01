import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

import { useTaskContext } from "@/context/TaskContext";
import SharedWithList from "./SharedWithList";
import { DialogConfirmation } from "@/view/DialogConfirmation";

const SharedWithSection = ({ usersInSharedTasks = [] }) => {
  const [userToDelete, setUserToDelete] = useState(null);
  const { cancelShareTask } = useTaskContext();


  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };


  const handleDeleteSharedTask = async (id) => {
    try {
      await cancelShareTask(id);
     
    } catch (err) {
     
    }
  };

  const confirmDeleteUser = () => {
    if (userToDelete) handleDeleteSharedTask(userToDelete.shared_task_id);
    setUserToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Shared With
        </CardTitle>
        <Badge variant="secondary" className="text-sm sm:text-base">
          {usersInSharedTasks.length} {usersInSharedTasks.length <= 1 ? "user" : "users"}
        </Badge>
      </CardHeader>
      <CardContent>
        <SharedWithList
          SharedWithList={usersInSharedTasks}
          onDeleteUser={handleDeleteUser}
        />
      </CardContent>

      <DialogConfirmation
        isOpen={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title={
          userToDelete?.status === "pending"
            ? "Cancel Invitation"
            : "Confirm Delete"
        }
        description={
          <>
            {userToDelete?.is_current_user ? (
              "You want to leave this shared task?"
            ) : userToDelete?.status === "pending" ? (
              <>
                Cancel the invitation for{" "}
                <strong>
                  {userToDelete?.full_name}
                </strong>
                ?
              </>
            ) : (
              <>
                You want to stop sharing this task with{" "}
                <strong>
                  {userToDelete?.full_name}
                </strong>
                ?
              </>
            )}
          </>
        }
        cancelText="Cancel"
        confirmText="Yes, confirm"
      />
    </Card>
  );
};

export default SharedWithSection;
