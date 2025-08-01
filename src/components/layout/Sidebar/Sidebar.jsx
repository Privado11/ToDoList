import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  Inbox,
  Settings,
  Users,
  Menu,
  BarChart2,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Sidebar({ setActiveFilter }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterClick = (priority) => {
    setActiveFilter(priority);
    setIsOpen(false);
  };

  const ComingSoonItem = ({ icon, label }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground cursor-not-allowed"
            onClick={(e) => e.preventDefault()}
          >
            {icon}
            {label}
            <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              Coming soon
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This feature will be available soon.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-0 left-0 z-50 h-16 w-10 flex items-center justify-center lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="!h-6 !w-6" />
      </Button>

      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:static`}
      >
        <div className="sticky top-0 z-10 flex h-16 lg:hidden items-center border-b  px-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold lg:hidden"
          >
            <CheckSquare className="h-6 w-6" />
            <span>Piranha Planner</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] px-3 py-2">
          <div className="space-y-4">
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Menu
              </h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link to="/dashboard">
                    <Inbox className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <ComingSoonItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Calendar"
                />
                <ComingSoonItem
                  icon={<Users className="h-4 w-4" />}
                  label="Team"
                />
                <ComingSoonItem
                  icon={<BarChart2 className="h-4 w-4" />}
                  label="Statistics"
                />
                <ComingSoonItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Activity"
                />
                <ComingSoonItem
                  icon={<Settings className="h-4 w-4" />}
                  label="Settings"
                />
              </div>
            </div>
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Tasks
              </h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleFilterClick("High")}
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High Priority
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleFilterClick("Medium")}
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium Priority
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleFilterClick("Low")}
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Low Priority
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleFilterClick("shared_me")}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  share with me
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleFilterClick("all")}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  All Tasks
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

export default Sidebar;
