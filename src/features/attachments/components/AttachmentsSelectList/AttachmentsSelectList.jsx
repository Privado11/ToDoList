import { File, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fileUtils } from "../../utils/FileUtils";

const AttachmentsSelectList = ({
  attachments,
  selectedAttachments,
  setSelectedAttachments,
  onDelete, 
}) => {
  if (!attachments || attachments.length === 0) return null;

  const toggleSelection = (id) => {
    setSelectedAttachments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedAttachments.length === 0) return;

    const success = await onDelete(selectedAttachments);
    if (success) {
      setSelectedAttachments([]); 
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return "Tamaño desconocido";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.includes(".")
      ? fileName.split(".").pop().toLowerCase()
      : "";

    const colorMap = {
      images: "#4299e1", // Azul
      documents: "#ed8936", // Naranja
      compressed: "#9f7aea", // Morado
    };

    let iconColor = "#718096"; // Color por defecto

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      iconColor = colorMap.images;
    } else if (
      ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)
    ) {
      iconColor = colorMap.documents;
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      iconColor = colorMap.compressed;
    }

    return <File size={24} color={iconColor} />;
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <Alert variant="outline" className="bg-blue-50 border-blue-200 flex-1">
          <AlertDescription className="flex items-center text-blue-700">
            Select the file(s) you want to delete.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-2">
        {attachments.map(({ id, file_name, file_size, file_type }) => {
          const extension = file_name.includes(".")
            ? file_name.split(".").pop()
            : "unknown";

          return (
            <div
              key={id}
              className="flex items-center border rounded-lg p-3 mb-2 bg-white shadow-sm"
            >
              <Checkbox
                checked={selectedAttachments.includes(id)}
                onCheckedChange={() => toggleSelection(id)}
                className="mr-3"
              />
              <div className="mr-3">
                {fileUtils.renderFileIcon(
                 file_type,
                  "h-6 w-6 text-gray-600"
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium truncate">{file_name}</p>
                  <span className="text-xs text-gray-500">
                    {fileUtils.formatFileSize(file_size)}
                  </span>
                </div>

               
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentsSelectList;
