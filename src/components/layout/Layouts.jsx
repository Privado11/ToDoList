import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "@/components";
import { useState } from "react";
import { MultiChatManager } from "@/features";
import { useAuth } from "@/context";

function MainLayout({ showSidebar = true }) {
  const [activeFilter, setActiveFilter] = useState("all");
    const { profile: user } = useAuth();

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
          <div className="hidden md:block">
            <MultiChatManager user={user} />
          </div>
        </main>
      </div>
    </div>
  );
}

function SimpleLayout() {
  const { profile: user } = useAuth();
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
        <div className="hidden md:block">
          <MultiChatManager user={user} />
        </div>
      </main>
    </div>
  );
}

export { MainLayout, SimpleLayout };
