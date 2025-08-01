import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  CheckCircle2,
  Users,
  Rocket,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";

const OverviewProfile = ({
  tasks,
  completedTasks,
  inProgressTasks,
  overdueTasks,
  
}) => {
  const totalTasks = tasks?.length || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;



  const sharedWithMe = tasks?.filter((task) => task.is_shared).length || 0;

  const sharedWithOthers =
    tasks?.filter((task) => !task.is_shared && task.shared_tasks?.length > 0)
      .length || 0;

  const totalSharedTasks = sharedWithMe + sharedWithOthers;

  const collaborativeProportion =
    totalTasks > 0
      ? Math.round((totalSharedTasks / totalTasks) * 100)
      : 0;

  const onTimeTasks =
    tasks?.filter(
      (task) =>
        task.completed_at &&
        new Date(task.completed_at) <= new Date(task.due_date)
    ).length || 0;

  const tasksWithDueDate = completedTasks + overdueTasks;
  const onTimeCompletionRate =
    tasksWithDueDate > 0
      ? Math.round((onTimeTasks / tasksWithDueDate) * 100) 
      : 0;

  const highPriorityTasks =
    tasks?.filter(
      (task) => !task.completed_at && task.priorities?.level === "High"
    ).length || 0;

  const tasksThisWeek =
    tasks?.filter((task) => {
      const createdDate = new Date(task.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length || 0;

  const getColor = (value, thresholds) => {
    if (thresholds.reverse) {
      if (value <= thresholds.good) return "text-green-600";
      if (value <= thresholds.medium) return "text-orange-500";
      return "text-red-600";
    } else {
      if (value >= thresholds.good) return "text-green-600";
      if (value >= thresholds.medium) return "text-orange-500";
      return "text-red-600";
    }
  };

   if (completedTasks && completedTasks === -1) {
     return (
       <div className="text-center text-muted-foreground py-8">
         No overview to show
       </div>
     );
   }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="font-bold text-green-600">
                  {completedTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In progress</span>
                <span className="font-medium text-blue-600">
                  {inProgressTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-red-600">{overdueTasks}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Completion rate</span>
                  <span className="text-sm font-medium">{completionRate} %</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Shared with others</span>
                <span className="font-bold text-blue-600">
                  {sharedWithOthers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Shared with me</span>
                <span className="font-medium">{sharedWithMe}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total collaborations</span>
                <span className="font-medium">{totalSharedTasks}</span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Collaborative proportion</span>
                  <span className="text-sm font-medium">
                    {collaborativeProportion} %
                  </span>
                </div>
                <Progress value={collaborativeProportion} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Rocket className="h-4 w-4 mr-2 text-red-500" />
            Task Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getColor(
                  onTimeCompletionRate,
                  { good: 80, medium: 50 }
                )}`}
              >
                {onTimeCompletionRate} %
              </div>
              <div className="text-sm text-muted-foreground">
                Tasks completed on time
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getColor(highPriorityTasks, {
                  good: 0,
                  medium: 1,
                  reverse: true,
                })}`}
              >
                {highPriorityTasks}
              </div>
              <div className="text-sm text-muted-foreground">
                Open high priority tasks
              </div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold  ${getColor(tasksThisWeek, {
                  good: 5,
                  medium: 3,
                })}`}
              >
                {tasksThisWeek}
              </div>
              <div className="text-sm text-muted-foreground">
                Completed this week
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewProfile;
