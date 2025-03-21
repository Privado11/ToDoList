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
   async (ids) => {
     // Convertir a array si se recibe un solo ID
     const idArray = Array.isArray(ids) ? ids : [ids];
     if (idArray.length === 0) return true;

     // Guardar los archivos que se van a eliminar
     const attachmentsToDelete = idArray
       .map((id) => attachments.find((attachment) => attachment.id === id))
       .filter(Boolean);

     if (attachmentsToDelete.length === 0) return false;

     // Crear una copia del estado actual para restaurar en caso de error
     const previousAttachments = [...attachments];

     // Actualizar el estado UI (eliminar todos los archivos seleccionados)
     setAttachments((prev) =>
       prev.filter((attachment) => !idArray.includes(attachment.id))
     );

     setLoading(true);
     setError(null);

     try {
       // Eliminar todos los archivos en paralelo
       await Promise.all(
         idArray.map((id) => AttachmentService.deleteAttachment(id))
       );
       setLoading(false);
       return true;
     } catch (err) {
       // Restaurar estado anterior
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
