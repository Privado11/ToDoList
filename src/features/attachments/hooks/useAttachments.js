import { AttachmentService } from "@/service";
import { useState, useEffect, useCallback } from "react";

export const useAttachments = (taskId) => {
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(taskId);
  }, [taskId]);

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
    async (file) => {
      setLoading(true);
      setError(null);
      try {
        const newAttachment = await AttachmentService.uploadAttachment(
          file,
          taskId
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

  const deleteAttachment = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await AttachmentService.deleteAttachment(id);
        setAttachments((prev) =>
          prev.filter((attachment) => attachment.id !== id)
        );
        if (selectedAttachment?.id === id) {
          setSelectedAttachment(null);
        }
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedAttachment?.id]
  );

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    selectedAttachment,
    loading,
    error,
    fetchAttachments,
    getAttachmentById,
    uploadAttachment,
    deleteAttachment,
  };
};
