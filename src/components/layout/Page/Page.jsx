import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


import Header from "../Header";
import Sidebar from "../Sidebar";
import TaskStats from "../TaskStats";


import { TaskBoard } from "../TaskBoard";
import { ActivityFeed } from "../Activity";
import { useTaskContext } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";


const DashboardPage = () => {
  const { tasks, deleteTask } = useTaskContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Tasks:", tasks);
  }, [tasks]);

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

            {tasks?.length ? (
              <TaskBoard tasks={tasks} deleteTask={deleteTask} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-medium mb-2">
                  No tienes tareas todavía
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crea tu primera tarea haciendo clic en el botón "New Task"
                </p>
                <Button onClick={() => navigate("/add-task")} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Crear Tarea
                </Button>
              </div>
            )}
          </div>
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
