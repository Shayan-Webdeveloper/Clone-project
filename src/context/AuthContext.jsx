import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [selectedTeam, setSelectedTeam] = useState(
    JSON.parse(localStorage.getItem("selectedTeam")) || null
  );

  const login = (token, user) => {
    localStorage.removeItem("selectedTeam");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setSelectedTeam(null);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedTeam");

    setToken(null);
    setUser(null);
    setSelectedTeam(null);
  };

  const selectTeam = (team) => {
    if (!team) {
      localStorage.removeItem("selectedTeam");
      setSelectedTeam(null);
      return;
    }

    localStorage.setItem("selectedTeam", JSON.stringify(team));
    setSelectedTeam(team);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        selectedTeam,
        setSelectedTeam,
        selectTeam,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);  
};