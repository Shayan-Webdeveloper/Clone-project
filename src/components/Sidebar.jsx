import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Mail,
  ListChecks,
  Clock,
  FileText,
  UserCircle,
  LogOut,
} from "lucide-react";

const ADMIN_LINKS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/employees", label: "Employees", icon: Users },
  { to: "/dashboard/invite", label: "Invite", icon: Mail },
  { to: "/dashboard/questions", label: "Questions", icon: ListChecks },
  { to: "/dashboard/schedule", label: "Schedule", icon: Clock },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

const EMPLOYEE_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

function Sidebar() {
  const { user, selectedTeam, selectTeam, token, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createTeamError, setCreateTeamError] = useState("");
  const isAdmin = user?.role === "admin" || selectedTeam?.role === "admin";
  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS;

  const fetchTeams = async (teamToSelect) => {
    if (!token) {
      setTeams([]);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/teams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      const nextTeams = data.teams || [];

      setTeams(nextTeams);

      if (nextTeams.length === 0) {
        if (selectedTeam) selectTeam(null);
        return;
      }

      if (teamToSelect) {
        const matched = nextTeams.find((team) => team.teamId === teamToSelect);
        if (matched) {
          selectTeam(matched);
          return;
        }
      }

      const hasSelectedTeam = nextTeams.some(
        (team) => team.teamId === selectedTeam?.teamId
      );

      if (!hasSelectedTeam) {
        selectTeam(nextTeams[0]);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      setTeams([]);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [token]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    setCreateTeamError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newTeamName.trim() }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchTeams(data.team._id);
      setNewTeamName("");
      setIsCreatingTeam(false);
    } catch (error) {
      setCreateTeamError(error.message || "Unable to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

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
          <select
  value={selectedTeam?.teamId || ""}
  onChange={(e) => {
    const team = teams.find((t) => t.teamId === e.target.value);
    if (team) selectTeam(team);
  }}
  className="mt-2 w-full text-xs border border-slate-200 rounded-lg px-2 py-1"
>
  {teams.map((team) => (
    <option key={team.teamId} value={team.teamId}>
      {team.name}
    </option>
  ))}
</select>

{isCreatingTeam ? (
  <form onSubmit={handleCreateTeam} className="mt-2 space-y-1.5">
    <input
      type="text"
      autoFocus
      placeholder="Team name"
      value={newTeamName}
      onChange={(e) => setNewTeamName(e.target.value)}
      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1"
    />
    {createTeamError && (
      <p className="text-[11px] text-red-600">{createTeamError}</p>
    )}
    <div className="flex gap-1.5">
      <button
        type="submit"
        disabled={creatingTeam}
        className="flex-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1 cursor-pointer"
      >
        {creatingTeam ? "Creating..." : "Create"}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsCreatingTeam(false);
          setNewTeamName("");
          setCreateTeamError("");
        }}
        className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-1 cursor-pointer"
      >
        Cancel
      </button>
    </div>
  </form>
) : (
  <button
    onClick={() => setIsCreatingTeam(true)}
    className="mt-1.5 w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 text-left cursor-pointer"
  >
    + Create team
  </button>
)}
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
