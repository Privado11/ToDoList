import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskShareDialog } from "@/features/sharing";
import { Calendar } from "lucide-react";

const TaskHeader = ({ task, onEdit }) => {
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
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
        <div className="flex gap-4">
          <Badge variant="outline" className="gap-1 text-sm">
            <Calendar className="w-4 h-4" />
            {task.due_date ? formatDateTime(task.due_date) : "No due date"}
          </Badge>
          <Badge className="bg-red-100 text-red-500 text-sm">
            {task.priorities?.level || "No priority"}
          </Badge>
          <Badge className="bg-blue-100 text-blue-500 text-sm">
            {task.statuses?.name || "No status"}
          </Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <TaskShareDialog taskId={task.id} isShared={task?.is_shared} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  className="text-lg"
                  onClick={onEdit}
                  disabled={task?.is_shared}
                >
                  Edit Task
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                You cannot edit this task because it is being shared with you. <br />
                Only the author can edit it.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TaskHeader;
