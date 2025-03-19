import { useState, useEffect, useCallback } from "react";
import { useAuthLogic } from "@/features";
import { CommentService } from "@/service";
import { useCommentsSubscription } from "@/features/tasks/hooks/useTaskSubscription";

export const useComments = (taskId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const { subscribeToComments, unsubscribe: unsubscribeFromComments } =
    useCommentsSubscription(setComments);

  useEffect(() => {
    if (taskId) {
      subscribeToComments(taskId, () => CommentService.getComments(taskId));
    }

    return () => {
      unsubscribeFromComments();
    };
  }, [taskId, subscribeToComments, unsubscribeFromComments]);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const data = await CommentService.getComments(taskId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los comentarios");
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId, fetchComments]);

  const addComment = async (content) => {
    if (!taskId || !user?.id) return;

    try {
      const optimisticComment = CommentService.createOptimisticComment(
        content,
        taskId,
        user
      );

      setComments((prev) => [...prev, optimisticComment]);

      const savedComment = await CommentService.saveComment(
        content,
        taskId,
        user.id
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === optimisticComment.id ? savedComment : comment
        )
      );

      return savedComment;
    } catch (err) {
      setComments((prev) =>
        prev.filter((comment) => comment.id !== `temp-${Date.now()}`)
      );
      setError("Error al crear el comentario");
      throw err;
    }
  };

  const updateComment = async (commentId, newContent) => {
    if (!taskId) return;

    try {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: newContent }
            : comment
        )
      );

      const updatedComment = await CommentService.updateComment(
        commentId,
        newContent
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );

      return updatedComment;
    } catch (err) {
      await fetchComments();
      setError("Error al actualizar el comentario");
      throw err;
    }
  };

  const deleteComment = async (commentId) => {
    if (!taskId) return;

    try {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      await CommentService.deleteComment(commentId);
    } catch (err) {
      await fetchComments();
      setError("Error al eliminar el comentario");
      throw err;
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refreshComments: fetchComments,
  };
};
