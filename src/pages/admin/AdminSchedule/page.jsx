import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const API = "http://localhost:5000/api";

const DAYS = [
  { key: "sunday", label: "S" },
  { key: "monday", label: "M" },
  { key: "tuesday", label: "T" },
  { key: "wednesday", label: "W" },
  { key: "thursday", label: "T" },
  { key: "friday", label: "F" },
  { key: "saturday", label: "S" },
];

const DEFAULT_DAYS = {
  sunday: true,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
};

function AdminSchedule() {
  const { token } = useAuth();
  const [dailyTime, setDailyTime] = useState("09:00");
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${API}/settings/schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setDailyTime(data.dailyTime);
        if (data.days) setDays(data.days);
      } catch (err) {
        setError(err.message || "Unable to load schedule");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const toggleDay = (key) => {
    setDays((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const activeDayCount = Object.values(days).filter(Boolean).length;

  const handleSave = async (e) => {
    e.preventDefault();

    if (activeDayCount === 0) {
      setError("Select at least one day to send the standup on.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`${API}/settings/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dailyTime, days }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setDailyTime(data.dailyTime);
      setDays(data.days);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Unable to save schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Schedule</h1>
      <p className="text-slate-500 mt-1">
        Choose which days and what time the standup questions go out.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-md mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Standup alarm
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          It's not compulsory to run every day — pick the days that fit your
          team.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
            Loading schedule...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Repeat on
              </label>
              <div className="flex gap-2">
                {DAYS.map((day) => {
                  const isActive = !!days[day.key];
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      aria-pressed={isActive}
                      aria-label={day.key}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {activeDayCount === 7
                  ? "Sending every day"
                  : activeDayCount === 0
                  ? "No days selected"
                  : `Sending on ${activeDayCount} day${
                      activeDayCount === 1 ? "" : "s"
                    } a week`}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                Schedule saved.
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              {saving ? "Saving..." : "Save schedule"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminSchedule;
