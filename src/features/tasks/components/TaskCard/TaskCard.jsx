import {
  Calendar,
  MoreVertical,
  Edit,
  Share2,
  Trash2,
  CheckCircle,
  SquareCheckBig,
  Clock,
  RotateCw,
  Flag,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DialogConfirmation } from "@/view/DialogConfirmation";
import { TaskShareDialog } from "@/features/sharing";
import { EditTask } from "@/features";
import { useTaskContext } from "@/context/TaskContext";
import SharedTaskUserList from "./SharedTaskUserList";
import CreatorInfo from "./CreatorInfo";

const STATUS_CONFIG = {
  Completed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  Progress: {
    icon: RotateCw,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
};

const PRIORITY_CONFIG = {
  High: {
    icon: Flag,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
  },
  Medium: {
    icon: Flag,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  Low: {
    icon: Flag,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
};

const PRIORITY_STYLES = {
  High: "bg-red-500 text-white",
  Medium: "bg-amber-500 text-white",
  Low: "bg-green-500 text-white",
};

const TaskCard = ({
  id,
  title,
  description,
  create_at,
  priorities,
  categories,
  statuses,
  due_date,
  is_shared,
  shared_by,
  shared_tasks,
}) => {
  const navigate = useNavigate();
  const {
    updateTask,
    isUpdating,
    deleteTask,
    leaveSharedTask,
    updateTaskStatus,
  } = useTaskContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const mySharedTask = shared_tasks?.find((st) => st?.is_me);

  const [taskData, setTaskData] = useState({
    id,
    title,
    description,
    category_id: categories?.id || null,
    status_id: statuses?.id || 1,
    priority_id: priorities?.id || 1,
    due_date,
  });

  useEffect(() => {
    setTaskData({
      id,
      title,
      description,
      category_id: categories?.id || null,
      status_id: statuses?.id || 1,
      priority_id: priorities?.id || 1,
      due_date,
    });
  }, [id, title, description, categories, statuses, priorities, due_date]);

  useEffect(() => {
    if (editDialogOpen) {
      setTaskData({
        id,
        title,
        description,
        category_id: categories?.id || null,
        status_id: statuses?.id || 1,
        priority_id: priorities?.id || 1,
        due_date,
      });
    }
  }, [editDialogOpen]);

  const filteredSharedUsers =
    shared_tasks?.filter((task) => task.status === "accepted") || [];

  const handleOpenDetail = () => {
    if (!isMenuOpen && !deleteDialogOpen && !shareOpen && !editDialogOpen) {
      navigate(`/task-detail/${id}`);
    }
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    updateTaskStatus(id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShareOpen(true);
  };

  const handleDeleteTask = (e) => {
    e.stopPropagation();
    if (is_shared) {
      leaveSharedTask(mySharedTask.id);
    } else {
      deleteTask(id);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      await updateTask(id, taskData);
      setEditDialogOpen(false);
    } catch (error) {}
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString.split("T")[0]).toLocaleDateString();
  };

  const status = statuses?.name || "Pending";
  const statusName = statuses?.name || "Pending";
  const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
  const priorityLevel = priorities?.level || "Low";
  const priority = priorities?.level || "Low";
  const PriorityIcon = PRIORITY_CONFIG[priority]?.icon || Flag;

  return (
    <>
      <Card
        className="h-full flex flex-col cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"
        onClick={handleOpenDetail}
      >
        <div
          className={`h-1 w-full ${
            PRIORITY_STYLES[priorityLevel]?.split(" ")[0] || "bg-amber-500"
          }`}
        />
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 ${
                        STATUS_CONFIG[status]?.bgColor || "bg-gray-50"
                      } ${
                        STATUS_CONFIG[status]?.borderColor || "border-gray-200"
                      } ${STATUS_CONFIG[status]?.color || "text-gray-600"}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-transparent">
                  <p
                    className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 ${
                      STATUS_CONFIG[status]?.bgColor || "bg-gray-50"
                    } ${
                      STATUS_CONFIG[status]?.borderColor || "border-gray-200"
                    } ${STATUS_CONFIG[status]?.color || "text-gray-600"}`}
                  >
                    Status: {statusName}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 ${
                        PRIORITY_CONFIG[priority]?.bgColor || "bg-gray-50"
                      } ${
                        PRIORITY_CONFIG[priority]?.borderColor ||
                        "border-gray-200"
                      } ${PRIORITY_CONFIG[priority]?.color || "text-gray-600"}`}
                    >
                      <PriorityIcon className="h-3.5 w-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-transparent">
                    <p
                      className={`px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 ${
                        PRIORITY_CONFIG[priority]?.bgColor || "bg-gray-50"
                      } ${
                        PRIORITY_CONFIG[priority]?.borderColor ||
                        "border-gray-200"
                      } ${PRIORITY_CONFIG[priority]?.color || "text-gray-600"}`}
                    >
                      Priority: {priorityLevel}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={handleComplete}
                      disabled={is_shared}
                      className="gap-2 cursor-pointer"
                    >
                      <SquareCheckBig className="h-4 w-4" />
                      <span>
                        {statuses?.name !== "Completed"
                          ? "Mark as complete"
                          : "Mark as incomplete"}
                      </span>
                      {is_shared && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Author only)
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleEdit}
                      disabled={is_shared}
                      className="gap-2 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                      {is_shared && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Author only)
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleShare}
                      disabled={is_shared}
                      className="gap-2 cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                      {is_shared && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Author only)
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-500 focus:text-red-500 gap-2 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{!is_shared ? "Delete" : "Leave Task"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <CardTitle className="line-clamp-2 min-h-12 overflow-hidden text-lg md:text-xl font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow pb-3">
          <div className="flex-grow mb-3 min-h-20">
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 line-clamp-5">
              {description || "No description provided"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">{formatDate(create_at)}</span>
            </div>
            {categories?.name ? (
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {categories.name}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Uncategorized
              </Badge>
            )}
            {is_shared && (
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                Shared with you
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
          <SharedTaskUserList users={filteredSharedUsers} />

          {is_shared && <CreatorInfo creator={shared_by} date={create_at} />}
        </CardFooter>
      </Card>
      <EditTask
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        taskData={taskData}
        setTaskData={setTaskData}
        isUpdating={isUpdating}
        handleSubmitEdit={handleSubmitEdit}
      />

      <TaskShareDialog taskId={id} open={shareOpen} setOpen={setShareOpen} />

      <DialogConfirmation
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        title={is_shared ? "Leave Shared Task" : "Confirm Task Deletion"}
        description={
          is_shared ? (
            <>
              You're about to leave this shared task. You'll no longer see it in
              your task list.
              <br />
              Do you want to continue?
            </>
          ) : (
            <>
              Are you sure you want to delete this task? This action is
              permanent and cannot be undone.
            </>
          )
        }
        cancelText="Cancel"
        confirmText={is_shared ? "Yes, leave task" : "Yes, delete task"}
      />
    </>
  );
};

export default TaskCard;
