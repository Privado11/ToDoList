import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BsFiletypeXlsx,
  BsFiletypePdf,
  BsFiletypePptx,
  BsFiletypePng,
  BsFiletypeJpg,
  BsFiletypeSvg,
  BsFileImage,
  BsFileEarmarkText,
  BsFileEarmarkCode,
  BsFileEarmarkZip,
  BsFileEarmark,
  BsDownload,
  BsUpload,
  BsX,
  BsFiletypeDocx,
  BsFiletypeJson,
} from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/context/TaskContext";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getFileIcon = (fileType) => {
  if (fileType.includes("image/jpeg") || fileType.includes("image/jpg")) {
    return BsFiletypeJpg;
  }
  if (fileType.includes("image/png")) {
    return BsFiletypePng;
  }
  if (fileType.includes("image/svg")) {
    return BsFiletypeSvg;
  }
  if (fileType.startsWith("image/")) {
    return BsFileImage;
  }

  
  if (fileType.includes("application/pdf") || fileType.includes("pdf")) {
    return BsFiletypePdf;
  }

  // Word
  if (
    fileType.includes("application/msword") ||
    fileType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) 
  ) {
    return BsFiletypeDocx;
  }

  // Excel
  if (
    fileType.includes("application/vnd.ms-excel") ||
    fileType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) ||
    fileType.includes("xlsx") ||
    fileType.includes("xls")
  ) {
    return BsFiletypeXlsx;
  }

  // PowerPoint
  if (
    fileType.includes("application/vnd.ms-powerpoint") ||
    fileType.includes(
      "application/vnd.openxmlformats-officedocument.presentationml"
    ) ||
    fileType.includes("pptx") ||
    fileType.includes("ppt")
  ) {
    return BsFiletypePptx;
  }

  // Código y texto
  if (fileType.includes("text/plain") || fileType.includes("txt")) {
    return BsFileEarmarkText;
  }
  if (
    fileType.includes("text/html") ||
    fileType.includes("text/css") ||
    fileType.includes("text/javascript") ||
    fileType.includes("application/javascript") ||
    fileType.includes("html") ||
    fileType.includes("css") ||
    fileType.includes("js")
  ) {
    return BsFileEarmarkCode;
  }
  if (fileType.includes("application/json") || fileType.includes("json")) {
    return BsFiletypeJson;
  }

 


  // Archivos comprimidos
  if (
    fileType.includes("application/zip") ||
    fileType.includes("application/x-rar-compressed") ||
    fileType.includes("application/x-7z-compressed") ||
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("7z")
  ) {
    return BsFileEarmarkZip;
  }

  // Documento genérico
  if (fileType.includes("document")) {
    return BsFileEarmarkText;
  }

  // Default
  return BsFileEarmark;
};

const AttachmentSection = ({ attachments = [], taskId }) => {
  const { uploadAttachment, deleteAttachment } = useTaskContext();
  const [uploading, setUploading] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
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

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);

      for (const file of files) {
        await processFileUpload(file);
      }
    },
    [uploadAttachment]
  );

  const handleFileSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);

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

  const cancelDeleteAttachment = () => {
    setDeleteDialogOpen(false);
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

  // Función para renderizar el ícono del archivo
  const renderFileIcon = (fileType, className = "h-5 w-5") => {
    const IconComponent = getFileIcon(fileType);
    return <IconComponent className={className} />;
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
          {/* Área de subida de archivos */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center mb-6 transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <BsUpload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-2 flex justify-center items-center gap-1">
              <p className="text-gray-600">
                {isDragging ? "Drop files here" : "Drag files here or"}
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-500 hover:text-blue-600 font-medium">
                  select files
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.css,.js,.mp3,.mp4,.zip,.rar"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* Archivos en proceso de subida */}
          {uploading.length > 0 && (
            <div className="mb-6 space-y-3">
              {uploading.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {renderFileIcon(item.file.type, "h-5 w-5 text-gray-600")}
                      <span className="font-medium truncate max-w-[200px]">
                        {item.file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelUpload(item.id)}
                    >
                      <BsX className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.progress} className="flex-1" />
                    <span className="text-sm text-gray-500">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de archivos adjuntos */}
          <div className="space-y-4">
            {attachments.length === 0 ? (
              <p className="text-gray-500">No attachments for this task</p>
            ) : (
              attachments.map((attachment, index) => (
                <div
                  key={`${attachment.file_name}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {renderFileIcon(
                      attachment.file_type,
                      "h-6 w-6 text-gray-600"
                    )}
                    <div>
                      <h3 className="font-medium text-lg">
                        {attachment.file_name}
                      </h3>
                      <div className="text-sm text-gray-500 space-x-2">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>
                          {new Date(attachment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(attachment.file_url, "_blank")}
                      className="hover:bg-gray-200"
                      title="Download"
                    >
                      <BsDownload className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDeleteAttachment(attachment)}
                      className="hover:bg-red-100 text-red-500"
                      title="Delete"
                    >
                      <BsX className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar archivos */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={cancelDeleteAttachment}
      >
        <AlertDialogContent>
          <AlertDialogPortal>
            <AlertDialogOverlay className="bg-black/50 fixed inset-0" />
            <AlertDialogContent className="fixed top-[50%] left-[50%] max-w-[450px] w-[90vw] -translate-x-[50%] -translate-y-[50%] rounded-lg bg-white p-6 shadow-lg">
              <AlertDialogTitle className="text-2xl font-bold">
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 mt-2 text-lg">
                Are you sure you want to delete the file
                <span className="font-medium">
                  {" "}
                  <strong>{attachmentToDelete?.file_name}? </strong>
                </span>
                <br />
                <span className="text-sm">This action cannot be undone.</span>
              </AlertDialogDescription>
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  className="text-lg"
                  variant="outline"
                  onClick={cancelDeleteAttachment}
                >
                  Cancel
                </Button>
                <Button
                  className="text-lg"
                  variant="destructive"
                  onClick={handleDeleteAttachment}
                >
                  Delete
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AttachmentSection;
