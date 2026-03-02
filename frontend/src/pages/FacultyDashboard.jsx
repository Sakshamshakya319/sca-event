import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function FacultyDashboard() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoImportant, setNewTodoImportant] = useState(false);
  const [newTodoAudience, setNewTodoAudience] = useState("students");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventVenue, setNewEventVenue] = useState("");
  const [newEventType, setNewEventType] = useState("academic");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventImportant, setNewEventImportant] = useState(false);
  const [newEventError, setNewEventError] = useState("");
  const [newEventSuccess, setNewEventSuccess] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentIdentifier, setNewStudentIdentifier] = useState("");
  const [studentsDirectory, setStudentsDirectory] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventForm, setEditEventForm] = useState(null);

  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const calendarSectionRef = useRef(null);
  const requestSectionRef = useRef(null);
  const navigate = useNavigate();
  const { name, identifier, photoUrl, logout, refreshFromProfile } = useAuth();

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "faculty") {
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
    if (!rootRef.current) return;
    anime({
      targets: rootRef.current.querySelectorAll(".fd-fade"),
      opacity: [0, 1],
      translateY: [16, 0],
      easing: "easeOutQuad",
      duration: 600,
      delay: anime.stagger(70)
    });
  }, [events.length]);

  useEffect(() => {
    const token = localStorage.getItem("scaAuthToken");
    const role = localStorage.getItem("scaUserRole");
    if (!token || role !== "faculty") return;
    if (typeof window === "undefined") return;
    fetch("/api/events", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
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
        const upcoming = list
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
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("scaAuthToken");
    const role = localStorage.getItem("scaUserRole");
    if (!token || role !== "faculty") return;
    refreshFromProfile();
  }, [refreshFromProfile]);

  useEffect(() => {
    const loadStudents = async () => {
      const token = localStorage.getItem("scaAuthToken");
      const role = localStorage.getItem("scaUserRole");
      if (!token || role !== "faculty") return;
      try {
        const res = await fetch("/api/auth/users?role=student", {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        setStudentsDirectory(Array.isArray(data) ? data : []);
      } catch {
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      const token = localStorage.getItem("scaAuthToken");
      const role = localStorage.getItem("scaUserRole");
      if (!token || role !== "faculty") {
        setLoadingEvents(false);
        return;
      }
      setLoadingEvents(true);
      try {
        const res = await fetch("/api/events", {
          headers: {
            Authorization: "Bearer " + token
          }
        });
        if (!res.ok) {
          setEvents([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const idNorm = String(identifier || "").trim().toLowerCase();
        const nameNorm = String(name || "").trim().toLowerCase();
        const assigned = list.filter((e) => {
          const eventIdNorm = String(e.facultyIdentifier || "")
            .trim()
            .toLowerCase();
          const eventNameNorm = String(e.facultyName || "")
            .trim()
            .toLowerCase();
          if (idNorm && eventIdNorm && idNorm === eventIdNorm) return true;
          if (nameNorm && eventNameNorm && nameNorm === eventNameNorm) {
            return true;
          }
          if (e.createdRole === "faculty") return true;
          return false;
        });
        setEvents(assigned);
        if (!selectedEventId && assigned.length) {
          setSelectedEventId(assigned[0].id);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [identifier, name, selectedEventId]);

  const currentIdentifier = identifier || "";
  const displayName = name || "Faculty";
  const avatarInitial =
    displayName && displayName.trim().length
      ? displayName.trim().charAt(0).toUpperCase()
      : "F";

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

  const today = new Date();
  const upcomingEventsCount = events.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d >= today;
  }).length;

  return (
    <div ref={rootRef} className="relative min-h-screen bg-background text-text-main">
      <div
        ref={cursorRef}
        className="cursor-dot fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue"
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue/40"
      />

      <nav className="relative z-40 flex items-center justify-between border-b border-black/70 bg-text-main px-8 py-4">
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
              <div className="flex h-8 w-8 overflow-hidden items-center justify-center rounded-full border border-border-color bg-blue text-sm font-semibold text-white">
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
                  {currentIdentifier || "Faculty"}
                </span>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-[50] mt-2 w-48 rounded border border-border-color bg-white py-1 text-xs shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/faculty/profile");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-ivory"
                >
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (requestSectionRef.current) {
                      requestSectionRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      });
                    }
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-ivory"
                >
                  <span>Request event</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarSectionRef.current) {
                      calendarSectionRef.current.scrollIntoView({
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
                    {events.length}
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
        <section className="fd-fade mb-6 flex flex-col gap-4 rounded border border-border-color bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              My Assigned Events
            </div>
            <div className="mt-1 font-sans font-bold text-xl">
              Tasks for SCA events you own
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="font-sans font-bold text-2xl">{events.length}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Events Assigned
              </div>
            </div>
            <div className="text-right">
              <div className="font-sans font-bold text-2xl">{upcomingEventsCount}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Upcoming
              </div>
            </div>
          </div>
        </section>

        <section
          ref={requestSectionRef}
          className="fd-fade mb-6 grid gap-4 md:grid-cols-[minmax(260px,1.2fr),minmax(0,1.6fr)]"
        >
          <div className="rounded border border-border-color bg-white p-4 text-xs">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              Request new event
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              Submit a new SCA event proposal. It will be sent to admin for
              approval. Once approved, it appears in all dashboards and calendars.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Event title
                </div>
                <input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="e.g. Hackathon"
                />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Event date
                </div>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Time
                </div>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Venue
                </div>
                <input
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="Where will it be held?"
                />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                Event Category
              </div>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value)}
                className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm text-text-main"
              >
                <option value="academic">Academic / Technical</option>
                <option value="cultural">Cultural / Club</option>
                <option value="career">Career / Placement</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>
            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                Description
              </div>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                placeholder="Short description for admin and students"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] text-text-muted">
                <input
                  type="checkbox"
                  checked={newEventImportant}
                  onChange={(e) => setNewEventImportant(e.target.checked)}
                />
                Mark as important event
              </label>
              <button
                type="button"
                onClick={async () => {
                  setNewEventError("");
                  setNewEventSuccess("");
                  if (!newEventTitle.trim() || !newEventDate) {
                    setNewEventError("Enter event title and date");
                    return;
                  }
                  const token = localStorage.getItem("scaAuthToken");
                  if (!token) {
                    setNewEventError("Not authenticated");
                    return;
                  }
                  try {
                    const body = {
                      title: newEventTitle.trim(),
                      date: newEventDate,
                      time: newEventTime,
                      venue: newEventVenue,
                      eventType: newEventType,
                      facultyName: displayName,
                      facultyIdentifier: currentIdentifier,
                      description: newEventDescription.trim(),
                      important: newEventImportant
                    };
                    const res = await fetch("/api/events", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                      },
                      body: JSON.stringify(body)
                    });
                    if (!res.ok) {
                      let msg = "Could not submit event request";
                      try {
                        const data = await res.json();
                        if (data && data.message) {
                          msg = data.message;
                        }
                      } catch {
                      }
                      setNewEventError(msg);
                      return;
                    }
                    const created = await res.json();
                    setEvents((prev) => [created, ...prev]);
                    setSelectedEventId(created.id);
                    setNewEventTitle("");
                    setNewEventDate("");
                    setNewEventTime("");
                    setNewEventVenue("");
                    setNewEventType("academic");
                    setNewEventDescription("");
                    setNewEventImportant(false);
                    setNewEventSuccess("Event request submitted for approval");
                  } catch {
                    setNewEventError("Unable to reach server");
                  }
                }}
                className="rounded bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Submit request
              </button>
            </div>
            {newEventError && (
              <div className="mt-2 text-[11px] text-red-600">
                {newEventError}
              </div>
            )}
            {newEventSuccess && (
              <div className="mt-2 text-[11px] text-green-700">
                {newEventSuccess}
              </div>
            )}
            <div className="mt-3 text-[10px] text-text-muted">
              Status starts as <span className="font-mono uppercase">pending</span>.
              Admin can approve it from their dashboard.
            </div>
          </div>
          <div className="rounded border border-border-color bg-white p-4 text-xs text-text-muted">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              How approvals work
            </div>
            <ol className="mt-2 space-y-1 text-[11px]">
              <li>1. You submit the event request from this form.</li>
              <li>2. Admin sees it in the events view with status pending.</li>
              <li>3. After approval, it appears as an active event.</li>
              <li>4. You can then manage to-dos and student assignments.</li>
            </ol>
          </div>
        </section>

        <section
          ref={calendarSectionRef}
          className="fd-fade grid gap-4 md:grid-cols-[minmax(260px,1.1fr),1.1fr]"
        >
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
                  const hasImportant =
                    dayEvents.some((e) => e.important) ||
                    dayEvents.some(
                      (e) =>
                        e.todos &&
                        Object.values(e.todos).some((t) => t.important)
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
                        }
                      }}
                      className={`flex h-16 flex-col items-start justify-between rounded border px-1 py-1 ${dayEvents.length
                        ? "border-blue/70 bg-blue/5"
                        : "border-border-color bg-background"
                        }`}
                    >
                      <span className="text-[11px] font-medium">{day}</span>
                      <div className="w-full space-y-0.5 text-left text-[10px]">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div key={e.id} className="truncate font-mono">
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
          </div>

          <div className="rounded border border-border-color bg-white">
            <div className="border-b border-border-color px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Event details & to-dos
              </div>
            </div>
            <div className="px-4 py-3 text-xs">
              {loadingEvents ? (
                <div className="text-[11px] text-text-muted">
                  Loading your assigned events...
                </div>
              ) : !events.length ? (
                <div className="text-[11px] text-text-muted">
                  No events are currently assigned to you.
                </div>
              ) : selectedEvent ? (
                editingEventId === selectedEvent.id ? (
                  <div className="space-y-3">
                    <div className="font-sans font-bold text-base">Edit Event Request</div>
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
                        className="w-full rounded border border-border-color px-3 py-2 text-sm text-text-main"
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
                            } else {
                              alert("Could not update event. Ensure you have permission.");
                            }
                          } catch {
                            alert("Failed to connect to server");
                          }
                        }}
                        className="rounded bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {selectedEvent.createdBy === localStorage.getItem("scaUserId") && (
                      <div className="absolute right-0 top-0 flex gap-2">
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
                      </div>
                    )}
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted pr-16">
                      {new Date(selectedEvent.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                    <div className="mt-1 font-sans font-bold text-base pr-16">
                      {selectedEvent.title}
                    </div>
                    <div className="mt-1 text-[11px] text-text-muted">
                      Assigned as: {selectedEvent.facultyName || displayName} ·{" "}
                      {selectedEvent.facultyIdentifier || currentIdentifier}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedEvent.approved === false ? (
                        <span className="rounded bg-yellow-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-yellow-700">
                          {selectedEvent.status || "Pending"}
                        </span>
                      ) : (
                        <span className="rounded bg-green/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-green-700">
                          Approved
                        </span>
                      )}
                    </div>
                    {selectedEvent.description && (
                      <div className="mt-2 text-[11px] text-text-main/80">
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

                    <div className="mt-3 border-t border-border-color pt-3">
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
                              prev.map((e) => (e.id === updated.id ? updated : e))
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
                            className="rounded bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-primary/90"
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
                                className={`flex w-full items-center justify-between rounded border px-3 py-2 text-[11px] ${todo.completed
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
                                      setEvents((prev) =>
                                        prev.map((e) =>
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
                                        setEvents((prev) =>
                                          prev.map((e) =>
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
                      <div className="mt-4 border-t border-border-color pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                            Assigned students{" "}
                            {selectedEvent.students
                              ? `(${Object.keys(selectedEvent.students).length})`
                              : "(0)"}
                          </div>
                        </div>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newStudentIdentifier.trim()) return;
                            const token = localStorage.getItem("scaAuthToken");
                            if (!token) return;
                            try {
                              const res = await fetch(
                                `/api/events/${selectedEvent.id}/students`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + token
                                  },
                                  body: JSON.stringify({
                                    identifier: newStudentIdentifier.trim(),
                                    name: newStudentName.trim()
                                  })
                                }
                              );
                              if (!res.ok) {
                                alert("Could not assign student to this event.");
                                return;
                              }
                              const updated = await res.json();
                              setEvents((prev) =>
                                prev.map((e) => (e.id === updated.id ? updated : e))
                              );
                              setNewStudentIdentifier("");
                              setNewStudentName("");
                            } catch {
                              alert("Unable to reach server while assigning student.");
                            }
                          }}
                          className="mb-3 grid gap-2 md:grid-cols-[1.5fr,1.5fr,auto]"
                        >
                          <div className="relative">
                            <input
                              value={newStudentIdentifier}
                              onChange={(e) => {
                                setNewStudentIdentifier(e.target.value);
                                setShowStudentSuggestions(true);
                              }}
                              onFocus={() => {
                                if (newStudentIdentifier) {
                                  setShowStudentSuggestions(true);
                                }
                              }}
                              onBlur={() => {
                                setTimeout(
                                  () => setShowStudentSuggestions(false),
                                  120
                                );
                              }}
                              className="w-full rounded border border-border-color px-3 py-2 text-sm"
                              placeholder="Student UID / Reg. No."
                            />
                            {showStudentSuggestions && studentsDirectory.length > 0 && (
                              <div className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded border border-border-color bg-white text-[11px]">
                                {studentsDirectory
                                  .filter((s) => {
                                    const q = newStudentIdentifier.trim().toLowerCase();
                                    if (!q) return true;
                                    const name = String(s.name || "").toLowerCase();
                                    const id = String(s.identifier || "").toLowerCase();
                                    return (
                                      name.includes(q) ||
                                      id.includes(q)
                                    );
                                  })
                                  .slice(0, 8)
                                  .map((s) => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        setNewStudentIdentifier(s.identifier || "");
                                        setNewStudentName(s.name || "");
                                        setShowStudentSuggestions(false);
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-1 hover:bg-ivory"
                                    >
                                      <span className="truncate">
                                        {s.name || "Unnamed"}{" "}
                                        <span className="font-mono text-[10px] text-text-muted">
                                          · {s.identifier}
                                        </span>
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                          <input
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            className="rounded border border-border-color px-3 py-2 text-sm"
                            placeholder="Student name (optional)"
                          />
                          <button
                            type="submit"
                            className="rounded bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-primary/90"
                          >
                            Assign
                          </button>
                        </form>
                        <div className="space-y-1">
                          {selectedEvent.students
                            ? Object.entries(selectedEvent.students).map(
                              ([studentId, stu]) => (
                                <div
                                  key={studentId}
                                  className="flex items-center justify-between rounded border border-border-color bg-background px-3 py-2 text-[11px]"
                                >
                                  <div>
                                    <div className="font-sans font-bold text-[12px]">
                                      {stu.name || "Unnamed student"}
                                    </div>
                                    <div className="mt-0.5 font-mono text-[11px]">
                                      {stu.identifier}
                                    </div>
                                    {stu.assignedAt && (
                                      <div className="mt-0.5 text-[10px] text-text-muted">
                                        Assigned on{" "}
                                        {new Date(stu.assignedAt).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted">
                                      {stu.assignedRole || "assigned"}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const token =
                                          localStorage.getItem("scaAuthToken");
                                        if (!token) return;
                                        try {
                                          const res = await fetch(
                                            `/api/events/${selectedEvent.id}/students/${studentId}`,
                                            {
                                              method: "DELETE",
                                              headers: {
                                                Authorization: "Bearer " + token
                                              }
                                            }
                                          );
                                          if (!res.ok) {
                                            alert(
                                              "Could not remove this student from the event."
                                            );
                                            return;
                                          }
                                          const updated = await res.json();
                                          setEvents((prev) =>
                                            prev.map((e) =>
                                              e.id === updated.id ? updated : e
                                            )
                                          );
                                        } catch {
                                          alert(
                                            "Unable to reach server while removing student."
                                          );
                                        }
                                      }}
                                      className="rounded bg-red-600 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )
                            )
                            : (
                              <div className="text-[11px] text-text-muted">
                                No students assigned yet.
                              </div>
                            )}
                        </div>
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
      </main>
      <SiteFooter
        mode="dark"
        context="Faculty view of assigned SCA events and shared event to-dos."
      />
    </div>
  );
}

export default FacultyDashboard;
