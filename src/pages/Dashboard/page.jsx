import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User as UserIcon, Mail, ShieldCheck, ArrowRight } from "lucide-react";

function Dashboard() {
  const { token } = useAuth();

  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);

  // rest of your code...

  useEffect(() => {
    const fetchUser = async () => {
      try {

        const response = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }
        setProfile(data.user);

     //    setUser({
     //      ...JSON.parse(localStorage.getItem("user")),
     //    });

        setMessage(data.message);
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      {!profile ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
          Loading your dashboard...
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, {profile.name.split(" ")[0]}
          </h1>
          <p className="text-slate-500 mt-1">
            {message || "Here's a quick look at your account."}
          </p>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <UserIcon size={18} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                {profile.name}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                {profile.email}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <ShieldCheck size={18} className="text-indigo-600" />
              </div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize">
                {profile.role}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            <button
              onClick={() => (window.location.href = "/profile")}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer rounded-t-2xl"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  My Profile
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  View and edit your employee details
                </p>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;