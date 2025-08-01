import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useParams } from "react-router-dom";
import { useTaskContext } from "@/context/TaskContext";
import {
  AttachmentSection,
  CommentSection,
  SharedWithSection,
  TaskDescription,
  TaskHeader,
} from "@/features";

function TaskDetailPage() {
  const {
    getTaskById,
    selectedTask,
    attachments,
    usersInSharedTasks,
    comments,
    updateTask,
    isUpdating,
  } = useTaskContext();

  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedComment, setHighlightedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#comment-")) {
      const commentId = hash.replace("#comment-", "");
      setHighlightedComment(commentId);
    } else {
      setHighlightedComment(null);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchTask = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        await getTaskById(id);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch task");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTask();

    return () => {
      isMounted = false;
    };
  }, [id, getTaskById]);

  const handleBack = (e) => {
    e.stopPropagation();
    navigate("/dashboard");
  };

  const handleEdit = async (updatedTaskData) => {
    try {
      await updateTask(id, updatedTaskData, "detailed");
      setEditDialogOpen(false);
    } catch (error) {}
  };

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
    <div className="container flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <TaskHeader
          {...selectedTask}
          onEdit={handleEdit}
          editDialogOpen={editDialogOpen}
          setEditDialogOpen={setEditDialogOpen}
          isUpdating={isUpdating}
        />

        <TaskDescription description={selectedTask?.description} />

        <AttachmentSection attachments={attachments} />

        <SharedWithSection usersInSharedTasks={usersInSharedTasks} />

        <CommentSection
          comments={comments}
          highlightedComment={highlightedComment}
        />
      </div>
    </div>
  );
}

export default TaskDetailPage;
