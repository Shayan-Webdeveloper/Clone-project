import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Eye, EyeOff } from "lucide-react";
function AcceptInvitation() {
     const [error, setError] = useState("");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [name, setName] = useState("");
     const [showPassword, setShowPassword] = useState(false);
     const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();
const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyInvitation = async () => {
      const response = await fetch(
        `http://localhost:5000/api/invitations/verify/${token}`
      );

      const data = await response.json();
if (response.ok) {
  setEmail(data.email);
} else {
  setError(data.message);
}

console.log(data);
    };

    verifyInvitation();
  }, [token]);

  return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
     <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
<div className="flex justify-center mb-6">
  <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center">
    <span className="text-white text-xl font-bold">TP</span>
  </div>
</div>
<div className="mb-2">
    <h1 className="text-3xl font-bold text-slate-900 text-center">
  Accept Invitation
</h1>
<div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mt-2 mb-6 text-center">
  <p className="text-sm text-slate-500">
    Invitation for
  </p>

  <p className="text-sm font-semibold text-indigo-700 mt-1">
    {email}
  </p>
</div>
<p className="text-center text-sm text-slate-400 mb-6">
  Complete your details to join the team.
</p>
</div>
{error && (
  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center mb-5">
    {error}
  </div>
)}
{success && (
  <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 text-center mb-5">
    {success}
  </div>
)}
<form className="space-y-5"
  onSubmit={async (e) => {
    e.preventDefault();
setLoading(true);
    const response = await fetch(
      "http://localhost:5000/api/invitations/accept",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          token,
          password,
        }),
      }
    );

    const data = await response.json();

if (!response.ok) {
  setError(data.message);
}
if (response.ok) {
  setError("");
  setSuccess(data.message);
}

console.log(data);
setLoading(false);
  }}
>
     <p className="text-sm font-semibold text-slate-700">
  Set up your account
</p>
     <label className="block text-sm font-medium text-slate-700 mb-2">
  Full name
</label>
     <input
     className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  type="text"
  placeholder="Enter your full name"
  value={name}
  onChange={(e) => {
  setName(e.target.value);
  setError("");
  setSuccess("");
}}
/>
<label className="block text-sm font-medium text-slate-700 mb-2">
  Create password
</label>
  <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Create a password"
    value={password}
    onChange={(e) => {
  setPassword(e.target.value);
  setError("");
  setSuccess("");
}}
    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>
<p className="text-xs text-slate-400 mt-1">
  Password must be at least 6 characters.
</p>
  <button
  type="submit"
  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
>
    {loading ? (
  <span className="flex items-center justify-center gap-2">
    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
    Creating account...
  </span>
) : (
  "Accept Invitation"
)}
  </button>
</form>
<p className="text-center text-xs text-slate-400 mt-8">
  Team Pulse · Employee Management System
</p>

     </div>
  </div>
);
}

export default AcceptInvitation;