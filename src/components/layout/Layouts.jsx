import { Outlet } from "react-router-dom";
import { AchievementNotifications, Header, Sidebar } from "@/components";
import { useState } from "react";
import { MultiChatManager } from "@/features";
import { useProfileContext } from "@/context";

function MainLayout({ showSidebar = true }) {
  const { profile } = useProfileContext();
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="sticky top-0 z-10 w-full">
        <Header />
      </div>

      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {showSidebar && (
          <div className="lg:h-full lg:sticky lg:top-16">
            <Sidebar setActiveFilter={setActiveFilter} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ activeFilter }} />

          {!profile.is_anonymous && <MultiChatManager />}
        </main>
      </div>

      <AchievementNotifications />
    </div>
  );
}

function SimpleLayout() {
  const { profile } = useProfileContext();
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] p-4 md:p-6">
        <Outlet />

        {!profile.is_anonymous && <MultiChatManager />}
      </main>

      <AchievementNotifications />
    </div>
  );
}

export { MainLayout, SimpleLayout };
