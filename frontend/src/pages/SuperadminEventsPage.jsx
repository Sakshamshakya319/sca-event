import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function SuperadminEventsPage() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { name, identifier, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoImportant, setNewTodoImportant] = useState(false);
  const [newTodoAudience, setNewTodoAudience] = useState("students");

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
    const move = e => {
      const { clientX, clientY } = e;
      gsap.to(cursor, { x: clientX, y: clientY, duration: 0.08 });
      gsap.to(ring, { x: clientX, y: clientY, duration: 0.16 });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

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
    const loadEvents = async () => {
      const token = localStorage.getItem("scaAuthToken");
      if (!token) {
        setLoadingEvents(false);
        return;
      }
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

  const eventsForDay = (day, year, month) =>
    events.filter(e => {
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
    selectedEventId && events.find(e => e.id === selectedEventId);

  const totalEvents = events.length;

  const computeProgress = event => {
    const allTodos = event.todos ? Object.values(event.todos) : [];
    if (!allTodos.length) {
      return { completed: 0, total: 0, percent: 0 };
    }
    const completed = allTodos.filter(t => t.completed).length;
    const total = allTodos.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

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
          <span className="ml-1 text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
            Superadmin
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 md:flex">
            <Link to="/superadmin">Overview</Link>
            <span className="text-white">Events</span>
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
          <div className="font-sans font-bold text-xl">System Events</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Calendar and progress view for all events
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
        </div>
      </header>

      <main className="px-8 py-6">
        <section className="sdm-fade mb-6 grid gap-4 md:grid-cols-[minmax(260px,1.1fr),1.3fr]">
          <div className="rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Event calendar</h2>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
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
                      prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
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
                  const hasImportant =
                    dayEvents.some(e => e.important) ||
                    dayEvents.some(
                      e =>
                        e.todos &&
                        Object.values(e.todos).some(t => t.important)
                    );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const dateObj = new Date(year, month, day);
                        setSelectedDate(dateObj);
                        if (dayEvents.length) {
                          setSelectedEventId(dayEvents[0].id);
                        } else {
                          setSelectedEventId(null);
                        }
                      }}
                      className={`flex h-16 flex-col items-start justify-between rounded border px-1 py-1 ${
                        dayEvents.length
                          ? "border-blue/70 bg-blue/5"
                          : "border-border-color bg-background"
                      }`}
                    >
                      <span className="text-[11px] font-medium">{day}</span>
                      <div className="w-full space-y-0.5 text-left text-[10px]">
                        {dayEvents.slice(0, 2).map(e => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between gap-1"
                          >
                            <span className="truncate">{e.title}</span>
                            {hasImportant && (
                              <span className="rounded bg-gold/10 px-1 py-px text-[8px] font-mono uppercase tracking-[0.18em] text-gold-700">
                                Busy
                              </span>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-text-muted">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">System events</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {totalEvents} total
              </span>
            </div>
            <div className="max-h-[360px] divide-y divide-border overflow-auto text-xs">
              {loadingEvents && (
                <div className="px-4 py-3 text-sm text-text-muted">Loading events…</div>
              )}
              {!loadingEvents && events.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No events have been created yet.
                </div>
              )}
              {!loadingEvents &&
                events.map(e => {
                  const progress = computeProgress(e);
                  const label = e.date
                    ? new Date(e.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "No date";
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEventId(e.id)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                        selectedEventId === e.id ? "bg-background" : "bg-white"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{e.title}</div>
                        <div className="mt-1 text-[11px] text-text-muted">
                          {label} ·{" "}
                          {e.status === "pending"
                            ? "Pending approval"
                            : e.status === "completed"
                            ? "Completed"
                            : "Active"}
                        </div>
                        {e.facultyName && (
                          <div className="mt-1 text-[10px] text-text-muted">
                            Owner: {e.facultyName}{" "}
                            {e.facultyIdentifier && (
                              <span className="font-mono">
                                ({e.facultyIdentifier})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex flex-col items-end">
                        {progress.total > 0 ? (
                          <>
                            <div className="text-[11px] font-mono">
                              {progress.completed}/{progress.total}
                            </div>
                            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded bg-background">
                              <div
                                className="h-full rounded bg-green-500"
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] text-text-muted">
                            No tasks
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
            {selectedEvent && (
              <div className="border-t border-border-color px-4 py-3 text-xs">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  Selected event
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {selectedEvent.title}
                </div>
                <div className="mt-1 text-[11px] text-text-muted">
                  {selectedEvent.description || "No description provided."}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
                  <span>
                    Date:{" "}
                    {selectedEvent.date
                      ? new Date(selectedEvent.date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }
                        )
                      : "Not set"}
                  </span>
                  <span>
                    Status:{" "}
                    {selectedEvent.status === "pending"
                      ? "Pending approval"
                      : selectedEvent.status === "completed"
                      ? "Completed"
                      : "Active"}
                  </span>
                  <span>
                    Tasks:{" "}
                    {computeProgress(selectedEvent).completed}/
                    {computeProgress(selectedEvent).total}
                  </span>
                </div>
                <div className="mt-3 border-t border-border-color pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                      Event to-dos
                    </div>
                  </div>
                  <form
                    onSubmit={async e => {
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
                        setEvents(prev =>
                          prev.map(e =>
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
                      onChange={e => setNewTodoTitle(e.target.value)}
                      className="rounded border border-border-color px-3 py-2 text-sm"
                      placeholder="Add a key preparation task"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newTodoAudience}
                        onChange={e => setNewTodoAudience(e.target.value)}
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
                          onChange={e =>
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
                            <div
                              key={todoId}
                              className={`flex w-full items-center justify-between rounded border px-3 py-2 text-[11px] ${
                                todo.completed
                                  ? "border-green bg-green/5 line-through text-text-muted"
                                  : "border-border-color bg-background"
                              }`}
                            >
                              <button
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
                                    setEvents(prev =>
                                      prev.map(e =>
                                        e.id === updated.id ? updated : e
                                      )
                                    );
                                  } catch {
                                  }
                                }}
                                className="flex flex-1 items-center gap-2 text-left"
                              >
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
                              </button>
                              <div className="flex items-center gap-2">
                                {todo.important && (
                                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-600">
                                    Important
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm("Are you sure you want to delete this task?")) return;
                                    const token = localStorage.getItem("scaAuthToken");
                                    if (!token) return;
                                    try {
                                      const res = await fetch(
                                        `/api/events/${selectedEvent.id}/todos/${todoId}`,
                                        {
                                          method: "DELETE",
                                          headers: {
                                            Authorization: "Bearer " + token
                                          }
                                        }
                                      );
                                      if (!res.ok) {
                                        alert("Failed to delete task");
                                        return;
                                      }
                                      const updated = await res.json();
                                      setEvents(prev =>
                                        prev.map(e =>
                                          e.id === updated.id ? updated : e
                                        )
                                      );
                                    } catch {
                                      alert("Unable to delete task");
                                    }
                                  }}
                                  className="rounded bg-red-600 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
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
            )}
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

export default SuperadminEventsPage;

