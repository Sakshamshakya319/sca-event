import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function AdminDashboard() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: "", identifier: "" });
  const [studentForm, setStudentForm] = useState({ name: "", identifier: "" });
  const [facultyError, setFacultyError] = useState("");
  const [studentError, setStudentError] = useState("");
  const [facultySuccess, setFacultySuccess] = useState("");
  const [studentSuccess, setStudentSuccess] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    eventType: "academic",
    expectedAudience: "students",
    facultyName: "",
    facultyIdentifier: "",
    description: "",
    important: false
  });
  const [eventError, setEventError] = useState("");
  const [eventSuccess, setEventSuccess] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoImportant, setNewTodoImportant] = useState(false);
  const [newTodoAudience, setNewTodoAudience] = useState("students");
  const [facultySuggestionsOpen, setFacultySuggestionsOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventForm, setEditEventForm] = useState(null);

  const handleDeleteUser = async (roleKey, id) => {
    const token = localStorage.getItem("scaAuthToken");
    if (!token) return;
    const confirmed = window.confirm("Are you sure you want to delete this account?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/auth/users/${roleKey}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
        navigate("/portal");
        return;
      }
      if (!res.ok && res.status !== 204) {
        let msg = "Could not delete account";
        try {
          const body = await res.json();
          if (body && body.message) {
            msg = body.message;
          }
        } catch {
        }
        alert(msg);
        return;
      }
      if (roleKey === "faculty") {
        setFacultyUsers((prev) => prev.filter((u) => u.id !== id));
      } else if (roleKey === "student") {
        setStudentUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch {
      alert("Unable to delete account");
    }
  };
  const { logout } = useAuth();

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "admin") {
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

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

  const loadRoleUsers = async (role) => {
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

  useEffect(() => {
    if (activeTab === "faculty") {
      loadRoleUsers("faculty");
    } else if (activeTab === "students") {
      loadRoleUsers("student");
    }
  }, [activeTab]);

  useEffect(() => {
    loadRoleUsers("faculty");
  }, []);

  const handleCreateFaculty = async () => {
    setFacultyError("");
    setFacultySuccess("");
    if (!facultyForm.identifier.trim()) {
      setFacultyError("Enter faculty UID or email");
      return;
    }
    const token = localStorage.getItem("scaAuthToken");
    if (!token) {
      setFacultyError("Not authenticated");
      return;
    }
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          role: "faculty",
          name: facultyForm.name,
          identifier: facultyForm.identifier
        })
      });
      if (!res.ok) {
        let msg = "Could not create faculty account";
        try {
          const body = await res.json();
          if (body && body.message) {
            msg = body.message;
          }
        } catch {
        }
        setFacultyError(msg);
        return;
      }
      const data = await res.json();
      setFacultyUsers((prev) => [data, ...prev]);
      setFacultyForm({ name: "", identifier: "" });
      setFacultySuccess("Account created. Share the generated password.");
    } catch {
      setFacultyError("Unable to reach server");
    }
  };

  const handleCreateStudent = async () => {
    setStudentError("");
    setStudentSuccess("");
    if (!studentForm.identifier.trim()) {
      setStudentError("Enter student UID");
      return;
    }
    const token = localStorage.getItem("scaAuthToken");
    if (!token) {
      setStudentError("Not authenticated");
      return;
    }
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          role: "student",
          name: studentForm.name,
          identifier: studentForm.identifier
        })
      });
      if (!res.ok) {
        let msg = "Could not create student account";
        try {
          const body = await res.json();
          if (body && body.message) {
            msg = body.message;
          }
        } catch {
        }
        setStudentError(msg);
        return;
      }
      const data = await res.json();
      setStudentUsers((prev) => [data, ...prev]);
      setStudentForm({ name: "", identifier: "" });
      setStudentSuccess("Account created. Share the generated password.");
    } catch {
      setStudentError("Unable to reach server");
    }
  };

  useEffect(() => {
    if (!rootRef.current) return;
    anime({
      targets: rootRef.current.querySelectorAll(".ad-fade"),
      opacity: [0, 1],
      translateY: [18, 0],
      easing: "easeOutQuad",
      duration: 600,
      delay: anime.stagger(80)
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

  const loadEvents = async () => {
    const token = localStorage.getItem("scaAuthToken");
    if (!token) return;
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
      }
    } catch {
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (!events.length) return;
    if (typeof window === "undefined") return;
    const flagKey = "scaUpcomingShown_admin";
    if (sessionStorage.getItem(flagKey)) return;
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
      .filter(
        (e) => e.dateObj >= todayStart && e.dateObj <= fiveDaysAhead
      )
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 5);
    if (upcoming.length) {
      setEventNotifications(upcoming);
      setShowNotifications(true);
      sessionStorage.setItem(flagKey, "1");
    }
  }, [events]);

  useEffect(() => {
    if (activeTab === "overview") {
      loadEvents();
    }
  }, [activeTab]);

  const pendingEvents = events.filter((e) => e.status === "pending");

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i += 1) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      days.push(d);
    }
    return { days, year, month };
  };

  const eventsForDay = (day, year, month) =>
    events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

  const { days, year, month } = getCalendarDays();
  const monthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  const selectedEvent =
    selectedEventId && events.find((e) => e.id === selectedEventId);

  const importantTodos = events.flatMap((e) => {
    if (!e.todos) return [];
    return Object.entries(e.todos)
      .filter(([, todo]) => todo.important && !todo.completed)
      .map(([id, todo]) => ({
        id,
        eventId: e.id,
        eventTitle: e.title,
        date: e.date,
        ...todo
      }));
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

      <header className="flex items-center justify-between border-b border-border-color bg-white px-8 py-4">
        <div>
          <div className="font-sans font-bold text-xl">Admin Dashboard</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Central events control · SCA EMS
          </div>
        </div>
        <div className="ad-fade flex gap-6">
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">{events.length}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Total Events
            </div>
          </div>
          <div className="text-right">
            <div className="font-sans font-bold text-2xl">
              {pendingEvents.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Pending Approvals
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border-color bg-white px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-2 ${activeTab === "overview"
                ? "border-b-2 border-primary text-text-main"
                : ""
                }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faculty")}
              className={`pb-2 ${activeTab === "faculty"
                ? "border-b-2 border-primary text-text-main"
                : ""
                }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`pb-2 ${activeTab === "students"
                ? "border-b-2 border-primary text-text-main"
                : ""
                }`}
            >
              Students
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="pb-2"
            >
              Events page
            </button>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-border-color px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em]"
          >
            Logout
          </button>
        </div>
      </nav>

      {showNotifications && eventNotifications.length > 0 && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-border-color bg-white p-6 shadow-xl">
            <h2 className="font-sans font-bold text-lg">Upcoming events</h2>
            <p className="mt-1 text-xs text-text-muted">
              Events scheduled in the next 5 days.
            </p>
            <div className="mt-4 space-y-3">
              {eventNotifications.map((e) => {
                const label = e.dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
                return (
                  <div
                    key={e.id}
                    className="flex items-start justify-between rounded border border-border-color bg-background px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium">{e.title}</div>
                      {e.description && (
                        <div className="mt-1 text-[11px] text-text-muted">
                          {e.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] font-mono">
                      <div>{label}</div>
                      {e.facultyName && (
                        <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-text-muted">
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
        {activeTab === "overview" && (
          <>
            <section className="ad-fade mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded border border-border-color bg-white p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Active Faculty
                </div>
                <div className="mt-1 font-sans font-bold text-2xl">9</div>
              </div>
              <div className="rounded border border-border-color bg-white p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Students Assigned
                </div>
                <div className="mt-1 font-sans font-bold text-2xl">47</div>
              </div>
              <div className="rounded border border-border-color bg-white p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Tasks Completed
                </div>
                <div className="mt-1 font-sans font-bold text-2xl">134</div>
              </div>
            </section>

            <section className="ad-fade rounded border border-border-color bg-white">
              <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
                <h2 className="font-sans font-bold text-lg">Approval Queue</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Superadmin can override
                </span>
              </div>
              <div className="divide-y divide-border">
                {pendingEvents.length === 0 && (
                  <div className="px-4 py-3 text-sm text-text-muted">
                    No events are waiting for approval.
                  </div>
                )}
                {pendingEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        Requested by{" "}
                        {e.facultyName || "Faculty"} ·{" "}
                        {e.facultyIdentifier || "No UID"}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const token =
                            localStorage.getItem("scaAuthToken");
                          if (!token) return;
                          try {
                            const res = await fetch(
                              `/api/events/${e.id}/status`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: "Bearer " + token
                                },
                                body: JSON.stringify({ status: "approved" })
                              }
                            );
                            if (!res.ok) return;
                            const updated = await res.json();
                            setEvents((prev) =>
                              prev.map((ev) =>
                                ev.id === updated.id ? updated : ev
                              )
                            );
                          } catch {
                          }
                        }}
                        className="rounded border border-green-600 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-green-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const token =
                            localStorage.getItem("scaAuthToken");
                          if (!token) return;
                          try {
                            const res = await fetch(
                              `/api/events/${e.id}/status`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: "Bearer " + token
                                },
                                body: JSON.stringify({ status: "rejected" })
                              }
                            );
                            if (!res.ok) return;
                            const updated = await res.json();
                            setEvents((prev) =>
                              prev.map((ev) =>
                                ev.id === updated.id ? updated : ev
                              )
                            );
                          } catch {
                          }
                        }}
                        className="rounded border border-red-600 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="ad-fade mt-6 grid gap-4 md:grid-cols-[1.4fr,1.6fr]">
              <div className="rounded border border-border-color bg-white">
                <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
                  <div>
                    <h2 className="font-sans font-bold text-lg">Event planner</h2>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Assign faculty and track key SCA events.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadEvents}
                    className="rounded border border-border-color px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]"
                  >
                    Refresh
                  </button>
                </div>
                <div className="border-b border-border-color px-4 py-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Event title
                      </div>
                      <input
                        value={eventForm.title}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            title: e.target.value
                          }))
                        }
                        className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                        placeholder="e.g. Cultural Night"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Event date
                      </div>
                      <input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            date: e.target.value
                          }))
                        }
                        className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Event Category
                      </div>
                      <select
                        value={eventForm.eventType}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            eventType: e.target.value
                          }))
                        }
                        className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      >
                        <option value="academic">Academic / Technical</option>
                        <option value="cultural">Cultural / Club</option>
                        <option value="career">Career / Placement</option>
                        <option value="administrative">Administrative</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Faculty Owner
                      </div>
                      <div className="relative">
                        <input
                          value={eventForm.facultyName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEventForm((prev) => ({
                              ...prev,
                              facultyName: value,
                              // clear ID if they start typing manually to enforce selection
                              facultyIdentifier: ""
                            }));
                            setFacultySuggestionsOpen(true);
                          }}
                          onFocus={() => setFacultySuggestionsOpen(true)}
                          className={`mt-1 w-full rounded border px-3 py-2 text-sm ${eventForm.facultyIdentifier ? 'border-primary bg-primary/5' : 'border-border-color'}`}
                          placeholder="Search faculty name..."
                        />
                        {eventForm.facultyIdentifier && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-primary">
                            ✓ {eventForm.facultyIdentifier}
                          </div>
                        )}
                        {facultySuggestionsOpen &&
                          eventForm.facultyName.trim() &&
                          facultyUsers.length > 0 && (
                            <div className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded border border-border-color bg-white text-xs shadow">
                              {facultyUsers
                                .filter((u) => {
                                  const q = eventForm.facultyName
                                    .toLowerCase()
                                    .trim();
                                  const name = (u.name || "").toLowerCase();
                                  const id = (u.identifier || "").toLowerCase();
                                  return (
                                    name.includes(q) || id.includes(q)
                                  );
                                })
                                .slice(0, 6)
                                .map((u) => (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => {
                                      setEventForm((prev) => ({
                                        ...prev,
                                        facultyName: u.name || u.identifier || "",
                                        facultyIdentifier: u.identifier || ""
                                      }));
                                      setFacultySuggestionsOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                                  >
                                    <span className="truncate">
                                      {u.name || "Unnamed faculty"}
                                    </span>
                                    <span className="ml-2 font-mono text-[10px] text-text-muted">
                                      {u.identifier}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          )}
                      </div>
                      <div className="mt-1 text-[9px] text-text-muted">
                        Must select from suggestions to link account
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Time
                      </div>
                      <input
                        type="time"
                        value={eventForm.time}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            time: e.target.value
                          }))
                        }
                        className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Venue
                      </div>
                      <input
                        value={eventForm.venue}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            venue: e.target.value
                          }))
                        }
                        className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                        placeholder="e.g. Baldev Raj Mittal Auditorium"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[2fr,auto]">
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      rows={2}
                      className="w-full rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="Short description and expectations"
                    />
                    <div className="flex flex-col items-end justify-between gap-2">
                      <label className="flex items-center gap-2 text-[11px] text-text-muted">
                        <input
                          type="checkbox"
                          checked={eventForm.important}
                          onChange={(e) =>
                            setEventForm((prev) => ({
                              ...prev,
                              important: e.target.checked
                            }))
                          }
                        />
                        Mark as important event
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          setEventError("");
                          setEventSuccess("");
                          if (!eventForm.title.trim() || !eventForm.date) {
                            setEventError("Enter event title and date");
                            return;
                          }
                          const token = localStorage.getItem("scaAuthToken");
                          if (!token) {
                            setEventError("Not authenticated");
                            return;
                          }
                          try {
                            const res = await fetch("/api/events", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token
                              },
                              body: JSON.stringify(eventForm)
                            });
                            if (!res.ok) {
                              let msg = "Could not create event";
                              try {
                                const body = await res.json();
                                if (body && body.message) {
                                  msg = body.message;
                                }
                              } catch {
                              }
                              if (res.status === 404 || msg === "Not found") {
                                msg =
                                  "Events API is not available. Please restart the backend server so /api/events is enabled.";
                              }
                              setEventError(msg);
                              return;
                            }
                            const created = await res.json();
                            setEvents((prev) => [created, ...prev]);
                            setEventForm({
                              title: "",
                              date: "",
                              time: "",
                              venue: "",
                              eventType: "academic",
                              expectedAudience: "students",
                              facultyName: "",
                              facultyIdentifier: "",
                              description: "",
                              important: false
                            });
                            setEventSuccess("Event created successfully");
                          } catch {
                            setEventError("Unable to reach server");
                          }
                        }}
                        className="rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                      >
                        Add event
                      </button>
                    </div>
                  </div>
                  {eventError && (
                    <div className="mt-2 text-xs text-red-600">
                      {eventError}
                    </div>
                  )}
                  {eventSuccess && (
                    <div className="mt-2 text-xs text-green-700">
                      {eventSuccess}
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 text-xs text-text-muted">
                  Assignments are informational: faculty still manage their own
                  student tasks from their dashboard. Event to-dos marked as
                  Important appear in the Important Tasks widget.
                </div>
              </div>

              <div className="rounded border border-border-color bg-white">
                <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
                  <h2 className="font-sans font-bold text-lg">Event calendar</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                      }
                      className="rounded border border-border-color px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em]"
                    >
                      Prev
                    </button>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                      {monthLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                        )
                      }
                      className="rounded border border-border-color px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em]"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-3 pt-2">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1 text-xs">
                    {days.map((day, idx) => {
                      if (day === null) {
                        return (
                          <div key={idx} className="h-16 rounded bg-transparent" />
                        );
                      }
                      const dayEvents = eventsForDay(day, year, month);
                      const hasImportant = dayEvents.some((e) => e.important);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (dayEvents.length) {
                              setSelectedEventId(dayEvents[0].id);
                            }
                          }}
                          className={`flex h-16 flex-col items-start justify-between rounded border px-1 py-1 ${dayEvents.length
                            ? "border-gold/70 bg-gold/5"
                            : "border-border-color bg-background"
                            }`}
                        >
                          <span className="text-[11px] font-medium">{day}</span>
                          <div className="w-full space-y-0.5 text-left text-[10px]">
                            {dayEvents.slice(0, 2).map((e) => (
                              <div
                                key={e.id}
                                className="truncate font-mono"
                              >
                                {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[9px] text-text-muted">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                            {hasImportant && (
                              <div className="text-[9px] text-red-600">
                                Important
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-border-color px-4 py-3 text-xs relative">
                  {selectedEvent ? (
                    editingEventId === selectedEvent.id ? (
                      <div className="space-y-3">
                        <div className="font-sans font-bold text-base">Edit Event</div>
                        <input
                          value={editEventForm.title}
                          onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                          className="w-full rounded border border-border-color px-3 py-2 text-sm"
                          placeholder="Event Title"
                        />
                        <div className="grid gap-2 grid-cols-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Date</div>
                            <input
                              type="date"
                              value={editEventForm.date}
                              onChange={(e) => setEditEventForm({ ...editEventForm, date: e.target.value })}
                              className="w-full rounded border border-border-color px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Time</div>
                            <input
                              type="time"
                              value={editEventForm.time}
                              onChange={(e) => setEditEventForm({ ...editEventForm, time: e.target.value })}
                              className="w-full rounded border border-border-color px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2 grid-cols-2">
                          <input
                            value={editEventForm.venue}
                            onChange={(e) => setEditEventForm({ ...editEventForm, venue: e.target.value })}
                            className="w-full rounded border border-border-color px-3 py-2 text-sm"
                            placeholder="Venue"
                          />
                          <select
                            value={editEventForm.eventType}
                            onChange={(e) => setEditEventForm({ ...editEventForm, eventType: e.target.value })}
                            className="w-full rounded border border-border-color px-3 py-2 text-sm"
                          >
                            <option value="academic">Academic / Technical</option>
                            <option value="cultural">Cultural / Club</option>
                            <option value="career">Career / Placement</option>
                            <option value="administrative">Administrative</option>
                          </select>
                        </div>

                        <textarea
                          value={editEventForm.description}
                          onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                          rows={2}
                          className="w-full rounded border border-border-color px-3 py-2 text-sm"
                          placeholder="Short description"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="rounded border border-border-color px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!editEventForm.title.trim() || !editEventForm.date) return;
                              const token = localStorage.getItem("scaAuthToken");
                              try {
                                const res = await fetch(`/api/events/${selectedEvent.id}`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + token
                                  },
                                  body: JSON.stringify(editEventForm)
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
                                  setEditingEventId(null);
                                }
                              } catch { }
                            }}
                            className="rounded bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="absolute right-4 top-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEventId(selectedEvent.id);
                              setEditEventForm({
                                title: selectedEvent.title || "",
                                date: selectedEvent.date ? new Date(selectedEvent.date).toISOString().split('T')[0] : "",
                                time: selectedEvent.time || "",
                                venue: selectedEvent.venue || "",
                                eventType: selectedEvent.eventType || "academic",
                                description: selectedEvent.description || ""
                              });
                            }}
                            className="rounded text-primary border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] hover:bg-primary/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
                              const token = localStorage.getItem("scaAuthToken");
                              try {
                                const res = await fetch(`/api/events/${selectedEvent.id}`, {
                                  method: "DELETE",
                                  headers: { Authorization: "Bearer " + token }
                                });
                                if (res.ok || res.status === 204) {
                                  setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
                                  setSelectedEventId(null);
                                }
                              } catch { }
                            }}
                            className="rounded text-red-600 border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted pr-24">
                          {new Date(selectedEvent.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                        <div className="mt-1 font-sans font-bold text-base">
                          {selectedEvent.title}
                        </div>
                        <div className="mt-1 text-[11px] text-text-muted">
                          Faculty: {selectedEvent.facultyName || "Not specified"} ·{" "}
                          {selectedEvent.facultyIdentifier || "No UID"}
                        </div>
                        {selectedEvent.description && (
                          <div className="mt-2 text-[11px]">
                            {selectedEvent.description}
                          </div>
                        )}

                        {(selectedEvent.venue || selectedEvent.time) && (
                          <div className="mt-3 flex gap-4 border-l-2 border-primary/30 pl-3">
                            {selectedEvent.time && (
                              <div>
                                <span className="block text-[9px] uppercase tracking-widest text-text-muted">Time</span>
                                <span className="font-mono text-sm">{selectedEvent.time}</span>
                              </div>
                            )}
                            {selectedEvent.venue && (
                              <div>
                                <span className="block text-[9px] uppercase tracking-widest text-text-muted">Venue</span>
                                <span className="font-medium text-sm">{selectedEvent.venue}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 border-t border-border-color pt-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                              Event to-dos
                            </div>
                          </div>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!newTodoTitle.trim()) return;
                              const token = localStorage.getItem("scaAuthToken");
                              if (!token) return;
                              try {
                                const res = await fetch(
                                  `/api/events/${selectedEvent.id}/todos`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: "Bearer " + token
                                    },
                                    body: JSON.stringify({
                                      title: newTodoTitle.trim(),
                                      important: newTodoImportant,
                                      audience: newTodoAudience
                                    })
                                  }
                                );
                                if (!res.ok) return;
                                const updated = await res.json();
                                setEvents((prev) =>
                                  prev.map((e) =>
                                    e.id === updated.id ? updated : e
                                  )
                                );
                                setNewTodoTitle("");
                                setNewTodoImportant(false);
                                setNewTodoAudience("students");
                              } catch {
                              }
                            }}
                            className="mb-3 grid gap-2 md:grid-cols-[2fr,auto]"
                          >
                            <input
                              value={newTodoTitle}
                              onChange={(e) => setNewTodoTitle(e.target.value)}
                              className="rounded border border-border-color px-3 py-2 text-sm"
                              placeholder="Add a key preparation task"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={newTodoAudience}
                                onChange={(e) => setNewTodoAudience(e.target.value)}
                                className="rounded border border-border-color px-2 py-2 text-[11px]"
                              >
                                <option value="students">For students</option>
                                <option value="faculty">For faculty</option>
                                <option value="all">For all</option>
                              </select>
                              <label className="flex items-center gap-1 text-[11px] text-text-muted">
                                <input
                                  type="checkbox"
                                  checked={newTodoImportant}
                                  onChange={(e) =>
                                    setNewTodoImportant(e.target.checked)
                                  }
                                />
                                Important
                              </label>
                              <button
                                type="submit"
                                className="rounded bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-main"
                              >
                                Add
                              </button>
                            </div>
                          </form>
                          <div className="space-y-1">
                            {selectedEvent.todos
                              ? Object.entries(selectedEvent.todos).map(
                                ([todoId, todo]) => (
                                  <button
                                    key={todoId}
                                    type="button"
                                    onClick={async () => {
                                      const token =
                                        localStorage.getItem("scaAuthToken");
                                      if (!token) return;
                                      try {
                                        const res = await fetch(
                                          `/api/events/${selectedEvent.id}/todos/${todoId}`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type": "application/json",
                                              Authorization: "Bearer " + token
                                            },
                                            body: JSON.stringify({
                                              completed: !todo.completed
                                            })
                                          }
                                        );
                                        if (!res.ok) return;
                                        const updated = await res.json();
                                        setEvents((prev) =>
                                          prev.map((e) =>
                                            e.id === updated.id ? updated : e
                                          )
                                        );
                                      } catch {
                                      }
                                    }}
                                    className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left text-[11px] ${todo.completed
                                      ? "border-green bg-green/5 line-through text-text-muted"
                                      : "border-border-color bg-background"
                                      }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{todo.title}</span>
                                      {todo.audience === "students" && (
                                        <span className="rounded bg-green/10 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-green-700">
                                          Students
                                        </span>
                                      )}
                                      {todo.audience === "faculty" && (
                                        <span className="rounded bg-ink/5 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-text-main">
                                          Faculty
                                        </span>
                                      )}
                                      {todo.audience === "all" && (
                                        <span className="rounded bg-gold/10 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-primary">
                                          All
                                        </span>
                                      )}
                                    </div>
                                    {todo.important && (
                                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-600">
                                        Important
                                      </span>
                                    )}
                                  </button>
                                )
                              )
                              : (
                                <div className="text-[11px] text-text-muted">
                                  No tasks added yet.
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-[11px] text-text-muted">
                      Select a date with events to see details and to-dos.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="ad-fade mt-6 rounded border border-border-color bg-white">
              <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
                <h2 className="font-sans font-bold text-lg">Important tasks</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Marked as important across all events
                </span>
              </div>
              <div className="divide-y divide-border">
                {loadingEvents && (
                  <div className="px-4 py-3 text-sm text-text-muted">
                    Loading events…
                  </div>
                )}
                {!loadingEvents && importantTodos.length === 0 && (
                  <div className="px-4 py-3 text-sm text-text-muted">
                    No important tasks are pending.
                  </div>
                )}
                {!loadingEvents &&
                  importantTodos.map((t) => {
                    const label = t.date
                      ? new Date(t.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                      : null;
                    return (
                      <div
                        key={`${t.eventId}-${t.id}`}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="mt-1 text-[11px] text-text-muted">
                            {t.eventTitle}
                            {label ? ` · ${label}` : ""}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const token =
                              localStorage.getItem("scaAuthToken");
                            if (!token) return;
                            try {
                              const res = await fetch(
                                `/api/events/${t.eventId}/todos/${t.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + token
                                  },
                                  body: JSON.stringify({ completed: true })
                                }
                              );
                              if (!res.ok) return;
                              const updated = await res.json();
                              setEvents((prev) =>
                                prev.map((e) =>
                                  e.id === updated.id ? updated : e
                                )
                              );
                            } catch {
                            }
                          }}
                          className="rounded border border-green-600 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-green-700"
                        >
                          Mark done
                        </button>
                      </div>
                    );
                  })}
              </div>
            </section>

            <section className="ad-fade mt-6 rounded border border-border-color bg-white">
              <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
                <h2 className="font-sans font-bold text-lg">Latest contact queries</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  From Contact page · Admin & Superadmin
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
                  contactMessages.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {m.subject || "Contact query"}
                        </div>
                        <div className="mt-1 text-[11px] text-text-muted">
                          {m.name} · {m.email}
                        </div>
                        <div className="mt-1 text-[11px] text-text-muted">
                          {m.category || "general"} ·{" "}
                          {m.role || m.userRole || "role not specified"}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-text-muted">
                        {m.createdAt && (
                          <div>
                            {new Date(m.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "faculty" && (
          <section className="ad-fade rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Faculty accounts</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Create login with UID and random password
              </span>
            </div>
            <div className="border-b border-border-color px-4 py-3">
              <div className="grid gap-3 md:grid-cols-[1.5fr,1.5fr,auto]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Faculty name
                  </div>
                  <input
                    value={facultyForm.name}
                    onChange={(e) =>
                      setFacultyForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="Dr. Faculty Name"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Faculty UID / Login ID
                  </div>
                  <input
                    value={facultyForm.identifier}
                    onChange={(e) =>
                      setFacultyForm((prev) => ({
                        ...prev,
                        identifier: e.target.value
                      }))
                    }
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="e.g. FAC12345"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleCreateFaculty}
                    className="w-full rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Create account
                  </button>
                </div>
              </div>
              {facultyError && (
                <div className="mt-2 text-xs text-red-600">{facultyError}</div>
              )}
              {facultySuccess && (
                <div className="mt-2 text-xs text-green-700">
                  {facultySuccess}
                </div>
              )}
            </div>
            <div className="divide-y divide-border">
              {loadingFaculty && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Loading faculty accounts…
                </div>
              )}
              {!loadingFaculty && facultyUsers.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No faculty accounts yet.
                </div>
              )}
              {!loadingFaculty &&
                facultyUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {u.name || "Faculty"}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {u.identifier}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right text-[11px] text-text-muted">
                      <div>
                        <div className="font-mono uppercase tracking-[0.18em]">
                          {u.role}
                        </div>
                        {u.password && (
                          <div className="mt-1">
                            <span className="rounded bg-background px-2 py-[2px] font-mono text-[11px]">
                              {u.password}
                            </span>
                          </div>
                        )}
                      </div>
                      {u.password ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser("faculty", u.id)}
                          className="rounded border border-red-300 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === "students" && (
          <section className="ad-fade rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Student accounts</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Create login with UID and random password
              </span>
            </div>
            <div className="border-b border-border-color px-4 py-3">
              <div className="grid gap-3 md:grid-cols-[1.5fr,1.5fr,auto]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Student name
                  </div>
                  <input
                    value={studentForm.name}
                    onChange={(e) =>
                      setStudentForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="Student full name"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Student UID / Reg. No.
                  </div>
                  <input
                    value={studentForm.identifier}
                    onChange={(e) =>
                      setStudentForm((prev) => ({
                        ...prev,
                        identifier: e.target.value
                      }))
                    }
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="e.g. 12502712"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleCreateStudent}
                    className="w-full rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Create account
                  </button>
                </div>
              </div>
              {studentError && (
                <div className="mt-2 text-xs text-red-600">{studentError}</div>
              )}
              {studentSuccess && (
                <div className="mt-2 text-xs text-green-700">
                  {studentSuccess}
                </div>
              )}
            </div>
            <div className="divide-y divide-border">
              {loadingStudents && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Loading student accounts…
                </div>
              )}
              {!loadingStudents && studentUsers.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No student accounts yet.
                </div>
              )}
              {!loadingStudents &&
                studentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {u.name || "Student"}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {u.identifier}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right text-[11px] text-text-muted">
                      <div>
                        <div className="font-mono uppercase tracking-[0.18em]">
                          {u.role}
                        </div>
                        {u.password && (
                          <div className="mt-1">
                            <span className="rounded bg-background px-2 py-[2px] font-mono text-[11px]">
                              {u.password}
                            </span>
                          </div>
                        )}
                      </div>
                      {u.password ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser("student", u.id)}
                          className="rounded border border-red-300 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter
        mode="dark"
        context="Admin overview for School of Computer Applications events, approvals and queries."
      />
    </div>
  );
}

export default AdminDashboard;
