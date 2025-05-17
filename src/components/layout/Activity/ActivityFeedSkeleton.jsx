import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ActivityFeedSkeleton() {
  const skeletonItems = Array(3).fill(null);

  return (
    <Card className="h-[326px]">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Recent task updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skeletonItems.map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="mt-0.5 h-2 w-2 rounded-full" />

            <div className="space-y-1 w-full">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ActivityFeedSkeleton;
