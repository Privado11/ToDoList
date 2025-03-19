import Header from "../Header";
import Sidebar from "../Sidebar";
import TaskStats from "./TaskStats";


function StatsPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4 md:p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Statistics</h1>
          <TaskStats />
        </main>
      </div>
    </div>
  );
}

export default StatsPage;
