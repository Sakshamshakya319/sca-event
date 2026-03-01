import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import anime from "animejs";
import logo from "../../logo.png";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function Landing() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const heroRef = useRef(null);

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

    const links = document.querySelectorAll("a,button");
    links.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(ring, { scale: 1.35, duration: 0.2, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(ring, { scale: 1, duration: 0.2, ease: "power3.out" });
      });
    });

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const { role } = useAuth();
  const dashboardRoute =
    role === "student"
      ? "/student"
      : role === "faculty"
        ? "/faculty"
        : role === "admin"
          ? "/admin"
          : role === "superadmin"
            ? "/superadmin"
            : null;

  useEffect(() => {
    if (!heroRef.current) return;
    anime({
      targets: heroRef.current.querySelectorAll(".fade-in"),
      opacity: [0, 1],
      translateY: [24, 0],
      easing: "easeOutQuad",
      duration: 700,
      delay: anime.stagger(120)
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-text-main">
      <div
        ref={cursorRef}
        className="cursor-dot fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed z-[9998] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/60"
      />

      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-black/60 bg-text-main/95 px-10 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
          <Link to="/" className="hidden md:inline">
            Home
          </Link>
          <Link to="/about" className="hidden md:inline">
            About
          </Link>
          <Link to="/team" className="hidden md:inline">
            Team
          </Link>
          <Link to="/contact" className="hidden md:inline">
            Contact
          </Link>
          {dashboardRoute ? (
            <Link
              to={dashboardRoute}
              className="rounded border border-white/40 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/portal"
              className="rounded border border-white/40 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white"
            >
              Portal Login
            </Link>
          )}
        </div>
      </nav>

      <main ref={heroRef} className="pt-24">
        <section className="fade-in px-10 pb-24 pt-10 md:flex md:min-h-[70vh] md:items-center">
          <div className="max-w-2xl space-y-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
              School of Computer Applications — LPU · Established 2026
            </p>
            <div className="h-40 md:h-64 mt-2">
              <h1 className="font-sans font-bold text-4xl leading-tight md:text-6xl md:leading-tight">
                Event Management,
                <br />
                <span className="italic text-primary" id="hero-dynamic-text">Elevated.</span>
              </h1>
            </div>

            <p className="max-w-xl text-sm text-text-muted mt-2 md:mt-0">
              A unified, data-driven platform for the School of Computer Applications. Organize Hackathons, schedule Cultural Nights, track Technical Seminars, and execute every event with absolute precision — zero confusion, robust auditing, and seamless task management.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {dashboardRoute ? (
                <Link
                  to={dashboardRoute}
                  className="rounded bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-primary-hover transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/portal"
                  className="rounded bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-primary-hover transition-colors"
                >
                  Enter Portal
                </Link>
              )}
              <a href="#how-it-works" className="rounded border border-primary text-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-primary/5 transition-colors">
                How It Works
              </a>
            </div>
          </div>
          <div className="mt-14 grid flex-1 grid-cols-2 gap-4 md:mt-0 md:pl-16">
            <div className="fade-in rounded border border-border-color bg-white p-6 text-right shadow-sm hover:border-primary/50 transition-colors">
              <div className="font-sans font-bold text-4xl text-primary">50+</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Successful Events
              </div>
            </div>
            <div className="fade-in rounded border border-border-color bg-white p-6 text-right shadow-sm hover:border-primary/50 transition-colors">
              <div className="font-sans font-bold text-4xl text-primary">2.5k</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Active Students
              </div>
            </div>
            <div className="fade-in rounded border border-border-color bg-white p-6 text-right shadow-sm hover:border-primary/50 transition-colors">
              <div className="font-sans font-bold text-4xl text-primary">12</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Technical Clubs
              </div>
            </div>
            <div className="fade-in rounded border border-border-color bg-white p-6 text-right shadow-sm hover:border-primary/50 transition-colors">
              <div className="font-sans font-bold text-4xl text-primary">100%</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Digital Workflows
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="fade-in border-t border-border-color bg-surface px-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              The Process
            </p>
            <h2 className="mt-3 font-sans font-bold text-3xl md:text-4xl">
              How <span className="text-primary italic">SCA EMS</span> works
            </h2>
            <p className="mt-4 text-sm text-text-muted mx-auto max-w-2xl">
              Transitioning from paper trails to a unified digital ecosystem. Event planning is now a transparent, four-step process.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4 max-w-6xl mx-auto">
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mb-4">1</div>
              <h3 className="font-sans font-bold text-lg mb-2">Propose</h3>
              <p className="text-xs text-text-muted">Students or Faculty submit comprehensive event proposals detailing venues, budgets, and operational requirements.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-border-color -z-10"></div>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mb-4">2</div>
              <h3 className="font-sans font-bold text-lg mb-2">Approve</h3>
              <p className="text-xs text-text-muted">Administrators review the proposals against university calendars to prevent clashes and ensure policy compliance.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-border-color -z-10"></div>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mb-4">3</div>
              <h3 className="font-sans font-bold text-lg mb-2">Execute</h3>
              <p className="text-xs text-text-muted">Role-based dashboards assign specific milestones and track deliverables in real-time across all involved parties.</p>
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-border-color -z-10"></div>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mb-4">4</div>
              <h3 className="font-sans font-bold text-lg mb-2">Review</h3>
              <p className="text-xs text-text-muted">Post-event analytics and feedback are aggregated to improve future events and track institutional engagement.</p>
            </div>
          </div>
        </section>

        <section className="fade-in border-t border-border-color bg-white px-10 py-20">
          <div className="max-w-7xl mx-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              Core Capabilities
            </p>
            <h2 className="mt-3 font-sans font-bold text-3xl md:text-4xl">
              Built for every detail of{" "}
              <span className="italic text-text-muted">institution-scale organization</span>
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  01
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Centralized Timeline</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  One unified calendar view for every SCA event at LPU. System automatically flags venue clashes and timeline overlaps early so that resource conflicts are entirely mitigated before formal approval.
                </p>
              </div>
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  02
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Access Control</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Enterprise-grade role-based dashboards. Superadmins, Admins, Faculty and Students see highly tailored data specific to their responsibilities and clearance levels, all powered securely.
                </p>
              </div>
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  03
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Granular Task Tracking</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Every milestone is owned by a specific student or coordinator. Dependencies, due dates, task priorities, and completion statuses are strictly monitored to guarantee institutional readiness.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  04
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Student-First</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Empowering the student body. Student coordinators manage their designated event tasks, view live institutional calendars, and update progress without the friction of endless email chains.
                </p>
              </div>
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  05
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Faculty Transparency</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Faculty mentors are relieved of micromanagement. They can monitor top-level status across assigned events and support students using a clear, real-time, consolidated dashboard view.
                </p>
              </div>
              <div className="rounded border border-border-color bg-background p-8 hover:shadow-md transition-shadow">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
                  06
                </div>
                <h3 className="mt-4 font-sans font-bold text-xl text-primary">Audit & Oversight</h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Rigorous oversight capabilities. Admins and superadmins control root-level approvals, review contact queries, process system audits, and keep the campus entirely aligned with SCA policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="fade-in border-t border-border-color bg-surface px-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-sans font-bold text-2xl md:text-3xl mb-12">
              "SCA EMS has reduced event approval times by 75% and eliminated all venue double-bookings this semester."
            </h2>
            <div className="inline-flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold font-mono">AD</div>
              <div>
                <div className="font-bold text-sm">Prof. A. Das</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Dean of Student Affairs, SCA</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter mode="dark" />
    </div>
  );
}

export default Landing;

