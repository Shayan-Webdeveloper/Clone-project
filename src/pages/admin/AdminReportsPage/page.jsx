import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" });
}

function AdminReportsPage() {
  const { token, selectedTeam } = useAuth();
  const [dates, setDates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      console.log("DEBUG: fetchReports called, selectedTeam =", selectedTeam);
      if (!selectedTeam?.teamId) {
        console.log("DEBUG: no selectedTeam.teamId, bailing out");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reports/${selectedTeam.teamId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        console.log("DEBUG: API response =", data);
        setDates(data.dates || []);
        setEmployees(data.employees || []);
        setReports(data.reports || []);
      } catch (err) {
        setError(err.message || "Unable to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, selectedTeam]);

  const findReport = (employeeId, date) =>
    reports.find(
      (r) => r.employee?._id === employeeId && r.date === date
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
      <p className="text-slate-500 mt-1">
        Standup submissions for the last 7 days.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mt-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm mt-8">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
          Loading reports...
        </div>
      ) : !error && employees.length === 0 ? (
        <p className="text-sm text-slate-400 mt-8">No employees on this team yet.</p>
      ) : !error ? (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 sticky left-0 bg-slate-50">
                  Employee
                </th>
                {dates.map((date) => (
                  <th
                    key={date}
                    className="text-center px-3 py-3 font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {formatDateLabel(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800 sticky left-0 bg-white whitespace-nowrap">
                    {employee.name}
                  </td>
                  {dates.map((date) => {
                    const report = findReport(employee.id, date);
                    return (
                      <td key={date} className="text-center px-3 py-3">
                        {report ? (
                          <button
                            onClick={() => setViewing(report)}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full px-2.5 py-1 cursor-pointer"
                          >
                            Submitted
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 bg-slate-50 rounded-full px-2.5 py-1">
                            Missing
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {viewing.employee?.name}'s report
                </h3>
                <p className="text-xs text-slate-500">{viewing.date}</p>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {viewing.answers?.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-700">
                    {item.question?.questionText || `Question ${idx + 1}`}
                  </p>
                  <p className="mt-1 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReportsPage;