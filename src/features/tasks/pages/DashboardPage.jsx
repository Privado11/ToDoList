
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTaskContext } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { ActivityFeed, TaskStats } from "@/components";
import { TaskBoard } from "../components";
import { MultiChatManager } from "@/features/chats";

const DashboardPage = () => {
  const { tasks, deleteTask, loadingTasks, cancelShareTask: leaveTask } = useTaskContext();
  const { profile: user } = useAuth();
  const navigate = useNavigate();
  const { activeFilter } = useOutletContext() || { activeFilter: "all" };

  const filterTasks = (priority) => {
    if (priority === "all") {
      return tasks;
    }
    if (priority === "shared_me") {
      return tasks.filter((task) => task?.is_shared);
    }
    return tasks.filter((task) => task?.priorities?.level === priority);
  };

  const filteredTasks = filterTasks(activeFilter);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text:3xl font-bold tracking-tight">
                Welcome back, {user?.full_name?.split(" ")[0]}
              </h1>
              <p className="text-muted-foreground">
                {activeFilter === "all"
                  ? "Here's your task overview for today"
                  : `Showing ${activeFilter} priority tasks`}
              </p>
            </div>
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={() => {
                navigate("/add-task");
              }}
            >
              <PlusCircle className="h-4 w-4" />
              New Task
            </Button>
          </div>

          <div className="hidden lg:block">
            <TaskStats />
          </div>

          <TaskBoard
            tasks={filteredTasks}
            deleteTask={deleteTask}
            loadingTasks={loadingTasks}
            leaveTask={leaveTask}
          />
        </div>

        <div className="hidden xl:block w-[300px] flex-shrink-0 lg:sticky lg:top-0">
          <ActivityFeed />
        </div>
      </div>

      <div className="hidden md:block">
        <MultiChatManager user={user} />
      </div>
    </div>
  );
};

export default DashboardPage;
