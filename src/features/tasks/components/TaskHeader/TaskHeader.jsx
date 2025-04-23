import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskShareDialog } from "@/features/sharing";
import { Calendar, MoreVertical, Edit, Share } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const TaskHeader = ({ task, onEdit }) => {
  const [shareOpen, setShareOpen] = useState(false);

  const handleShare = () => {
    if (!task?.is_shared) {
      setShareOpen(true);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Invalid date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold pr-2 flex-1">
            {task.title}
          </h1>

          <div className="flex sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Share option */}
                <DropdownMenuItem
                  onClick={handleShare}
                  disabled={task?.is_shared}
                  className="cursor-pointer"
                >
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share</span>
                  {task?.is_shared && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Author only)
                    </span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onEdit}
                  disabled={task?.is_shared}
                  className={`cursor-pointer ${
                    task?.is_shared ? "opacity-50" : ""
                  }`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Task</span>
                  {task?.is_shared && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Author only)
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 mt-2 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="text-lg w-32"
                    onClick={handleShare}
                    disabled={task?.is_shared}
                  >
                    <Share className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {task?.is_shared && (
                  <p>
                    You cannot share this task because it is being shared with
                    you. <br /> Only the author can share it.
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="text-lg w-32"
                    onClick={onEdit}
                    disabled={task?.is_shared}
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Task
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {task?.is_shared && (
                  <p className="text-sm">
                    You cannot edit this task because it is being shared with
                    you. <br />
                    Only the author can edit it.
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          {task.due_date ? formatDateTime(task.due_date) : "No due date"}
        </Badge>
        <Badge className="bg-red-100 text-red-500 text-xs sm:text-sm">
          {task.priorities?.level || "No priority"}
        </Badge>
        <Badge className="bg-blue-100 text-blue-500 text-xs sm:text-sm">
          {task.statuses?.name || "No status"}
        </Badge>
      </div>

      <TaskShareDialog
        taskId={task.id}
        isShared={task?.is_shared}
        open={shareOpen}
        setOpen={setShareOpen}
      />
    </div>
  );
};

export default TaskHeader;
