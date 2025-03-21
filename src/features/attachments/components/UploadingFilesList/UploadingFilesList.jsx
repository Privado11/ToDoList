
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BsX } from "react-icons/bs";
import { fileUtils } from "../../utils/FileUtils";



const UploadingFilesList = ({ uploading, onCancelUpload }) => {
  return (
    <div className="mb-6 space-y-3">
      {uploading.map((item) => (
        <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {fileUtils.renderFileIcon(
                item.file.type,
                "h-5 w-5 text-gray-600"
              )}
              <span className="font-medium truncate max-w-[200px]">
                {item.file.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelUpload(item.id)}
            >
              <BsX className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={item.progress} className="flex-1" />
            <span className="text-sm text-gray-500">{item.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadingFilesList;
