import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Users, UserCheck, Mail, ListChecks, Clock } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/api`;

function AdminOverview() {
  const { user, token, selectedTeam } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    
    const fetchStats = async () => {
      try {
        if (!selectedTeam?.teamId) {
  setError("You don't belong to any team yet. Create a team or accept an invitation to get started.");
  return;
}
        const [employeesRes, invitationsRes, questionsRes, scheduleRes] =
          await Promise.all([
            fetch(`${API}/employee/${selectedTeam.teamId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API}/invitations`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API}/questions`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API}/settings/schedule`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const [employeesData, invitationsData, questionsData, scheduleData] =
          await Promise.all([
            employeesRes.json(),
            invitationsRes.json(),
            questionsRes.json(),
            scheduleRes.json(),
          ]);

        if (!employeesRes.ok) throw new Error(employeesData.message);
        if (!invitationsRes.ok) throw new Error(invitationsData.message);
        if (!questionsRes.ok) throw new Error(questionsData.message);
        if (!scheduleRes.ok) throw new Error(scheduleData.message);

        const employees = employeesData.employees || [];
        const invitations = invitationsData.invitations || [];
        const questions = questionsData.questions || [];

        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter((e) => e.user?.isActive).length,
          pendingInvitations: invitations.filter(
            (i) => i.status === "pending"
          ).length,
          activeQuestions: questions.filter((q) => q.isActive).length,
          dailyTime: scheduleData.dailyTime,
          days: scheduleData.days,
        });
      } catch (err) {
        setError(err.message || "Unable to load dashboard stats");
      }
    };

    fetchStats();
  }, [token, selectedTeam]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome, {user?.name?.split(" ")[0]}
      </h1>
      <p className="text-slate-500 mt-1">
        Here's what's happening with your team today.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mt-6">
          {error}
        </div>
      )}

      {!stats && !error ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm mt-8">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
          Loading overview...
        </div>
      ) : stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard
            icon={Users}
            label="Total employees"
            value={stats.totalEmployees}
          />
          <StatCard
            icon={UserCheck}
            label="Active employees"
            value={stats.activeEmployees}
          />
          <StatCard
            icon={Mail}
            label="Pending invitations"
            value={stats.pendingInvitations}
          />
          <StatCard
            icon={ListChecks}
            label="Active questions"
            value={stats.activeQuestions}
          />
        </div>
      ) : null}

      {stats && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Standup send time</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              {stats.dailyTime} · {formatDays(stats.days)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const DAY_LABELS = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};
const DAY_ORDER = Object.keys(DAY_LABELS);


function formatDays(days) {
  if (!days) return "";
  const active = DAY_ORDER.filter((key) => days[key]);
  
  if (active.length === 7) return "every day";
  if (active.length === 0) return "no days selected";
  return active.map((key) => DAY_LABELS[key]).join(", ");
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
        <Icon size={18} className="text-indigo-600" />
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}

export default AdminOverview;
