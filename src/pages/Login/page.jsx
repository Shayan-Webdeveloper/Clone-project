import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

function Login() {
     const [error, setError] = useState("");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
setLoading(true);   
setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

     if (response.ok) {
  login(data.token, data.user);
} else {
  setError(data.message);
}

setLoading(false);
    } 
    catch (error) {
  console.error("Login error:", error);
  setError("Unable to connect to the server. Please try again.");
}
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">TP</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to your Team Pulse account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
  setEmail(e.target.value);
  setError("");
}}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Password */}
         <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">
  Password
</label>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => {
  setPassword(e.target.value);
  setError("");
}}
    required
    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />

<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-[68%] -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
>
  {showPassword ? (
    <EyeOff size={20} />
  ) : (
    <Eye size={20} />
  )}
</button>
</div>
{error && (
  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
    {error}
  </div>
)}
          {/* Button */}
          <button
            type="submit"
             disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          >
            {loading ? (
  <span className="flex items-center justify-center gap-2">
    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
    Signing in...
  </span>
) : (
  "Sign in"
)}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Team Pulse · Employee Management System
        </p>

      </div>
    </div>
  );
}

export default Login;