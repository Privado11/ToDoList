import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/context/TaskContext";


const SharedWithSection = () => {
  const [taskToDelete, setTaskToDelete] = useState(null);
  const {
    sharedTasks,
    cancelShareTask,
    error: contextError,
  } = useTaskContext();
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    console.log("Shared Tasks:", sharedTasks);
  }, [sharedTasks]);



  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const handleDeleteSharedTask = async (id) => {
    try {
      await cancelShareTask(id);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.message || "Failed to delete shared task");
    }
  };

  const confirmDeleteTasks = () => {
    if (taskToDelete) handleDeleteSharedTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const cancelDeleteTask = () => {
    setTaskToDelete(null);
  };

  const ErrorAlert = ({ error }) => (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!sharedTasks || sharedTasks.length === 0) {
    return (
      <Card className="mt-6">
        {(contextError || localError) && (
          <ErrorAlert error={contextError || localError} />
        )}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With
          </CardTitle>
          <Badge variant="secondary">0 task</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-base">
            No pending or accepted shared tasks found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      {contextError && <ErrorAlert error={contextError} />}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Shared With
        </CardTitle>
        <Badge variant="secondary">
          {sharedTasks.length} {sharedTasks.length === 1 ? "user" : "users"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sharedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={task.profile.avatar || "/api/placeholder/32/32"}
                />
                <AvatarFallback>
                  {task?.profile?.full_name
                    ? task.profile.full_name[0].toUpperCase()
                    : task?.profile?.username
                    ? task.profile.username[1].toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-base">
                  {task.profile?.full_name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {task.profile?.username || "No username provided"}
                </p>
              </div>
              <Badge
                variant={task.status === "accepted" ? "success" : "warning"}
                className="capitalize"
              >
                {task.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${task.recipient_name}`}
                onClick={() => handleDeleteTask(task)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      {taskToDelete && (
        <AlertDialog open={!!taskToDelete} onOpenChange={cancelDeleteTask}>
          <AlertDialogPortal>
            <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
            <AlertDialogContent className="fixed top-[50%] left-[50%] max-w-[450px] w-[90vw] -translate-x-[50%] -translate-y-[50%] rounded-lg bg-white p-6 shadow-lg">
              <AlertDialogTitle className="text-2xl font-bold">
                {taskToDelete.status === "pending"
                  ? "Cancel Invitation"
                  : "Confirm Delete"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 mt-2 text-lg">
                Are you sure you want to{" "}
                {taskToDelete.status === "pending"
                  ? "cancel the invitation for"
                  : "remove"}{" "}
                <strong>
                  {taskToDelete.profile.full_name || "this task"}?{" "}
                </strong>
              </AlertDialogDescription>
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  className="text-lg"
                  variant="outline"
                  onClick={cancelDeleteTask}
                >
                  Cancel
                </Button>
                <Button
                  className="text-lg"
                  variant="destructive"
                  onClick={confirmDeleteTasks}
                >
                  Delete
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      )}
    </Card>
  );
};

export { SharedWithSection };
