import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Shield,
  BarChart3,
  PieChart,
  Trophy,
  Users,
  Mail,
  Phone,
  Clock,
  Calendar,
} from "lucide-react";

const profileSkeleton = () => {
 return (
    <div className="py-0 px-0 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="p-1 border-b border-gray-200">
        <div className="flex items-center text-gray-600 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2 opacity-50" />
          <span className="text-sm font-medium opacity-50">Back</span>
        </div>
      </div>
      <Card className="w-full mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Skeleton className="h-24 w-24 rounded-full ring-4 ring-primary/10" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" /> {/* Icon */}
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          <div className="mt-4 space-y-3 mb-4">
            <div>
              <Skeleton className="h-5 w-16 mb-2" /> {/* "Interests" title */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full border border-input bg-background px-2.5 py-0.5"
                  >
                    <Skeleton className="h-3 w-3 rounded-full" /> {/* Icon */}
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto whitespace-nowrap">
              <TabsTrigger value="info" className="pointer-events-none">
                <Shield className="h-4 w-4 mr-2 opacity-50" />
                <span className="opacity-50">Information</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="pointer-events-none">
                <BarChart3 className="h-4 w-4 mr-2 opacity-50" />
                <span className="opacity-50">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="pointer-events-none">
                <PieChart className="h-4 w-4 mr-2 opacity-50" />
                <span className="opacity-50">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="pointer-events-none">
                <Trophy className="h-4 w-4 mr-2 opacity-50" />
                <span className="opacity-50">Achievements</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="text-base flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Personal Information
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { icon: Mail, label: "Email", width: "w-32" },
                        { icon: Phone, label: "Phone", width: "w-28" },
                        { icon: Clock, label: "Language", width: "w-20" },
                        {
                          icon: Calendar,
                          label: "Member since",
                          width: "w-24",
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <Skeleton className={`h-4 ${item.width}`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="overview">
              <div className="space-y-6"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-12" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="stats">
              <div className="space-y-6">
                <div className="h-64 border rounded-lg flex items-center justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="text-center space-y-2">
                      <Skeleton className="h-8 w-16 mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="achievements">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="text-center space-y-2">
                      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default profileSkeleton;