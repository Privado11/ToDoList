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
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import EditTask from "../EditTask";

const TaskHeader = ({
  id,
  title,
  description,
  priorities,
  categories,
  statuses,
  due_date,
  is_shared,
  onEdit,
  editDialogOpen,
  setEditDialogOpen,
  isUpdating,
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { profile: user } = useAuth();
   const initialTaskState = {
     id,
     title,
     description,
     category_id: categories?.id || null,
     status_id: statuses?.id || 1,
     priority_id: priorities?.id || 1,
     due_date,
   };
  const [taskData, setTaskData] = useState(initialTaskState);

  const handleShare = () => {
    if (!is_shared) {
      setShareOpen(true);
    }
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    onEdit(taskData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold pr-4 flex-1">
            {title}
          </h1>

          <div className="flex sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleShare}
                  disabled={is_shared}
                  className="cursor-pointer"
                >
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share</span>
                  {is_shared && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Author only)
                    </span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleEditClick}
                  disabled={is_shared}
                  className={`cursor-pointer ${
                    is_shared ? "opacity-50" : ""
                  }`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Task</span>
                  {is_shared && (
                    <span className="text-sm text-gray-500 ml-2">
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
                    disabled={is_shared || user?.is_anonymous}
                  >
                    <Share className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </TooltipTrigger>
              {(is_shared || user?.is_anonymous) && (
                <TooltipContent>
                  {is_shared ? (
                    <p>
                      You cannot share this task because it is being shared with
                      you. <br /> Only the author can share it.
                    </p>
                  ) : user?.is_anonymous ? (
                    <p className="text-sm">
                      Sharing is only available for registered users. <br />
                      Please create a full account to use this feature.
                    </p>
                  ) : null}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="text-lg w-32"
                    onClick={handleEditClick}
                    disabled={is_shared}
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Task
                  </Button>
                </div>
              </TooltipTrigger>
              {is_shared && (
                <TooltipContent>
                  <p className="text-sm">
                    You cannot edit this task because it is being shared with
                    you. <br />
                    Only the author can edit it.
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Badge variant="outline" className="gap-1 text-sm sm:text-sm">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          {due_date ? formatDate(due_date) : "No due date"}
        </Badge>
        <Badge className="bg-red-100 text-red-500 text-sm sm:text-sm">
          {priorities?.level || "No priority"}
        </Badge>
        <Badge className="bg-blue-100 text-blue-500 text-sm sm:text-sm">
          {statuses?.name || "No status"}
        </Badge>
      </div>

      <EditTask
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        taskData={taskData}
        setTaskData={setTaskData}
        isUpdating={isUpdating}
        handleSubmitEdit={handleSubmitEdit}
      />

      <TaskShareDialog
        taskId={id}
        isShared={is_shared}
        open={shareOpen}
        setOpen={setShareOpen}
      />
    </div>
  );
};

export default TaskHeader;
