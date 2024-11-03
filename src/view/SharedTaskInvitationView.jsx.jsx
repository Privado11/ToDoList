import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useTodos } from "@/components/hooks/useTodos";
import { useParams } from "react-router-dom";

const SharedTaskInvitationView = ({}) => {
  const { getTodoInvitedById, updateInvitationStatus } = useTodos();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTask = await getTodoInvitedById(token);
      if (!fetchedTask) {
        throw new Error("Task not found");
      }
      setTask(fetchedTask);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, getTodoInvitedById]);

  useEffect(() => {
    if (token) {
      fetchTask();
    }
  }, [token, fetchTask]);

  useEffect(() => {
    console.log("Task:", task);
  }, [task]);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await updateInvitationStatus(token, "accepted");
      console.log("Task accepted");
    } catch (error) {
      console.error("Error accepting invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDescription = useCallback((description) => {
    return description?.replace(/\n/g, "<br />") || "No description provided.";
  }, []);

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await updateInvitationStatus(token, "rejected");
     console.log("Task rejected");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert className="mb-6 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            Task not found or invalid invitation
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      {/* Estado de la invitación */}
      {task.status === "pending" && (
        <Alert className="mb-6 bg-yellow-50 flex items-center p-4 space-x-2">
          <Clock className="h-5 w-5" />
          <AlertDescription className="flex items-center text-sm">
            You have a pending invitation to collaborate on this task
          </AlertDescription>
        </Alert>
      )}

      {task.status === "accepted" && (
        <Alert className="mb-6 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            You have accepted this task invitation
          </AlertDescription>
        </Alert>
      )}

      {task.status === "rejected" && (
        <Alert className="mb-6 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            You have rejected this task invitation
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">
            {task?.todos?.title || "Untitled Task"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            Shared by: {task.sender_name || "Unknown"} (
            {task.sender_email || ""})
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <p
                className="text-gray-600 text-lg"
                dangerouslySetInnerHTML={{
                  __html: formatDescription(task?.todos?.description),
                }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-4 border-t pt-4">
          {task.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
                className="border-red-500 text-red-500 hover:bg-red-50 text-lg"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Invitation
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isLoading}
                className="bg-blue-500 text-white hover:bg-blue-600 text-lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Invitation
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export { SharedTaskInvitationView };
