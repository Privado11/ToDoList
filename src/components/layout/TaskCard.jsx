import { Calendar, Users } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  Completed: "border-green-500 text-green-500",
  "in-progress": "border-blue-500 text-blue-500",
  Pending: "border-yellow-500 text-yellow-500",
};

const PRIORITY_STYLES = {
  High: "border-red-500 text-red-500",
  Medium: "border-yellow-500 text-yellow-500",
  Low: "border-green-500 text-green-500",
};

const TaskCard = ({
  id,
  title,
  description,
  due_date,
  priorities,
  categories,
  statuses,
  collaborators = [],
}) => {
  const navigate = useNavigate();

  const handleOpenModal = () => {
    navigate(`/task-detail/${id}`);
  };

  return (
    <Card
      className="h-full flex flex-col cursor-pointer"
      onClick={handleOpenModal}
    >
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={STATUS_STYLES[statuses?.name] || STATUS_STYLES.pending}
          >
            {statuses?.name}
          </Badge>
          <Badge
            variant="outline"
            className={
              PRIORITY_STYLES[priorities?.level] || PRIORITY_STYLES.low
            }
          >
            {priorities?.level}
          </Badge>
        </div>
        <CardTitle className="line-clamp-3 overflow-hidden h-12 ">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow pb-2">
        <div className="flex-grow h-[4.5rem] overflow-hidden">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">
              {due_date
                ? new Date(due_date).toLocaleDateString()
                : "No due date"}
            </span>
          </div>
          {categories && <Badge variant="secondary">{categories?.name}</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            <TooltipProvider>
              {collaborators?.map((collaborator, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage
                        src={collaborator.avatar || collaborator}
                        alt={collaborator.name || `Collaborator ${i + 1}`}
                      />
                      <AvatarFallback>
                        {collaborator.initials || `C${i + 1}`}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{collaborator.name || `Collaborator ${i + 1}`}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {collaborators?.length}{" "}
          {collaborators?.length === 1 ? "collaborator" : "collaborators"}
        </span>
      </CardFooter>
    </Card>
  );
};

export { TaskCard };
