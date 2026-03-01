import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function SuperadminUsersPage() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { name, identifier, logout } = useAuth();
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

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
            <Link to="/superadmin/events">Events</Link>
            <span className="text-white">Users</span>
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
          <div className="font-sans font-bold text-xl">System Users</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            All faculties and students
          </div>
        </div>
        <div className="sdm-fade flex gap-6">
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

      <main className="px-8 py-6">
        <section className="sdm-fade grid gap-4 md:grid-cols-2">
          <div className="rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Faculty accounts</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {facultyUsers.length} total
              </span>
            </div>
            <div className="max-h-[360px] divide-y divide-border overflow-auto text-xs">
              {loadingFaculty && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Loading faculty…
                </div>
              )}
              {!loadingFaculty && facultyUsers.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No faculty accounts.
                </div>
              )}
              {!loadingFaculty &&
                facultyUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">
                        {u.name || "Unnamed faculty"}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {u.identifier}
                      </div>
                    </div>
                    <span className="rounded bg-blue/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-blue-700">
                      Faculty
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded border border-border-color bg-white">
            <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
              <h2 className="font-sans font-bold text-lg">Student accounts</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {studentUsers.length} total
              </span>
            </div>
            <div className="max-h-[360px] divide-y divide-border overflow-auto text-xs">
              {loadingStudents && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  Loading students…
                </div>
              )}
              {!loadingStudents && studentUsers.length === 0 && (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No student accounts.
                </div>
              )}
              {!loadingStudents &&
                studentUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">
                        {u.name || "Unnamed student"}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {u.identifier}
                      </div>
                    </div>
                    <span className="rounded bg-green/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-green-700">
                      Student
                    </span>
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

export default SuperadminUsersPage;
