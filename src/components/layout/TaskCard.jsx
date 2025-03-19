import {
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Share2,
  Trash2,
  CheckCircle,
  Clock,
  RotateCw,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState } from "react";

const STATUS_CONFIG = {
  Completed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  "in-progress": {
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

const STATUS_STYLES = {
  Completed: "bg-green-500 text-white",
  "in-progress": "bg-blue-500 text-white",
  Pending: "bg-amber-500 text-white",
};

const TaskCard = ({
  id,
  title,
  description,
  create_at,
  priorities,
  categories,
  statuses,
  shared_tasks,
  deleteTask,
  onShare,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredTasks =
    shared_tasks?.filter((task) => task.status === "accepted") || [];

  const handleOpenDetail = () => {
    if (!isMenuOpen) {
      navigate(`/task-detail/${id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-task/${id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) onShare(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(id);
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
    <Card
      className="h-full flex flex-col cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"
      onClick={handleOpenDetail}
    >
      <div
        className={`h-1 w-full ${
          STATUS_STYLES[statusName]?.split(" ")[0] || "bg-amber-500"
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleShare}
                    className="gap-2 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500 focus:text-red-500 gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <CardTitle className="line-clamp-2 min-h-12 overflow-hidden text-lg font-semibold">
          {title || "Untitled Task"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow pb-3">
        <div className="flex-grow mb-3 min-h-20">
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
            {description || "No description provided"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{formatDate(create_at)}</span>
          </div>
          {categories ? (
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {filteredTasks.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden">
              <TooltipProvider>
                {filteredTasks.slice(0, 3).map((collaborator, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900">
                        <AvatarImage
                          src={
                            collaborator?.profile?.full_name?.[0] ||
                            collaborator
                          }
                          alt={
                            collaborator?.profile?.full_name ||
                            `Collaborator ${i + 1}`
                          }
                        />
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {collaborator?.profile?.full_name?.[0] || `C${i + 1}`}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {collaborator?.profile?.full_name ||
                          `Collaborator ${i + 1}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {filteredTasks.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700">
                    <AvatarFallback className="text-xs text-gray-600 dark:text-gray-300">
                      +{filteredTasks.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </TooltipProvider>
            </div>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400"></span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {filteredTasks.length}{" "}
          {filteredTasks.length === 1 ? "collaborator" : "collaborators"}
        </span>
      </CardFooter>
    </Card>
  );
};

export { TaskCard };
