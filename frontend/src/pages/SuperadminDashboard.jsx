import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function SuperadminDashboard() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { name, identifier, logout } = useAuth();
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "superadmin") {
      navigate("/portal");
    }
  }, [navigate]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;
    const move = (e) => {
      const { clientX, clientY } = e;
      gsap.to(cursor, { x: clientX, y: clientY, duration: 0.08 });
      gsap.to(ring, { x: clientX, y: clientY, duration: 0.16 });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      const token = localStorage.getItem("scaAuthToken");
      const role = localStorage.getItem("scaUserRole");
      if (!token || role !== "superadmin") return;
      setLoadingEvents(true);
      try {
        const res = await fetch("/api/events", {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        } else {
          setEvents([]);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!events.length) return;
    if (typeof window === "undefined") return;
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const fiveDaysAhead = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5
    );
    const upcoming = events
      .filter((e) => e.date)
      .map((e) => ({
        ...e,
        dateObj: new Date(e.date)
      }))
      .filter((e) => !Number.isNaN(e.dateObj.getTime()))
      .filter((e) => e.dateObj >= todayStart && e.dateObj <= fiveDaysAhead)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 5);
    if (upcoming.length) {
      setEventNotifications(upcoming);
      setShowNotifications(true);
    }
  }, [events]);

  useEffect(() => {
    if (!rootRef.current) return;
    anime({
      targets: rootRef.current.querySelectorAll(".sdm-fade"),
      opacity: [0, 1],
      translateY: [20, 0],
      easing: "easeOutQuad",
      duration: 650,
      delay: anime.stagger(90)
    });
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      const token = localStorage.getItem("scaAuthToken");
      if (!token) {
        setLoadingMessages(false);
        return;
      }
      try {
        const res = await fetch("/api/contact", {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (res.ok) {
          const data = await res.json();
          setContactMessages(Array.isArray(data) ? data.slice(0, 5) : []);
        } else {
          setContactMessages([]);
        }
      } catch {
        setContactMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    const loadUsers = async role => {
      const token = localStorage.getItem("scaAuthToken");
      if (!token) return;
      if (role === "faculty") {
        setLoadingFaculty(true);
      } else {
        setLoadingStudents(true);
      }
      try {
        const res = await fetch(`/api/auth/users?role=${role}`, {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (role === "faculty") {
            setFacultyUsers(Array.isArray(data) ? data : []);
          } else {
            setStudentUsers(Array.isArray(data) ? data : []);
          }
        }
      } catch {
      } finally {
        if (role === "faculty") {
          setLoadingFaculty(false);
        } else {
          setLoadingStudents(false);
        }
      }
    };
    loadUsers("faculty");
    loadUsers("student");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

  const totalEvents = events.length;
  const pendingEvents = events.filter(e => e.status === "pending");
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const ongoingEvents = events.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d >= todayStart;
  });

  return (
    <div ref={rootRef} className="relative min-h-screen bg-background text-text-main">
      <div
        ref={cursorRef}
        className="cursor-dot fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50"
      />

      <nav className="relative z-40 flex items-center justify-between border-b border-black/70 bg-text-main px-8 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-8 w-auto"
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
            Superadmin
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 md:flex">
            <span className="text-white">Overview</span>
            <Link to="/superadmin/events">Events</Link>
            <Link to="/superadmin/users">Users</Link>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
            <div className="hidden flex-col text-right sm:flex">
              <span className="truncate">{name || "Superadmin"}</span>
              <span className="truncate">
                {identifier || "sca@admin.lpu"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-border-color px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <header className="flex items-center justify-between border-b border-border-color bg-white px-8 py-4">
        <div>
          <div className="font-sans font-bold text-xl">Superadmin Dashboard</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            System-wide overview · SCA EMS
          </div>
        </div>
        <div className="sdm-fade flex gap-6">
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">
              {loadingEvents ? "…" : totalEvents}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Total Events
            </div>
          </div>
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">
              {loadingEvents ? "…" : pendingEvents.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Pending Approvals
            </div>
          </div>
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">
              {loadingFaculty ? "…" : facultyUsers.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Faculty
            </div>
          </div>
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">
              {loadingStudents ? "…" : studentUsers.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Students
            </div>
          </div>
        </div>
      </header>

      {showNotifications && eventNotifications.length > 0 && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-border-color bg-white p-6 shadow-xl">
            <h2 className="font-sans font-bold text-lg text-text-main">
              Upcoming events (next 5 days)
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              System-wide events scheduled in the next few days.
            </p>
            <div className="mt-4 space-y-3">
              {eventNotifications.map(e => {
                const label = e.dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
                return (
                  <div
                    key={e.id}
                    className="flex items-start justify-between rounded border border-border-color bg-background px-3 py-2 text-xs text-text-main"
                  >
                    <div>
                      <div className="font-medium">{e.title}</div>
                      {e.description && (
                        <div className="mt-1 text-[11px] text-text-muted">
                          {e.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] font-mono text-text-muted">
                      <div>{label}</div>
                      {e.facultyName && (
                        <div className="mt-1 text-[9px] uppercase tracking-[0.18em]">
                          {e.facultyName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-8 py-6">
        <section className="sdm-fade mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded border border-border-color bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              System Health
            </div>
            <div className="mt-1 font-sans font-bold text-2xl text-green-700">OK</div>
          </div>
          <div className="rounded border border-border-color bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Events Today
            </div>
            <div className="mt-1 font-sans font-bold text-2xl">
              {ongoingEvents.length}
            </div>
          </div>
          <div className="rounded border border-border-color bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Pending Approvals
            </div>
            <div className="mt-1 font-sans font-bold text-2xl">
              {pendingEvents.length}
            </div>
          </div>
          <div className="rounded border border-border-color bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Version
            </div>
            <div className="mt-1 font-sans font-bold text-2xl">1.0</div>
          </div>
        </section>

        <section className="sdm-fade mt-6">
          <div className="rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Latest contact queries</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                From Contact page
              </span>
            </div>
            <div className="divide-y divide-border">
              {loadingMessages && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Loading queries…
                </div>
              )}
              {!loadingMessages && contactMessages.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No queries have been submitted yet.
                </div>
              )}
              {!loadingMessages &&
                contactMessages.map(m => (
                  <div key={m.id} className="px-4 py-3 text-sm">
                    <div className="font-medium">
                      {m.subject || "Contact query"}
                    </div>
                    <div className="mt-1 text-[11px] text-text-muted">
                      {m.name} · {m.email}
                    </div>
                    <div className="mt-1 text-[11px] text-text-muted">
                      {m.category || "general"} ·{" "}
                      {m.role || m.userRole || "role not specified"}
                    </div>
                    {m.createdAt && (
                      <div className="mt-1 text-[11px] text-text-muted">
                        {new Date(m.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        mode="dark"
        context="Superadmin console for School of Computer Applications event roles, access and health."
      />
    </div>
  );
}

export default SuperadminDashboard;
