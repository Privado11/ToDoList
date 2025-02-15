import React, { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../../../styles/Progress.css";
import { useTaskContext } from "@/components/context/TaskContext";

function Progress({ children }) {
  const { task, completedTasks, inProgressTasks } = useTaskContext();

 useEffect(() => {
    console.log(task);
  }, [task]);

  const totalTasks = task?.length;

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (totalTasks) {
      const per = ((completedTasks * 100) / totalTasks).toFixed(0);
      setPercentage(per);
    } else {
      setPercentage(100);
    }
  }, [percentage, totalTasks, completedTasks, inProgressTasks]);

  return (
    <aside>
      <h1>Progress</h1>
      <div className="containerChildren">
        {children[0]}
        <div className="progressBar">
          <CircularProgressbar value={percentage} text={`${percentage}%`} />
        </div>
      </div>
      <div className="addTask">{children[1]}</div>
    </aside>
  );
}

export { Progress };
