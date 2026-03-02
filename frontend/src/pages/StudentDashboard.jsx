import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function StudentDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);

  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const tasksSectionRef = useRef(null);

  const navigate = useNavigate();
  const { name, identifier, photoUrl, logout, refreshFromProfile } = useAuth();

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "student") {
      navigate("/portal");
    }
  }, [navigate]);

  const studentIdentifier = (identifier || "").trim().toLowerCase();

  const derivedTasks = (() => {
    if (!events.length || !studentIdentifier) return [];
    const result = [];
    events.forEach((event) => {
      if (!event.students || !event.todos) return;
      const assignedEntries = Object.values(event.students || {}).filter(
        (s) =>
          String(s.identifier || "").trim().toLowerCase() ===
          studentIdentifier
      );
      if (!assignedEntries.length) return;
      Object.entries(event.todos || {}).forEach(([todoId, todo]) => {
        const audience = todo.audience || "students";
        if (audience === "faculty") {
          return;
        }
        result.push({
          _id: `${event.id}::${todoId}`,
          eventId: event.id,
          todoId,
          title: todo.title,
          eventName: event.title,
          completed: !!todo.completed,
          dueDate: event.date || null,
          priority: todo.important ? "high" : "medium",
          assignedTo: identifier
        });
      });
    });
    return result;
  })();

  const uniqueEvents = Array.from(
    new Set(derivedTasks.map((t) => t.eventName).filter(Boolean))
  ).sort();

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const move = (e) => {
      const { clientX, clientY } = e;
      gsap.to(cursor, { x: clientX, y: clientY, duration: 0.08, ease: "power3.out" });
      gsap.to(ring, { x: clientX, y: clientY, duration: 0.18, ease: "power3.out" });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    anime({
      targets: rootRef.current.querySelectorAll(".sd-fade"),
      opacity: [0, 1],
      translateY: [20, 0],
      easing: "easeOutQuad",
      duration: 600,
      delay: anime.stagger(80)
    });
  }, [tasks.length]);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("scaAuthToken");
      const role = localStorage.getItem("scaUserRole");
      if (!token || role !== "student") {
        navigate("/portal");
        return;
      }
      try {
        console.log("[DEBUG] Fetching events for student:", identifier);
        const res = await fetch("/api/events", {
          headers: { Authorization: "Bearer " + token }
        });
        if (res.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("scaAuthToken");
          localStorage.removeItem("scaUserRole");
          localStorage.removeItem("scaUserName");
          localStorage.removeItem("scaUserIdentifier");
          navigate("/portal");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          console.log("[DEBUG] Received events:", data);
          setEvents(Array.isArray(data) ? data : []);
        } else {
          console.error("[DEBUG] Failed to fetch events:", res.status);
          setEvents([]);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate, identifier]);

  useEffect(() => {
    const token = localStorage.getItem("scaAuthToken");
    const role = localStorage.getItem("scaUserRole");
    if (!token || role !== "student") return;
    refreshFromProfile();
  }, [refreshFromProfile]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    const flagKey = "scaUpcomingShown_student";
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
    const upcoming = derivedTasks
      .filter((t) => t.dueDate && !t.completed)
      .map((t) => ({
        ...t,
        dueDateObj: new Date(t.dueDate)
      }))
      .filter((t) => !Number.isNaN(t.dueDateObj.getTime()))
      .filter(
        (t) => t.dueDateObj >= todayStart && t.dueDateObj <= fiveDaysAhead
      )
      .sort((a, b) => a.dueDateObj - b.dueDateObj)
      .slice(0, 5);
    if (upcoming.length) {
      setUpcomingTasks(upcoming);
      setShowUpcomingModal(true);
      sessionStorage.setItem(flagKey, "1");
    }
  }, [loading, derivedTasks]);

  const filteredTasks = derivedTasks.filter((t) => {
    if (selectedEvent !== "all" && t.eventName !== selectedEvent) {
      return false;
    }
    if (filter === "pending") return !t.completed;
    if (filter === "done") return !!t.completed;
    return true;
  });

  const toggleTask = async (eventId, todoId, currentCompleted) => {
    const token = localStorage.getItem("scaAuthToken");
    try {
      const res = await fetch(`/api/events/${eventId}/todos/${todoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ completed: !currentCompleted })
      });
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("scaAuthToken");
        localStorage.removeItem("scaUserRole");
        localStorage.removeItem("scaUserName");
        localStorage.removeItem("scaUserIdentifier");
        navigate("/");
        return;
      }
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      }
    } catch {
    }
  };

  const handleCreate = async () => {};

  const summary = {
    total: derivedTasks.length,
    completed: derivedTasks.filter((t) => t.completed).length
  };

  const eventSummary = (() => {
    if (!derivedTasks.length) {
      return { active: 0, upcoming: 0 };
    }
    const eventsForSummary = uniqueEvents;
    const active = eventsForSummary.length;
    const upcoming = eventsForSummary.filter((name) => {
      const eventTasks = derivedTasks.filter((t) => t.eventName === name);
      if (!eventTasks.length) return false;
      return eventTasks.some((t) => !t.completed);
    }).length;
    return { active, upcoming };
  })();

  const computeDueInfo = (t) => {
    if (!t.dueDate) return null;
    const today = new Date();
    const d = new Date(t.dueDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: "Overdue", urgent: true };
    if (diff === 0) return { text: "Due today", urgent: true };
    return { text: `Due in ${diff} days`, urgent: diff <= 3 };
  };

  const currentIdentifier = identifier || "";
  const displayName = name || "Student";
  const avatarInitial =
    displayName && displayName.trim().length
      ? displayName.trim().charAt(0).toUpperCase()
      : "S";

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

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

  const tasksForDay = (day, year, month) =>
    derivedTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
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

  const selectedDayTasks =
    selectedDate === null
      ? []
      : tasksForDay(
          selectedDate.getDate(),
          selectedDate.getFullYear(),
          selectedDate.getMonth()
        );

  return (
    <div ref={rootRef} className="relative min-h-screen bg-background text-text-main">
      <div
        ref={cursorRef}
        className="cursor-dot fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green"
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed z-[9998] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green/40"
      />

      <nav className="relative z-40 flex items-center justify-between border-b border-black/70 bg-text-main px-8 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-8 w-auto"
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
            Student
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 md:flex">
            <Link to="/about">About</Link>
            <Link to="/team">Team</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border-color bg-white px-2 py-1 text-xs"
            >
              <div className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-full border border-border-color bg-green text-sm font-semibold text-white">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
              </div>
              <div className="hidden flex-col text-left text-[10px] uppercase tracking-[0.18em] text-text-muted sm:flex">
                <span className="truncate">{displayName}</span>
                <span className="truncate">
                  {currentIdentifier || "Student"}
                </span>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-[50] mt-2 w-48 rounded border border-border-color bg-white py-1 text-xs shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/student/profile");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-ivory"
                >
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tasksSectionRef.current) {
                      tasksSectionRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      });
                    }
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-ivory"
                >
                  <span>Events</span>
                  <span className="font-mono text-[9px] uppercase text-text-muted">
                    {summary.completed}/{summary.total}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showUpcomingModal && upcomingTasks.length > 0 && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-border-color bg-white p-6 shadow-xl">
            <h2 className="font-sans font-bold text-lg">Upcoming events</h2>
            <p className="mt-1 text-xs text-text-muted">
              These are your next event tasks for the coming days.
            </p>
            <div className="mt-4 space-y-3">
              {upcomingTasks.map((t) => {
                const label = t.dueDateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
                return (
                  <div
                    key={t._id}
                    className="flex items-start justify-between rounded border border-border-color bg-background px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium">{t.eventName}</div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {t.title}
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono">
                      <div>{label}</div>
                      {t.priority && (
                        <div className="mt-1 rounded bg-white px-2 py-[1px] text-[9px] uppercase tracking-[0.18em]">
                          {t.priority}
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
                onClick={() => setShowUpcomingModal(false)}
                className="rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-8 py-6">
        <section className="sd-fade mb-6 flex flex-col gap-4 rounded border border-border-color bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              My Event Workspace
            </div>
            <div className="mt-1 font-sans font-bold text-xl">
              Tasks for current SCA events
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="font-sans font-bold text-2xl">{summary.total}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Total Tasks
              </div>
            </div>
            <div className="text-right">
              <div className="font-sans font-bold text-2xl">{summary.completed}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Completed
              </div>
            </div>
            <div className="text-right">
              <div className="font-sans font-bold text-2xl">
                {eventSummary.active}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Active Events
              </div>
            </div>
          </div>
        </section>

        <section className="sd-fade mb-6 grid gap-4 md:grid-cols-[260px,1fr]">
          <div className="rounded border border-border-color bg-white p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              Events
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEvent("all")}
                className={`rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${
                  selectedEvent === "all"
                    ? "bg-primary text-white"
                    : "bg-background text-text-muted"
                }`}
              >
                All
              </button>
              {uniqueEvents.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedEvent(name)}
                  className={`rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${
                    selectedEvent === name
                      ? "bg-green text-white"
                      : "bg-background text-text-muted"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-text-muted">
              {eventSummary.active > 0 ? (
                <span>
                  {eventSummary.active} active event
                  {eventSummary.active > 1 ? "s" : ""},{" "}
                  {eventSummary.upcoming} with pending tasks.
                </span>
              ) : (
                <span>No events yet. Your faculty will assign tasks here.</span>
              )}
            </div>
          </div>

          <div className="rounded border border-border-color bg-white p-4 text-xs text-text-muted">
            Tasks are created by faculty or admin for each event.
            <br />
            You can update completion status in the list below, but you cannot
            add new tasks from this dashboard.
          </div>
        </section>

        <section
          ref={tasksSectionRef}
          className="sd-fade rounded border border-border-color bg-white"
        >
          <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
            <h2 className="font-sans font-bold text-lg">
              Event Tasks
              {selectedEvent !== "all" && (
                <span className="ml-2 text-sm font-normal text-text-muted">
                  · {selectedEvent}
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              {["all", "pending", "done"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${
                    filter === f
                      ? "border-ink bg-primary text-white"
                      : "border-border-color text-text-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {loading && (
              <div className="px-4 py-6 text-sm text-text-muted">Loading tasks…</div>
            )}
            {!loading && filteredTasks.length === 0 && (
              <div className="px-4 py-6 text-sm text-text-muted">
                No tasks have been assigned to you yet.
              </div>
            )}
            {!loading &&
              filteredTasks.map((t) => {
                const dueInfo = computeDueInfo(t);
                const canToggle =
                  !t.assignedTo || t.assignedTo === currentIdentifier;
                return (
                  <div
                    key={t._id}
                    className="sd-fade flex items-center gap-4 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (canToggle) {
                          toggleTask(t.eventId, t.todoId, !!t.completed);
                        }
                      }}
                      disabled={!canToggle}
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                        t.completed
                          ? "border-green bg-green"
                          : canToggle
                          ? "border-border-color hover:border-green"
                          : "border-border-color opacity-40"
                      }`}
                    >
                      {t.completed && (
                        <span className="text-[11px] text-white">✓</span>
                      )}
                    </button>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium ${
                          t.completed ? "line-through text-text-muted" : ""
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-text-muted">
                        <span className="font-mono">{t.eventName}</span>
                        {dueInfo && (
                          <span
                            className={`font-mono ${
                              dueInfo.urgent ? "text-red-600" : ""
                            }`}
                          >
                            {dueInfo.text}
                          </span>
                        )}
                        {t.assignedTo && (
                          <span className="font-mono">
                            Assigned to: {t.assignedTo}
                          </span>
                        )}
                        {!canToggle && (
                          <span className="font-mono text-red-600">
                            Not assigned to you
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-mono uppercase ${
                        t.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "low"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.priority || "medium"}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="sd-fade mt-6 rounded border border-border-color bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-bold text-lg">Calendar</h2>
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
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-xs">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={idx} className="h-16 rounded bg-transparent" />;
              }
              const dayTasks = tasksForDay(day, year, month);
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === day;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedDate(new Date(year, month, day))
                  }
                  className={`flex h-16 flex-col items-start justify-between rounded border px-1 py-1 ${
                    dayTasks.length
                      ? "border-green/60 bg-green/5"
                      : "border-border-color bg-background"
                  } ${isSelected ? "ring-1 ring-green" : ""}`}
                >
                  <span className="text-[11px] font-medium">{day}</span>
                  <div className="w-full space-y-0.5 text-left text-[10px]">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div key={t._id} className="truncate font-mono">
                        {t.eventName}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-text-muted">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border-color pt-3 text-xs">
            {selectedDate ? (
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </div>
                {selectedDayTasks.length === 0 ? (
                  <div className="mt-1 text-text-muted">
                    No tasks scheduled for this date.
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {selectedDayTasks.map((t) => (
                      <li
                        key={t._id}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span className="font-mono">{t.eventName}</span>
                        <span className="truncate text-text-muted">{t.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="text-text-muted">
                Select a date to see tasks for that day.
              </div>
            )}
          </div>
        </section>

      </main>
      <SiteFooter
        mode="dark"
        context="Student dashboard for School of Computer Applications event tasks and updates."
      />
    </div>
  );
}

export default StudentDashboard;
