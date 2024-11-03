import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Send, ArrowLeft, Share, X, Plus, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useTodo } from "@/components/context/TodoContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/context/AuthContext";
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
import { set } from "date-fns";

function TodoDetail() {
  const { getTodoById, createComment, selectedTodo, shareTask } = useTodo();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState([]);
  const [shareEmail, setShareEmail] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  const friendsList = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "/api/placeholder/32/32",
    }
    ,
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
  ];

  

  const handleShareByEmail = async () => {
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
  };

  const handleFriendSelect = (friendId) => {
    const friend = friendsList.find((f) => f.id.toString() === friendId);
    if (friend && !selectedFriends.some((f) => f.id === friend.id)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const removeFriend = (friendId) => {
    setSelectedFriends(
      selectedFriends.filter((friend) => friend.id !== friendId)
    );
  };

  const handleShareWithFriends = async () => {
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
  };

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTask = await getTodoById(id);
      if (!fetchedTask) {
        throw new Error("Task not found");
      }
      setTask(fetchedTask);
      setLocalComments(fetchedTask.comments_with_user_names || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, getTodoById]);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id, fetchTask]);

  useEffect(() => {
    if (selectedTodo && selectedTodo.id === id) {
      setTask(selectedTodo);
      setLocalComments(selectedTodo.comments_with_user_names || []);
    }
  }, [selectedTodo, id]);

  const handleBack = () => {
    navigate("/");
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    if (error) setError(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: trimmedComment,
      created_at: new Date().toISOString(),
      user_name: user?.user_metadata?.full_name || user?.email || "User",
      user_id: user?.id,
    };

    setLocalComments((prev) => [...prev, optimisticComment]);
    setComment("");

    try {
      await createComment(trimmedComment, id);
    } catch (err) {
      setLocalComments((prev) =>
        prev.filter((comment) => comment.id !== optimisticComment.id)
      );
      setError(err.message || "Failed to submit comment");

      setComment(trimmedComment);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (error && !task) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="ghost" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Alert>
          <AlertDescription>Task not found.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="ghost" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const {
    title = "Untitled Task",
    due_date,
    priorities = {},
    statuses = {},
    description,
  } = task;

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <div className="flex gap-4">
              <Badge variant="outline" className="gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                {due_date ? formatDateTime(due_date) : "No due date"}
              </Badge>
              <Badge className="bg-red-100 text-red-500 text-sm">
                {priorities.level || "No priority"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-500 text-sm">
                {statuses.name || "No status"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
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
            <Button className="text-lg">Edit Task</Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p
              className="text-gray-600 text-lg"
              dangerouslySetInnerHTML={{
                __html: formatDescription(description),
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {localComments.length > 0 ? (
                localComments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/api/placeholder/32/32" />
                      <AvatarFallback>{comment.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-semibold text-lg">
                          {comment.user_name}
                        </p>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1 text-base">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 items-start">
              <Avatar>
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  onChange={handleCommentChange}
                  className="w-full"
                  value={comment}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleCommentSubmit}
                    className="gap-2 text-lg"
                    disabled={isSubmitting || !comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { TodoDetail };
