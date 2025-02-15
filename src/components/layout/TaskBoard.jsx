import { TaskCard } from "./TaskCard";

const TaskBoard = ({ tasks }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task, index) => (
        <div key={index} className="h-full">
          <TaskCard {...task} />
        </div>
      ))}
    </div>
  );
};

export  {TaskBoard};
