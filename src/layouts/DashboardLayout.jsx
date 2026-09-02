import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
