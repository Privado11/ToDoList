import { ActivityFeed } from "./ActivityFeed";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";


function ActivityPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Activity</h1>
          <ActivityFeed />
        </main>
      </div>
    </div>
  );
}

export { ActivityPage };
