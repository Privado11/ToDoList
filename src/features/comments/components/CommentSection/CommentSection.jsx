import React, { useState, useCallback, useMemo } from "react";
import { Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/context/TaskContext";


function CommentSection() {
  const { comments, addComment: createComment } = useTaskContext();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
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
  );
}

export default CommentSection;
