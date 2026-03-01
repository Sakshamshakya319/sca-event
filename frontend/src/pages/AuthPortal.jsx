import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

const ROLE_TARGET = {
  superadmin: "/superadmin",
  admin: "/admin",
  faculty: "/faculty",
  student: "/student"
};

function AuthPortal() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [redirectRole, setRedirectRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Please enter credentials");
      return;
    }
    setLoading(true);
    try {
      const payloadIdentifier = identifier.trim();
      const payloadPassword = password;
      const attempt = async (body) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          return data;
        }
        if (
          res.status === 401 &&
          (data.message === "Invalid credentials" || !data.message)
        ) {
          return null;
        }
        if (res.status === 400 && data.message === "Missing credentials") {
          return null;
        }
        throw new Error(data.message || "Login failed");
      };

      let result = await attempt({
        identifier: payloadIdentifier,
        password: payloadPassword
      });
      if (!result) {
        const rolesToTry = ["superadmin", "admin", "faculty", "student"];
        // eslint-disable-next-line no-restricted-syntax
        for (const roleKey of rolesToTry) {
          // eslint-disable-next-line no-await-in-loop
          result = await attempt({
            role: roleKey,
            identifier: payloadIdentifier,
            password: payloadPassword
          });
          if (result) break;
        }
      }

      if (!result) {
        setError("Invalid credentials");
        return;
      }

      login(result.token, result.user);
      if (result.user.mustChangePassword) {
        setShowPasswordChange(true);
        setCurrentPasswordForChange(payloadPassword);
        setRedirectRole(result.user.role || null);
      } else {
        const target = ROLE_TARGET[result.user.role] || "/";
        navigate(target);
      }
    } catch (err) {
      setError(
        err && typeof err.message === "string"
          ? err.message
          : "Unable to reach server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-main">
      <nav className="flex items-center justify-between border-b border-black/60 bg-text-main/95 px-6 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-7 w-auto"
          />
          <span className="hidden text-[10px] font-mono uppercase tracking-[0.22em] text-text-muted sm:inline">
            Unified portal
          </span>
        </Link>
        <Link
          to="/"
          className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/80"
        >
          Back to site
        </Link>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-6 md:px-10 md:py-10">
        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
          <div className="hidden rounded-2xl border border-border-color bg-white/70 px-8 py-10 shadow-sm md:flex md:flex-col md:justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
              School of Computer Applications · LPU
            </p>
            <h1 className="mt-4 font-sans font-bold text-3xl md:text-4xl">
              One portal
              <br />
              <span className="italic text-text-muted">for every SCA role.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-text-muted">
              Superadmin, Admin, Faculty and Students sign in from the same secure
              gateway and are routed to their dashboards automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-border-color bg-white px-6 py-7 shadow-sm md:px-8 md:py-8">
            <h2 className="font-sans font-bold text-2xl">Sign in to SCA EMS</h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Enter your portal credentials
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Login UID / Reg. No.
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border border-border-color px-3 py-2 text-sm"
                  placeholder="Registration number / UID / official email"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border-color px-3 py-2 pr-12 text-sm"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-xs text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
      {showPasswordChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded border border-border-color bg-white p-6 shadow-xl">
            <h3 className="font-sans font-bold text-lg">Set your own password</h3>
            <p className="mt-1 text-xs text-text-muted">
              This account was created by admin. For security and transparency,
              please change the provided password to your own secret password.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordChangeError("");
                if (!newPassword || !confirmNewPassword) {
                  setPasswordChangeError("Enter and confirm your new password");
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  setPasswordChangeError("New passwords do not match");
                  return;
                }
                try {
                  const token = localStorage.getItem("scaAuthToken");
                  if (!token) {
                    setPasswordChangeError("You are not authenticated");
                    return;
                  }
                  const res = await fetch("/api/auth/password", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({
                      currentPassword: currentPasswordForChange,
                      newPassword
                    })
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setPasswordChangeError(
                      data.message || "Failed to update password"
                    );
                    return;
                  }
                  localStorage.setItem("scaUserMustChangePassword", "0");
                  const roleForRedirect =
                    redirectRole || localStorage.getItem("scaUserRole");
                  const target = ROLE_TARGET[roleForRedirect] || "/";
                  setShowPasswordChange(false);
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setCurrentPasswordForChange("");
                  navigate(target);
                } catch {
                  setPasswordChangeError("Unable to update password");
                }
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-text-muted">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPasswordForChange}
                  onChange={(e) =>
                    setCurrentPasswordForChange(e.target.value)
                  }
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="Enter a strong password"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="Re-enter new password"
                />
              </div>
              {passwordChangeError && (
                <p className="text-xs text-red-600">
                  {passwordChangeError}
                </p>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded border border-border-color px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-text-muted"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setCurrentPasswordForChange("");
                  }}
                >
                  Later
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Save password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <SiteFooter mode="dark" />
    </div>
  );
}

export default AuthPortal;

