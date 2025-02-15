import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar, Send, ArrowLeft, Share, X, Plus, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SharedWithSection } from "./SharedWithSection";
import { useTaskContext } from "@/components/context/TaskContext";

import { CommentSection } from "./CommentSection";
import AttachmentSection from "./AttachmentSection";

function TaskDetail() {
  const {
    getTaskById,
    selectedTask,
    clearSelectedTask,
    shareTask,
    deleteSharedTask,
    attachments,
  } = useTaskContext();


  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);
   const [isInitialLoad, setIsInitialLoad] = useState(true);


  const friendsList = useMemo(
    () => [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "/api/placeholder/32/32",
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        avatar: "/api/placeholder/32/32",
      },
    ],
    []
  );

   useEffect(() => {
     if (selectedTask) {
       console.log("Selected Task Updated:", selectedTask);
     }
   }, [selectedTask]);

   // Separated task fetching logic into its own useEffect
   useEffect(() => {
     let isMounted = true;

     const fetchTask = async () => {
       if (!id || !isInitialLoad) return;

       try {
         await getTaskById(id);
       } catch (err) {
         if (isMounted) {
           setError(err.message || "Failed to fetch task");
         }
       } finally {
         if (isMounted) {
           setLoading(false);
           setIsInitialLoad(false);
         }
       }
     };

     fetchTask();

     return () => {
       isMounted = false;
       clearSelectedTask();
     };
   }, [id, getTaskById, isInitialLoad]);

  const handleShareByEmail = useCallback(async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      const response = await shareTask(id, shareEmail, true);
      setMessage(response.message);
      setShareEmail("");
    } catch (error) {
      setShareError("Error al compartir la tarea");
    } finally {
      setIsSharing(false);
    }
  }, [id, shareEmail, shareTask]);

  const handleFriendSelect = useCallback(
    (friendId) => {
      const friend = friendsList.find((f) => f.id.toString() === friendId);
      if (friend && !selectedFriends.some((f) => f.id === friend.id)) {
        setSelectedFriends((prev) => [...prev, friend]);
      }
    },
    [friendsList, selectedFriends]
  );

  const removeFriend = useCallback((friendId) => {
    setSelectedFriends((prev) =>
      prev.filter((friend) => friend.id !== friendId)
    );
  }, []);

  const handleShareWithFriends = useCallback(async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      // Aquí iría la llamada a la API para compartir con amigos
      console.log(`Compartiendo tarea ${id} con amigos:`, selectedFriends);
      // Simular éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSelectedFriends([]);
    } catch (error) {
      setShareError("Error al compartir con amigos");
    } finally {
      setIsSharing(false);
    }
  }, [id, selectedFriends]);


  const handleBack = useCallback(() => navigate("/"), [navigate]);
  const handleEdit = useCallback(
    () => navigate(`/edit-task/${id}`),
    [navigate, id]
  );

  const handleDialogClose = useCallback(() => {
    setMessage(null);
  }, []);

  const formatDescription = useCallback((description) => {
    return description?.replace(/\n/g, "<br />") || "No description provided.";
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "Invalid date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch {
      return "Invalid date";
    }
  }, []);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading task details...</p>
      </div>
    );
  }

  if (error && !selectedTask) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="ghost" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert>
          <AlertDescription>Task not found.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="ghost" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {selectedTask.task.title}
            </h1>
            <div className="flex gap-4">
              <Badge variant="outline" className="gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                {selectedTask.task.due_date
                  ? formatDateTime(selectedTask.task.due_date)
                  : "No due date"}
              </Badge>
              <Badge className="bg-red-100 text-red-500 text-sm">
                {selectedTask.priorities.level || "No priority"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-500 text-sm">
                {selectedTask.statuses.name || "No status"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-lg">
                  <Share className="w-5 h-5" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md text-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">Share Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Compartir por email */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Share by email</h3>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="flex-1 text-lg"
                      />
                      <Button
                        onClick={handleShareByEmail}
                        disabled={!shareEmail || isSharing}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Compartir con amigos */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Share with friends</h3>
                    <Select onValueChange={handleFriendSelect}>
                      <SelectTrigger className="text-lg font-normal">
                        <SelectValue placeholder="Select a friend" />
                      </SelectTrigger>
                      <SelectContent>
                        {friendsList.map((friend) => (
                          <SelectItem
                            key={friend.id}
                            value={friend.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback>
                                  {friend.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              {friend.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Lista de amigos seleccionados */}
                    <div className="space-y-2 mt-4">
                      {selectedFriends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{friend.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFriend(friend.id)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

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

                  {selectedFriends.length > 0 && (
                    <Button
                      className="w-full"
                      onClick={handleShareWithFriends}
                      disabled={isSharing}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Share with {selectedFriends.length} friend
                      {selectedFriends.length !== 1 ? "s" : ""}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button className="text-lg" onClick={handleEdit}>
              Edit Task
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p
              className="text-gray-600 text-lg"
              dangerouslySetInnerHTML={{
                __html: formatDescription(selectedTask.task.description),
              }}
            />
          </CardContent>
        </Card>

        <AttachmentSection attachments={attachments} />

        <SharedWithSection />

        <CommentSection />
      </div>
    </div>
  );
}

export { TaskDetail };
