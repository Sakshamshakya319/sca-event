import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";

function AdminEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("scaUserRole");
    const token = localStorage.getItem("scaAuthToken");
    if (!token || role !== "admin") {
      navigate("/portal");
      return;
    }
    const load = async () => {
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
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const categorize = (list) => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const upcoming = [];
    const ongoing = [];
    const completed = [];
    list.forEach((e) => {
      if (!e.date) {
        upcoming.push(e);
        return;
      }
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) {
        upcoming.push(e);
        return;
      }
      const allTodos = e.todos ? Object.values(e.todos) : [];
      const completedTodos = allTodos.filter((t) => t.completed).length;
      const totalTodos = allTodos.length;
      const isCompleted =
        e.status === "completed" ||
        (totalTodos > 0 && completedTodos === totalTodos && d < todayStart);
      if (isCompleted) {
        completed.push(e);
      } else if (d >= todayStart) {
        ongoing.push(e);
      } else {
        upcoming.push(e);
      }
    });
    return { upcoming, ongoing, completed };
  };

  const { upcoming, ongoing, completed } = categorize(events);

  const card = (e, onSelect) => {
    const allTodos = e.todos ? Object.values(e.todos) : [];
    const completedTodos = allTodos.filter((t) => t.completed).length;
    const totalTodos = allTodos.length || 1;
    const progress = Math.round((completedTodos / totalTodos) * 100);
    return (
      <button
        type="button"
        onClick={() => onSelect && onSelect(e)}
        className="w-full text-left rounded border border-border-color bg-white p-4 text-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-sans font-bold text-base">{e.title}</div>
            <div className="mt-1 text-[11px] text-text-muted">
              {e.date &&
                new Date(e.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
            </div>
          </div>
          <div className="text-right text-[11px] text-text-muted">
            <div className="font-mono uppercase tracking-[0.18em]">
              {e.status || "pending"}
            </div>
            {e.important && (
              <div className="mt-1 rounded bg-background px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.18em] text-red-600">
                Important
              </div>
            )}
          </div>
        </div>
        {e.facultyName && (
          <div className="mt-1 text-[11px] text-text-muted">
            Faculty: {e.facultyName} · {e.facultyIdentifier || "No UID"}
          </div>
        )}
        {e.description && (
          <div className="mt-2 text-[11px] text-text-muted">{e.description}</div>
        )}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>To-do progress</span>
            <span className="font-mono">
              {completedTodos}/{totalTodos} · {progress}%
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-border">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-main">
      <header className="flex items-center justify-between border-b border-border-color bg-white px-8 py-4">
        <div>
          <div className="font-sans font-bold text-xl">Admin Events</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Overview of all SCA EMS events
          </div>
        </div>
      </header>

      <nav className="border-b border-black/70 bg-text-main px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="pb-2"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="pb-2"
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="pb-2"
            >
              Students
            </button>
            <button
              type="button"
              className="pb-2 border-b-2 border-primary text-white"
            >
              Events page
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded border border-border-color px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em]"
          >
            Back to dashboard
          </button>
        </div>
      </nav>

      <main className="flex-1 px-8 py-6">
        {loading && (
          <div className="rounded border border-border-color bg-white px-4 py-6 text-sm text-text-muted">
            Loading events…
          </div>
        )}
        {!loading && events.length === 0 && (
          <div className="rounded border border-border-color bg-white px-4 py-6 text-sm text-text-muted">
            No events have been created yet.
          </div>
        )}
        {!loading && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.2fr),minmax(0,1.4fr)]">
            <div>
              <div className="mb-2 font-sans font-bold text-sm">Upcoming</div>
              <div className="space-y-3">
                {upcoming.length === 0 && (
                  <div className="rounded border border-border-color bg-white px-3 py-3 text-xs text-text-muted">
                    No upcoming events.
                  </div>
                )}
                {upcoming.map((e) => card(e, () => setSelected(e)))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-sans font-bold text-sm">Ongoing</div>
              <div className="space-y-3">
                {ongoing.length === 0 && (
                  <div className="rounded border border-border-color bg-white px-3 py-3 text-xs text-text-muted">
                    No ongoing events.
                  </div>
                )}
                {ongoing.map((e) => card(e, () => setSelected(e)))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-sans font-bold text-sm">Completed</div>
              <div className="space-y-3">
                {completed.length === 0 && (
                  <div className="rounded border border-border-color bg-white px-3 py-3 text-xs text-text-muted">
                    No completed events.
                  </div>
                )}
                {completed.map((e) => card(e, () => setSelected(e)))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-sans font-bold text-sm">Event details & to-dos</div>
              <div className="space-y-3">
                {!selected && (
                  <div className="rounded border border-border-color bg-white px-3 py-3 text-xs text-text-muted">
                    Select an event card to see its description and to-do list.
                  </div>
                )}
                {selected && (
                  <div className="rounded border border-border-color bg-white px-3 py-3 text-xs">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                      {selected.date &&
                        new Date(selected.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                    </div>
                    <div className="mt-1 font-sans font-bold text-base">
                      {selected.title}
                    </div>
                    {selected.description && (
                      <div className="mt-2 text-[11px] text-text-muted">
                        {selected.description}
                      </div>
                    )}
                    <div className="mt-3 border-t border-border-color pt-3">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Event to-dos
                      </div>
                      <div className="space-y-1">
                        {selected.todos
                          ? Object.entries(selected.todos).map(
                              ([todoId, todo]) => (
                                <div
                                  key={todoId}
                                  className={`flex flex-col gap-2 rounded border px-3 py-2 text-[11px] sm:flex-row sm:items-center sm:justify-between ${
                                    todo.completed
                                      ? "border-green bg-green/5 line-through text-text-muted"
                                      : "border-border-color bg-background"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="break-words">{todo.title}</span>
                                    {todo.audience === "students" && (
                                      <span className="flex-shrink-0 rounded bg-green/10 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-green-700">
                                        Students
                                      </span>
                                    )}
                                    {todo.audience === "faculty" && (
                                      <span className="flex-shrink-0 rounded bg-ink/5 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-text-main">
                                        Faculty
                                      </span>
                                    )}
                                    {todo.audience === "all" && (
                                      <span className="flex-shrink-0 rounded bg-gold/10 px-2 py-[1px] text-[9px] font-mono uppercase tracking-[0.18em] text-primary">
                                        All
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 self-start sm:self-center">
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
                                            `/api/events/${selected.id}/todos/${todoId}`,
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
                                          setSelected(updated);
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
                              No tasks added yet for this event.
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter
        mode="dark"
        context="Admin events view for School of Computer Applications upcoming and completed events."
      />
    </div>
  );
}

export default AdminEventsPage;
