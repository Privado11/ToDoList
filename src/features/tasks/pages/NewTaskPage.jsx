import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { DialogConfirmation } from "../../../view/DialogConfirmation";
import { useTaskContext } from "@/context/TaskContext";
import { AttachmentSelectList, FileUploadArea, TaskForm, UploadingFilesList } from "@/features";

function NewTaskPage() {
  const {
    createTask,
    updateTask,
    selectedTask,
    getTaskById,
    loading,
    clearSelectedTask,
    uploadAttachment,
    deleteAttachment,
    attachments,
  } = useTaskContext();

  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    console.log(attachments);
  }, [attachments]);

  const initialTaskState = {
    title: "",
    description: "",
    category_id: null,
    due_date: null,
    status_id: 1,
    priority_id: 1,
    completed: false,
  };

  const [task, setTask] = useState(initialTaskState);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [uploading, setUploading] = useState([]);

  useEffect(() => {
    console.log(task);
  }, [task]);

  useEffect(() => {
    const loadTask = async () => {
      if (id && isInitialLoad) {
        console.log("Loading task details...");
        try {
          await getTaskById(id);
          setIsInitialLoad(false);
        } catch (error) {
          console.error("Error loading task:", error);
          navigate("/");
        }
      } else if (!id) {
        setTask(initialTaskState);
        clearSelectedTask();
      }
    };

    loadTask();

    return () => {
      clearSelectedTask();
    };
  }, [id]);

  useEffect(() => {
    if (selectedTask && id) {
      setTask(selectedTask.task || selectedTask);
    }
  }, [selectedTask, id]);

  const handleCancelUpload = (uploadId) => {
    setUploading((prev) => prev.filter((item) => item.id !== uploadId));
  };

  const processFileUpload = async (file) => {
    const uploadId =
      Date.now() + "-" + Math.random().toString(36).substring(2, 15);

    setUploading((prev) => [
      ...prev,
      {
        id: uploadId,
        file,
        progress: 0,
        isComplete: false,
      },
    ]);

    try {
      const progressInterval = setInterval(() => {
        setUploading((prev) =>
          prev.map((item) =>
            item.id === uploadId && item.progress < 100
              ? { ...item, progress: Math.min(item.progress + 10, 100) }
              : item
          )
        );
      }, 300);

      await uploadAttachment(file);

      clearInterval(progressInterval);

      setUploading((prev) =>
        prev.map((item) =>
          item.id === uploadId
            ? { ...item, progress: 100, isComplete: true }
            : item
        )
      );

      setTimeout(() => {
        setUploading((prev) => prev.filter((item) => item.id !== uploadId));
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading((prev) => prev.filter((item) => item.id !== uploadId));
    }
  };

  const handleFileSelect = useCallback(
    async (files) => {
      for (const file of files) {
        await processFileUpload(file);
      }
    },
    [uploadAttachment]
  );

  const handleDeleteAttachment = async (attachmentIds) => {
    try {
      const success = await deleteAttachment(attachmentIds);
      if (success) {
        setSelectedAttachments([]);
      }
      return success;
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return false;
    }
  };

  const handleSubmitForm = async () => {
    if (task?.title.trim() === "") {
      alert("Task title is required!");
      return;
    }

    try {
      if (selectedAttachments.length > 0) {
        await handleDeleteAttachment(selectedAttachments);
      }

      if (id) {
        await updateTask(id, task);
        navigate(`/task-detail/${id}`);
      } else {
        await createTask(task);
        navigate("/");
      }
    } catch (error) {
      alert("Error saving task: " + error.message);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/task-detail/${id}`);
    } else {
      navigate("/");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (selectedAttachments.length > 0 && id) {
      setShowDeleteConfirmation(true);
    } else {
      handleSubmitForm();
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading task details...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Card className="max-w-2xl mx-auto" />
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          {id ? "Edit Task" : "New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <TaskForm task={task} setTask={setTask} />

          <div>
            <Label className="text-xl font-bold">Attachments</Label>
            <FileUploadArea onFilesSelected={handleFileSelect} />

            {uploading.length > 0 && (
              <UploadingFilesList
                uploading={uploading}
                onCancelUpload={handleCancelUpload}
              />
            )}

            <AttachmentSelectList
              attachments={attachments}
              onDelete={handleDeleteAttachment}
              selectedAttachments={selectedAttachments}
              setSelectedAttachments={setSelectedAttachments}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="text-xl font-bold py-4"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xl font-bold py-4">
              {id ? "Update Task" : "Save Task"}
            </Button>
          </div>
        </form>
      </CardContent>

      <DialogConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleSubmitForm}
        title="Confirm file deletion"
        description={`You have selected  ${selectedAttachments.length} file(s). When you update this task, these files will be permanently deleted. Do you want to continue?`}
        cancelText="Cancel"
        confirmText="Yes, delete and update"
      />
    </div>
  );
}

export default NewTaskPage;
