import React from "react";
import { File, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const FileUploadProgress = ({
  file,
  progress,
  onCancel,
  isComplete = false,
}) => {
 
  const getFileTypeIcon = () => {
    const extension = file.name.split(".").pop().toLowerCase();

    
    let iconColor = "#718096"; 

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      iconColor = "#4299e1"; 
    } else if (
      ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)
    ) {
      iconColor = "#ed8936"; 
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      iconColor = "#9f7aea"; 
    }

    return <File size={24} color={iconColor} />;
  };

 
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center border rounded-lg p-3 mb-2 bg-white shadow-sm">
      <div className="mr-3">
        {isComplete ? (
          <CheckCircle size={24} className="text-green-500" />
        ) : (
          getFileTypeIcon()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </span>
        </div>

        <div className="flex items-center">
          <Progress
            value={progress}
            className="flex-1 h-2"
            indicatorClassName={isComplete ? "bg-green-500" : "bg-blue-500"}
          />
          <span className="ml-2 text-xs font-medium">
            {isComplete ? "Completado" : `${progress}%`}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {file.type || `Archivo .${file.name.split(".").pop()}`}
          </span>
          {!isComplete && (
            <button
              onClick={onCancel}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadProgress;
