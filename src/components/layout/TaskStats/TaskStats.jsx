import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"
import { useTaskContext } from "@/context";
import { ChartPie, CircleDashed, CircleCheckBig, ClockAlert } from "lucide-react";


function TaskStats() {
  const { completedTasks, inProgressTasks, overdueTasks, isLoadingList } =
    useTaskContext();

    const NumberSkeleton = () => (
      <Skeleton className="h-8 w-8 bg-gray-200 rounded"></Skeleton>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>

          <ChartPie className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingList ? (
              <NumberSkeleton />
            ) : (
              completedTasks + inProgressTasks
            )}
          </div>
          <p className="text-xs text-muted-foreground">+2 from yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>

          <CircleDashed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingList ? <NumberSkeleton /> : inProgressTasks}
          </div>
          <p className="text-xs text-muted-foreground">+1 from yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CircleCheckBig className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingList ? <NumberSkeleton /> : completedTasks}
          </div>
          <p className="text-xs text-muted-foreground">+3 from yesterday</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <ClockAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoadingList ? <NumberSkeleton /> : overdueTasks}
          </div>
          <p className="text-xs text-muted-foreground">-2 from yesterday</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskStats;
