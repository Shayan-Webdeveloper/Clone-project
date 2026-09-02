     import { useEffect, useState } from "react";
     import { useAuth } from "../context/AuthContext";
     import { Pencil, Briefcase, Phone, CalendarDays, Building2 } from "lucide-react";

     function Profile() {
     const { token } = useAuth();
     const [profile, setProfile] = useState(null);
     const [employee, setEmployee] = useState(null);
     const [isEditing, setIsEditing] = useState(false);     
     const [formData, setFormData] = useState({
     department: "",
     position: "",
     phone: "",
     joiningDate: "",
     });
     const handleSave = async () => {
     try {
     const response = await fetch(
     employee ? "http://localhost:5000/api/employee/me" : "http://localhost:5000/api/employee",
     {
     method: employee ? "PUT" : "POST",
          headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
          }
     );

     const data = await response.json();

     if (!response.ok) {
          throw new Error(data.message);
     }

     setEmployee(data.employee);
     setIsEditing(false);
     } catch (error) {
     console.error("Save profile error:", error);
     }
     };
     useEffect(() => {
     const fetchProfile = async () => {
          try {
          const response = await fetch("http://localhost:5000/api/profile", {
               headers: {
               Authorization: `Bearer ${token}`,
               },
          });

          const data = await response.json();

          if (!response.ok) {
               throw new Error(data.message);
          }

          setProfile(data.user);
          const employeeResponse = await fetch(
     "http://localhost:5000/api/employee/me",
     {
     headers: {
          Authorization: `Bearer ${token}`,
     },
     }
     );

     const employeeData = await employeeResponse.json();

     if (!employeeResponse.ok && employeeResponse.status !== 404) {
     throw new Error(employeeData.message);
     }

     if (employeeResponse.status === 404) {
     setEmployee(null);
     return;
     }

     setEmployee(employeeData.employee);
     setFormData({
     department: employeeData.employee.department || "",
     position: employeeData.employee.position || "",
     phone: employeeData.employee.phone || "",
     joiningDate: employeeData.employee.joiningDate
     ? employeeData.employee.joiningDate.split("T")[0]
     : "",
     });
          } catch (error) {
          console.error("Profile error:", error);
          }
     };

     fetchProfile();
     }, [token]);

     if (!profile) {
     return (
       <div className="flex items-center gap-2 text-slate-400 text-sm px-8 py-10">
         <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></span>
         Loading profile...
       </div>
     );
     }

     const initials = profile.name
       .split(" ")
       .map((part) => part[0])
       .slice(0, 2)
       .join("")
       .toUpperCase();

return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">

      <h1 className="text-3xl font-bold text-slate-900 mb-6">My Profile</h1>

      {/* Identity card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 truncate">
              {profile.name}
            </h1>
            <p className="text-slate-500 text-sm truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 capitalize">
                {profile.role}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee info / edit form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Employee information
          </h2>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              <Pencil size={15} />
              {employee ? "Edit" : "Add details"}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Position
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +92 300 1234567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Joining date
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    joiningDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
              >
                Save changes
              </button>
              <button
                onClick={() => {
                  setFormData({
                    department: employee?.department || "",
                    position: employee?.position || "",
                    phone: employee?.phone || "",
                    joiningDate: employee?.joiningDate
                      ? employee.joiningDate.split("T")[0]
                      : "",
                  });
                  setIsEditing(false);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : employee ? (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {employee.department || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Briefcase size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Position</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {employee.position || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {employee.phone || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <CalendarDays size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Joining date</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {employee.joiningDate
                    ? new Date(employee.joiningDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-4">
              You haven't added your employee details yet.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              Create employee profile
            </button>
          </div>
        )}
      </div>
    </div>
     );
     }

     export default Profile;