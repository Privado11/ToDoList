import React, { useState, useCallback, useEffect } from "react";
import { Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/context/TaskContext";

function CommentSection({ highlightedComment }) {
  const { comments, addComment: createComment } = useTaskContext();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (highlightedComment) {
      const commentElement = document.getElementById(highlightedComment);

      if (commentElement) {
        commentElement.scrollIntoView({ behavior: "smooth", block: "center" });

        commentElement.classList.add("highlighted-comment");

        setTimeout(() => {
          commentElement.classList.remove("highlighted-comment");
        }, 3000);
      }
    }
  }, [highlightedComment, comments]);

  const handleCommentChange = useCallback((e) => {
    setComment(e.target.value);
    setError(null);
  }, []);

  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const trimmedComment = comment.trim();
      if (!trimmedComment) {
        setError("Comment cannot be empty");
        return;
      }

      setIsSubmitting(true);

      try {
        await createComment(trimmedComment);
        setComment("");
      } catch (err) {
        setError(err.message || "Failed to submit comment");
        console.error(err);
        setComment(trimmedComment);
      } finally {
        setIsSubmitting(false);
      }
    },
    [comment, createComment]
  );

  const formatRelativeTime = useCallback((dateString) => {
    if (!dateString) return "Invalid date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} s`;
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} h`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `hace ${diffInDays} d`;
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `hace ${diffInMonths} ${
          diffInMonths === 1 ? "month" : "months"
        }`;
      }

      const diffInYears = Math.floor(diffInMonths / 12);
      return `hace ${diffInYears} ${diffInYears === 1 ? "year" : "years"}`;
    } catch {
      return "Invalid date";
    }
  }, []);

  useEffect(() => {
    console.log("highlightedComment", highlightedComment);
  }, [highlightedComment]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                id={comment.id}
                className={`flex gap-4 p-3 rounded-lg transition-all duration-300`}
              >
                <Avatar>
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>
                    {comment?.profiles?.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-semibold text-lg">
                      {comment?.profiles?.full_name}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 text-base break-words">
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
  );
}

export default CommentSection;
