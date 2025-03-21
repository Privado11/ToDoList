// File: components/attachments/FileUploadArea.jsx
import { useState, useCallback } from "react";
import { BsUpload } from "react-icons/bs";

const FileUploadArea = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleFileSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
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
  );
};

export default FileUploadArea;
