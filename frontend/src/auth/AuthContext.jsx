import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    token: null,
    role: null,
    name: "",
    identifier: "",
    photoUrl: "",
    mustChangePassword: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("scaAuthToken") || null;
    const role = localStorage.getItem("scaUserRole") || null;
    const name = localStorage.getItem("scaUserName") || "";
    const identifier = localStorage.getItem("scaUserIdentifier") || "";
    const photoUrl = localStorage.getItem("scaUserPhoto") || "";
    const mustChangePassword =
      localStorage.getItem("scaUserMustChangePassword") === "1";
    setState({ token, role, name, identifier, photoUrl, mustChangePassword });
    setLoading(false);
  }, []);

  const login = (token, user) => {
    const name = user.name || "";
    const identifier = user.identifier || "";
    const role = user.role || null;
    const mustChangePassword = !!user.mustChangePassword;
    localStorage.setItem("scaAuthToken", token);
    localStorage.setItem("scaUserRole", role || "");
    localStorage.setItem("scaUserName", name);
    localStorage.setItem("scaUserIdentifier", identifier);
    localStorage.setItem(
      "scaUserMustChangePassword",
      mustChangePassword ? "1" : "0"
    );
    setState((prev) => ({
      ...prev,
      token,
      role,
      name,
      identifier,
      mustChangePassword
    }));
  };

  const updateProfile = ({ name, identifier, photoUrl }) => {
    setState((prev) => {
      const next = { ...prev };
      if (name !== undefined) {
        next.name = name || "";
        localStorage.setItem("scaUserName", next.name);
      }
      if (identifier !== undefined) {
        next.identifier = identifier || "";
        localStorage.setItem("scaUserIdentifier", next.identifier);
      }
      if (photoUrl !== undefined) {
        next.photoUrl = photoUrl || "";
        localStorage.setItem("scaUserPhoto", next.photoUrl);
      }
      return next;
    });
  };

  const refreshFromProfile = async () => {
    const token = state.token || localStorage.getItem("scaAuthToken");
    if (!token) return;
    try {
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      updateProfile({
        name: data.fullName || "",
        identifier: data.identifier || "",
        photoUrl: data.photoUrl || ""
      });
    } catch {
    }
  };

  const markPasswordChanged = () => {
    localStorage.setItem("scaUserMustChangePassword", "0");
    setState((prev) => ({
      ...prev,
      mustChangePassword: false
    }));
  };

  const logout = () => {
    localStorage.removeItem("scaAuthToken");
    localStorage.removeItem("scaUserRole");
    localStorage.removeItem("scaUserName");
    localStorage.removeItem("scaUserIdentifier");
    localStorage.removeItem("scaUserPhoto");
    localStorage.removeItem("scaUserMustChangePassword");
    setState({
      token: null,
      role: null,
      name: "",
      identifier: "",
      photoUrl: "",
      mustChangePassword: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loading,
        login,
        logout,
        updateProfile,
        refreshFromProfile,
        markPasswordChanged
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

