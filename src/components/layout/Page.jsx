import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskStats } from "./TaskStats";
import { ActivityFeed } from "./ActivityFeed";
import { useTasks } from "../hooks/tasks/useTasks";
import { TaskBoard } from "./TaskBoard";
import { useAuthLogic } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { tasks } = useTasks();
  const { user } = useAuthLogic();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  // Si no hay tareas del hook, usa las de ejemplo
  const displayTasks = tasks?.length
    ? tasks
    : [
        {
          title: "Website Redesign",
          description: "Update the company website with new branding",
          dueDate: "2024-02-15",
          priority: "high",
          category: "Design",
          status: "in-progress",
          collaborators: [
            "/placeholder.svg?height=32&width=32",
            "/placeholder.svg?height=32&width=32",
          ],
        },
        {
          title: "Content Strategy",
          description: "Develop Q1 content calendar and guidelines",
          dueDate: "2024-02-20",
          priority: "medium",
          category: "Marketing",
          status: "todo",
          collaborators: ["/placeholder.svg?height=32&width=32"],
        },
        {
          title: "User Research",
          description: "Conduct user interviews for new feature",
          dueDate: "2024-02-10",
          priority: "high",
          category: "Research",
          status: "completed",
          collaborators: [
            "/placeholder.svg?height=32&width=32",
            "/placeholder.svg?height=32&width=32",
            "/placeholder.svg?height=32&width=32",
          ],
        },
      ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex flex-col lg:flex-row gap-4 p-4 md:p-6">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back,{" "}
                  {user?.user_metadata?.full_name?.split(" ")[0] || "Guest"}
                </h1>
                <p className="text-muted-foreground">
                  Here's your task overview for today
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

            <TaskBoard tasks={displayTasks} />
          </div>

          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
};

export { DashboardPage };
