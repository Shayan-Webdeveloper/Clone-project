import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Copy, Check } from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/api`;

function AdminInvite() {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [invitations, setInvitations] = useState(null);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${API}/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setInvitations(data.invitations);
    } catch (err) {
      console.error("Fetch invitations error:", err);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNewLink("");
    setCopied(false);
    try {
      const response = await fetch(`${API}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setNewLink(data.invitationLink);
      setEmail("");
      fetchInvitations();
    } catch (err) {
      setError(err.message || "Unable to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(newLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Invite</h1>
      <p className="text-slate-500 mt-1">
        Bring new team members onto Team Pulse.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Invite a team member
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            They'll get a link to set up their account and join the team.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              {loading ? "Sending..." : "Send invitation"}
            </button>
          </form>

          {newLink && (
            <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 mb-2">
                Invitation link ready — share it with your teammate.
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-indigo-700 truncate flex-1">
                  {newLink}
                </p>
                <button
                  onClick={copyLink}
                  className="shrink-0 text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recent invitations
          </h2>

          {!invitations ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
              Loading...
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-slate-400">No invitations sent yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {invitations.map((inv) => (
                <li
                  key={inv._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-slate-700 truncate">
                    {inv.email}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize ${
                      inv.status === "accepted"
                        ? "bg-green-50 text-green-700"
                        : inv.status === "expired"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminInvite;
