import { AttachmentService } from "@/service";
import { useState, useEffect, useCallback } from "react";

export const useAttachments = (taskId) => {
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempTaskId] = useState(
    () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AttachmentService.getAttachmentsByTaskId(taskId);
      setAttachments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const getAttachmentById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        if (selectedAttachment?.id !== id) {
          const attachment = await AttachmentService.getAttachmentById(id);
          setSelectedAttachment(attachment);
          return attachment;
        }
        return selectedAttachment;
      } catch (err) {
        setError(err.message);
        setSelectedAttachment(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedAttachment]
  );

  const uploadAttachment = useCallback(
    async (file, temp) => {
      const currentTaskId = temp ? tempTaskId : taskId;
      setLoading(true);
      setError(null);
      try {
        const newAttachment = await AttachmentService.uploadAttachment(
          file,
          currentTaskId,
          temp ? true : false
        );
        setAttachments((prev) => [newAttachment, ...prev]);
        return newAttachment;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskId]
  );

  const reassignAttachmentsToTask = useCallback(
    async (realTaskId) => {
      if (!realTaskId || taskId === realTaskId) return;

      try {
        const updatePromises = attachments.map(async (attachment) => {
          return AttachmentService.reassignAttachmentsToTask(
            realTaskId,
            attachment
          );
        });


        const updatedAttachments = await Promise.all(updatePromises);
        setAttachments(updatedAttachments);

        return true;
      } catch (err) {
        console.error("Error reassigning attachments:", err);
        setError(err.message);
        return false;
      }
    },
    [attachments, taskId]
  );

  const deleteAttachment = useCallback(
    async (ids) => {
      const idArray = Array.isArray(ids) ? ids : [ids];
      if (idArray.length === 0) return true;

      const attachmentsToDelete = idArray
        .map((id) => attachments.find((attachment) => attachment.id === id))
        .filter(Boolean);

      if (attachmentsToDelete.length === 0) return false;

      const previousAttachments = [...attachments];

      setAttachments((prev) =>
        prev.filter((attachment) => !idArray.includes(attachment.id))
      );

      setLoading(true);
      setError(null);

      try {
        await Promise.all(
          idArray.map((id) => AttachmentService.deleteAttachment(id))
        );
        setLoading(false);
        return true;
      } catch (err) {
        setAttachments(previousAttachments);

        toast({
          variant: "destructive",
          title: "Error deleting attachments",
          description: err.message || "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteAttachment(ids),
          },
        });

        setError(err.message);
        setLoading(false);
        return false;
      }
    },
    [attachments]
  );

  const resetAttachments = useCallback(() => {
    setAttachments([]);
    setSelectedAttachment(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    resetAttachments,
    selectedAttachment,
    loading,
    error,
    fetchAttachments,
    getAttachmentById,
    uploadAttachment,
    reassignAttachmentsToTask,
    deleteAttachment,
  };
};
