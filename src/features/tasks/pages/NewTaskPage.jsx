import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogConfirmation } from "../../../view/DialogConfirmation";

import {
  AttachmentSelectList,
  FileUploadArea,
  TaskForm,
  UploadingFilesList,
} from "@/features";
import { Loader2 } from "lucide-react";
import { useTaskContext } from "@/context";

function NewTaskPage() {
  const {
    createTask,
    isCreating,
    attachments,
    uploadAttachment,
    deleteAttachment,
    reassignAttachmentsToTask,
    resetAttachments,
  } = useTaskContext();

  const navigate = useNavigate();

  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [task, setTask] = useState({
    title: "",
    description: "",
    category_id: 4,
    due_date: null,
    status_id: 1,
    priority_id: 1,
  });

  const [uploading, setUploading] = useState([]);

  const isProcessing = isCreating || uploading.length > 0;

  useEffect(() => {
    if (isSubmitting && !isProcessing) {
      navigate("/dashboard");
    }
  }, [isProcessing, navigate, isSubmitting]);

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

      await uploadAttachment(file, "temp");

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
    try {
      setIsSubmitting(true);

      
      if (selectedAttachments.length > 0) {
        await handleDeleteAttachment(selectedAttachments);
      }

      
      const newTask = await createTask(task);

     
      if (attachments.length > 0 && newTask?.id) {
        await reassignAttachmentsToTask(newTask.id);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetAttachments();
    navigate("/dashboard");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (selectedAttachments.length > 0) {
      setShowDeleteConfirmation(true);
    } else {
      handleSubmitForm();
    }
  };

  return (
    <div>
      <Card className="max-w-2xl mx-auto border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{"New Task"}</CardTitle>
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
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-xl font-bold py-4"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {"Saving..."}
                  </>
                ) : (
                  "Save Task"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <DialogConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleSubmitForm}
          title="Confirm file deletion"
          description={`You have selected ${selectedAttachments.length} file(s). When you create this task, these files will be permanently deleted. Do you want to continue?`}
          cancelText="Cancel"
          confirmText="Yes, delete and create"
        />
      </Card>
    </div>
  );
}

export default NewTaskPage;
