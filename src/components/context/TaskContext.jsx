import React, { createContext, useContext } from "react";
import { useCategories } from "../hooks/useCategories";
import { usePriorities } from "../hooks/usePriorities";
import { useStatuses } from "../hooks/useStatutes";
import { useTasks } from "../hooks/tasks/useTasks";
import { useComments } from "../hooks/tasks/useComments";
import { useSharedTasks } from "../hooks/tasks/useSharedTasks";
import { useAttachments } from "../hooks/tasks/useAttachments";

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

export function TaskProvider({ children }) {
  const tasksHook = useTasks();
  const categoriesHook = useCategories();
  const prioritiesHook = usePriorities();
  const statusesHook = useStatuses();
  const commentsHook = useComments(tasksHook?.selectedTask?.task.id);
  const sharedTasksHook = useSharedTasks(
    tasksHook?.selectedTask?.task.id,
    tasksHook.getTaskById
  );
  const attachmentsHook = useAttachments(tasksHook?.selectedTask?.task.id);

  const value = {
    ...tasksHook,
    ...categoriesHook,
    ...prioritiesHook,
    ...statusesHook,
    ...commentsHook,
    ...sharedTasksHook,
    ...attachmentsHook,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
