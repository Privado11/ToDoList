
import { useAttachments, useCategories, useComments, usePriorities, useSharedTasks, useStatuses, useTasks } from "@/features";
import React, { createContext, useContext } from "react";

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
  const selectedTaskId = tasksHook?.selectedTask?.id ?? null;
  const commentsHook = useComments(selectedTaskId);
  const sharedTasksHook = useSharedTasks(selectedTaskId);
  const attachmentsHook = useAttachments(selectedTaskId);

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
