import { useNavigate, useOutletContext } from "react-router-dom";
import { TaskCard, TaskCardSkeleton } from "../TaskCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const TaskBoard = ({ tasks, isLoadingList,  }) => {
  const { activeFilter } = useOutletContext() || { activeFilter: "all" };
  const navigate = useNavigate();

  return (
    <>
      {isLoadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : tasks?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <div key={index} className="h-full">
              <TaskCard {...task}  />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">
            {activeFilter === "all"
              ? "You don't have any tasks yet"
              : `No ${activeFilter} priority tasks found`}
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first task by clicking the "New Task" button
          </p>
          <Button onClick={() => navigate("/add-task")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      )}
    </>
  );
};

export default TaskBoard;
