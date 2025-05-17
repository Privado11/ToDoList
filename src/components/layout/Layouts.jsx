import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "@/components";
import { useState } from "react";

function MainLayout({ showSidebar = true }) {
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
        </main>
      </div>
    </div>
  );
}

function SimpleLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export { MainLayout, SimpleLayout };
