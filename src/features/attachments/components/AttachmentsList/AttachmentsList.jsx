import { Button } from "@/components/ui/button";
import { BsDownload, BsX } from "react-icons/bs";
import { fileUtils } from "../../utils/FileUtils";


const AttachmentsList = ({ attachments, onDeleteAttachment }) => {
  return (
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
              {fileUtils.renderFileIcon(
                attachment.file_type,
                "h-6 w-6 text-gray-600"
              )}
              <div>
                <h3 className="font-medium text-lg">{attachment.file_name}</h3>
                <div className="text-sm text-gray-500 space-x-2">
                  <span>{fileUtils.formatFileSize(attachment.file_size)}</span>
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
                onClick={() => onDeleteAttachment(attachment)}
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
  );
};

export default AttachmentsList;
