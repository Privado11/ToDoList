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

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:static`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
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
                  <Link href="/">
                    <Inbox className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href="/calendar">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href="/team">
                    <Users className="h-4 w-4" />
                    Team
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 lg:hidden"
                  asChild
                >
                  <Link href="/stats">
                    <BarChart2 className="h-4 w-4" />
                    Statistics
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 lg:hidden"
                  asChild
                >
                  <Link href="/activity">
                    <Activity className="h-4 w-4" />
                    Activity
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Tasks
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High Priority
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium Priority
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Low Priority
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

export { Sidebar };