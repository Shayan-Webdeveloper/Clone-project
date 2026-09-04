import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Users } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/api`;

function AdminEmployees() {
  const { token, selectedTeam } = useAuth();
  const [employees, setEmployees] = useState(null);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API}/employee/${selectedTeam.teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setEmployees(data.employees);
    } catch (err) {
      setError(err.message || "Unable to load employees");
    }
  };

useEffect(() => {
  if (token && selectedTeam?.teamId) {
    fetchEmployees();
  }
}, [token, selectedTeam?.teamId]);

  const toggleStatus = async (employeeId, nextActive) => {
    try {
      const response = await fetch(`${API}/employee/${employeeId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId
            ? { ...emp, user: { ...emp.user, isActive: nextActive } }
            : emp
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update status");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
      <p className="text-slate-500 mt-1">
        Everyone who has joined your team.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mt-6">
          {error}
        </div>
      )}

      {!employees ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm mt-8">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center mt-6">
          <Users size={28} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-900">
            No employees yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Send an invitation to bring your first team member on board.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Position</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {emp.user?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {emp.user?.email}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {emp.department || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {emp.position || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        emp.user?.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {emp.user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() =>
                        toggleStatus(emp._id, !emp.user?.isActive)
                      }
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      {emp.user?.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminEmployees;
