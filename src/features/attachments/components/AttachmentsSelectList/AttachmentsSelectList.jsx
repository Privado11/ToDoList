import { Trash2 } from "lucide-react";

import { fileUtils } from "../../utils/FileUtils";

const AttachmentsList = ({ attachments, onDelete }) => {
  if (!attachments || attachments.length === 0) return null;

  const handleDelete = (id, fileName) => {
    if (
      window.confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)
    ) {
      onDelete(id);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {attachments.map(({ id, file_name, file_size, file_type }) => {
        return (
          <div
            key={id}
            className="flex items-center border rounded-lg p-3 mb-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mr-3">
              {fileUtils.renderFileIcon(file_type, "h-6 w-6 text-gray-600")}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium truncate">{file_name}</p>
                <span className="text-xs text-gray-500">
                  {fileUtils.formatFileSize(file_size)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 ml-3">
              <button
                onClick={() => handleDelete(id, file_name)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default AttachmentsList;
