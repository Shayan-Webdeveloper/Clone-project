import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Mail,
  ListChecks,
  Clock,
  UserCircle,
  LogOut,
} from "lucide-react";

const ADMIN_LINKS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
  { to: "/dashboard/invite", label: "Invite", icon: Mail },
  { to: "/dashboard/questions", label: "Questions", icon: ListChecks },
  { to: "/dashboard/schedule", label: "Schedule", icon: Clock },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

const EMPLOYEE_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">TP</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            Team Pulse
          </p>
          <p className="text-xs text-slate-400 leading-tight">
            {isAdmin ? "Admin" : "Employee"}
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={17} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-slate-600">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 truncate">
            {user?.name}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
