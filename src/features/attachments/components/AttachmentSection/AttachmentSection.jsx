import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BsFileEarmark } from "react-icons/bs";
import { useTaskContext } from "@/context/TaskContext";
import FileUploadArea from "../FileUploadArea";
import UploadingFilesList from "../UploadingFilesList";
import AttachmentsList from "../AttachmentsList";
import { DialogConfirmation } from "@/view/DialogConfirmation";


const AttachmentSection = ({ attachments = [], taskId }) => {
  const { uploadAttachment, deleteAttachment } = useTaskContext();
  const [uploading, setUploading] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

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

  const handleCancelUpload = (uploadId) => {
    setUploading((prev) => prev.filter((item) => item.id !== uploadId));
  };

  const confirmDeleteAttachment = (attachment) => {
    setAttachmentToDelete(attachment);
    setDeleteDialogOpen(true);
  };


  const handleDeleteAttachment = async () => {
    if (!attachmentToDelete) return;

    try {
      await deleteAttachment(attachmentToDelete.id);
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BsFileEarmark className="w-5 h-5" />
            Attachments ({attachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadArea onFilesSelected={handleFileSelect} />

          {uploading.length > 0 && (
            <UploadingFilesList
              uploading={uploading}
              onCancelUpload={handleCancelUpload}
            />
          )}

          <AttachmentsList
            attachments={attachments}
            onDeleteAttachment={confirmDeleteAttachment}
          />
        </CardContent>
      </Card>

      <DialogConfirmation
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAttachment}
        title="Confirm file deletion"
        description={`Are you sure you want to delete the file  ${attachmentToDelete?.file_name}?. Do you want to continue?`}
        cancelText="Cancel"
        confirmText="Yes, delete"
      />
    </>
  );
};

export default AttachmentSection;
