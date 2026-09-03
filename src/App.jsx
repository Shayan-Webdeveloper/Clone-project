import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login/page";
import AcceptInvitation from "./pages/AcceptInvitation/page";
import Dashboard from "./pages/Dashboard/page";
import Profile from "./pages/Profile/page";
import AdminOverview from "./pages/admin/AdminOverview/page";
import AdminEmployees from "./pages/admin/AdminEmployees/page";
import AdminInvite from "./pages/admin/AdminInvite/page";
import AdminQuestions from "./pages/admin/AdminQuestions/page";
import AdminSchedule from "./pages/admin/AdminSchedule/page";
import DashboardLayout from "./layouts/DashboardLayout";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route path="/accept-invitation" element={<AcceptInvitation />} />

      <Route
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route
          path="/dashboard"
          element={isAdmin ? <AdminOverview /> : <Dashboard />}
        />
        <Route path="/profile" element={<Profile />} />

        {isAdmin && (
          <>
            <Route path="/dashboard/employees" element={<AdminEmployees />} />
            <Route path="/dashboard/invite" element={<AdminInvite />} />
            <Route path="/dashboard/questions" element={<AdminQuestions />} />
            <Route path="/dashboard/schedule" element={<AdminSchedule />} />
          </>
        )}
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
