import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
;
import "../styles/App.css";
import { useTaskContext } from "@/components/context/TaskContext";
import { TaskList } from "@/components/tasks/list/TaskList";
import { TaskLoading } from "@/components/tasks/loading/TaskLoading";
import { Progress } from "@/components/tasks/progress/Progress";
import { TaskCounter } from "@/components/tasks/counter/TaskCounter";
import { CreateTaskButton } from "@/components/tasks/create/CreateTaskButton";
import { Header } from "@/components/tasks/header/Header";

function HomePage({ user }) {
  const { tasks, completeTask, deleteTask, loading } = useTaskContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  return (
    <div className="containerPrin">
      <div className="containerApp">
        <Header user={user} />
        <main>
          <TaskList
            tasks={tasks}
            onComplete={completeTask}
            onEdit={(id) => navigate(`/edit-task/${id}`)}
            onDelete={deleteTask}
          >
            {loading && <TaskLoading />}
          </TaskList>
          <Progress>
            <TaskCounter />
            <CreateTaskButton />
          </Progress>
        </main>
      </div>
    </div>
  );
}

export { HomePage };
