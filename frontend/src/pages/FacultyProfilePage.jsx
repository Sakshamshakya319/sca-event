import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function FacultyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    fullName: "",
    identifier: "",
    program: "",
    degree: "",
    semester: "",
    section: "",
    universityEmail: "",
    personalEmail: "",
    phone: "",
    photoUrl: ""
  });

  const navigate = useNavigate();
  const { updateProfile, logout } = useAuth();

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "faculty") {
      navigate("/portal");
    }
  }, [navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("scaAuthToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (res.status === 401) {
          logout();
          navigate("/portal");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const nextProfile = {
            fullName: data.fullName || "",
            identifier: data.identifier || "",
            program: data.program || "",
            degree: data.degree || "",
            semester: data.semester || "",
            section: data.section || "",
            universityEmail: data.universityEmail || "",
            personalEmail: data.personalEmail || "",
            phone: data.phone || "",
            photoUrl: data.photoUrl || ""
          };
          setProfile(nextProfile);
          updateProfile({
            name: nextProfile.fullName,
            identifier: nextProfile.identifier,
            photoUrl: nextProfile.photoUrl
          });
        } else {
          setError("Could not load profile");
        }
      } catch {
        setError("Unable to reach server");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("scaAuthToken");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(profile)
      });
      if (res.status === 401) {
        logout();
        navigate("/portal");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        updateProfile({
          name: data.fullName || "",
          identifier: data.identifier || "",
          photoUrl: data.photoUrl || ""
        });
        navigate("/faculty");
        return;
      }
      setError("Could not update profile");
    } catch {
      setError("Unable to reach server");
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial =
    profile.fullName && profile.fullName.trim().length
      ? profile.fullName.trim().charAt(0).toUpperCase()
      : "F";

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-main">
      <nav className="flex items-center justify-between border-b border-black/70 bg-text-main px-8 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-8 w-auto"
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
            Faculty
          </span>
        </Link>
        <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
          <Link to="/faculty">Dashboard</Link>
          <Link to="/about" className="hidden md:inline">
            About
          </Link>
          <Link to="/team" className="hidden md:inline">
            Team
          </Link>
          <Link to="/contact" className="hidden md:inline">
            Contact
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-8 py-8">
        <section className="mx-auto max-w-4xl rounded border border-border-color bg-white p-6">
          <div className="mb-4 flex items-center justify-between text-xs text-text-muted">
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className="rounded border border-border-color px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em]"
            >
              ← Back to dashboard
            </button>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border-color bg-background">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue text-xl font-semibold text-white">
                    {avatarInitial}
                  </div>
                )}
              </div>
              <div>
                <div className="font-sans font-bold text-xl">
                  {profile.fullName || "Your name"}
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  <span className="font-mono">
                    {profile.identifier || "Faculty ID"}
                  </span>
                  <span className="ml-2 rounded bg-background px-2 py-[2px] text-[10px] font-mono uppercase tracking-[0.18em]">
                    Faculty · School of Computer Applications
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-text-muted">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em]">
                My Profile
              </div>
              <div>Edit your faculty details and contact information.</div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-6 md:grid-cols-[1.4fr,1.6fr]"
          >
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                  Faculty Details
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Full Name
                    </label>
                    <input
                      value={profile.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Faculty ID / Email
                    </label>
                    <input
                      value={profile.identifier}
                      onChange={(e) => handleChange("identifier", e.target.value)}
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="e.g. faculty@lpu.co.in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Programme / School
                    </label>
                    <input
                      value={profile.program}
                      onChange={(e) => handleChange("program", e.target.value)}
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="e.g. SCA, MCA"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                  Contact Details
                </div>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      University Email
                    </label>
                    <input
                      value={profile.universityEmail}
                      onChange={(e) =>
                        handleChange("universityEmail", e.target.value)
                      }
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="yourname@lpu.co.in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Personal Email
                    </label>
                    <input
                      value={profile.personalEmail}
                      onChange={(e) =>
                        handleChange("personalEmail", e.target.value)
                      }
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Phone
                    </label>
                    <input
                      value={profile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="+91 98xxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Photo URL
                    </label>
                    <input
                      value={profile.photoUrl}
                      onChange={(e) => handleChange("photoUrl", e.target.value)}
                      className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="Paste a hosted image link"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="text-[11px] text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-[11px] text-green-700">
                  {success}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="rounded bg-primary px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter
        mode="dark"
        context="Faculty profile for SCA Event Management System."
      />
    </div>
  );
}

export default FacultyProfilePage;

