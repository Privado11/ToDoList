import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const TaskCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-800" />

      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="px-2 py-1 h-5 w-5 rounded-md" />

          <div className="flex items-center gap-2">
            <Skeleton className="px-2 py-1 h-5 w-5 rounded-md" />

            <Skeleton className="px-2 py-1 h-5 w-2" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-5/5" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow pb-3">
        <div className="flex-grow mb-3 min-h-20 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-10/12" />
          <Skeleton className="h-3 w-9/12" />
          <Skeleton className="h-3 w-7/12" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Skeleton className="h-4 w-24 rounded-md" />

          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex -space-x-2 overflow-hidden">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right flex flex-col items-end">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCardSkeleton;
