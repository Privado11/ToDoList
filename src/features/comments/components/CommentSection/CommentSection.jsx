import React, { useState, useCallback } from "react";
import { MessageSquareQuote, Send, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/context/TaskContext";
import CommentList from "./CommentList";
import { DialogConfirmation } from "@/view/DialogConfirmation";

function CommentSection({ comments, highlightedComment }) {
  const {
    addComment: createComment,
    deleteComment,
    updateComment,
  } = useTaskContext();
  const [comment, setComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  

  const handleCommentChange = useCallback((e) => {
    setComment(e.target.value);
    setError(null);
  }, []);

  const handleEditedContentChange = useCallback((e) => {
    setEditedContent(e.target.value);
    setError(null);
  }, []);

  const handleEditComment = useCallback(
    (commentId) => {
      const commentToEdit = comments.find((c) => c.id === commentId);
      if (commentToEdit) {
        setCommentToEdit(commentToEdit);
        setEditedContent(commentToEdit.content);
      }
    },
    [comments]
  );

  const cancelEdit = useCallback(() => {
    setCommentToEdit(null);
    setEditedContent("");
  }, []);

  const saveEditedComment = useCallback(async () => {
    if (!commentToEdit) return;

    const trimmedContent = editedContent.trim();
    if (!trimmedContent) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateComment(commentToEdit.id, trimmedContent);
      setCommentToEdit(null);
      setEditedContent("");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to update comment");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentToEdit, editedContent, updateComment]);

  const setDeleteComment = useCallback((comment) => {
    setCommentToDelete(comment);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteComment = async () => {
    try {
      if (commentToDelete) {
        await deleteComment(commentToDelete.id);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete comment");
      console.error(err);
    } finally {
      setIsDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setCommentToDelete(null);
  };

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
        setError(null);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommentList
          comments={comments}
          onEditComment={handleEditComment}
          onDeleteComment={setDeleteComment}
          highlightedComment={highlightedComment}
        />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {commentToEdit ? (
          <div className="mt-4">
            <div className="bg-blue-50 p-3 rounded-md mb-2">
              <p className="text-sm text-blue-700 font-medium">
                Editing comment
              </p>
            </div>
            <Textarea
              value={editedContent}
              onChange={handleEditedContentChange}
              className="w-full"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={cancelEdit}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={saveEditedComment}
                disabled={isSubmitting || !editedContent.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        ) : (
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
                  className="gap-2"
                  disabled={isSubmitting || !comment.trim()}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <DialogConfirmation
        isOpen={isDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleDeleteComment}
        title="Confirm Delete"
        description="Are you sure you want to delete this comment?"
        cancelText="Cancel"
        confirmText="Yes, delete"
      />
    </Card>
  );
}

export default CommentSection;
