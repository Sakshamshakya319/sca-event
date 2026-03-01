import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function AboutPage() {
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

  return (
    <div className="min-h-screen bg-background text-text-main">
      <nav className="flex items-center justify-between border-b border-black/60 bg-text-main/95 px-10 py-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SCA EMS"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/team">Team</Link>
          <Link to="/contact">Contact</Link>
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

      <main className="px-10 py-12">
        <div className="max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            About SCA EMS
          </p>
          <h1 className="mt-3 font-sans font-bold text-3xl md:text-5xl leading-tight">
            Institutional Event Management for the School of Computer Applications
          </h1>
          <p className="mt-6 max-w-3xl text-sm text-text-muted leading-relaxed">
            SCA EMS is the definitive event management layer for the School of Computer
            Applications at Lovely Professional University. Engineered to eliminate administrative overhead, it provides students,
            faculty, and administrators a centralized ecosystem to propose, scrutinize, schedule, and execute
            every academic and cultural event with absolute clarity and accountability.
          </p>
        </div>

        {/* Mission and Vision Grid */}
        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded border border-border-color bg-surface p-8 shadow-sm">
            <div className="w-10 h-10 mb-4 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="font-sans font-bold text-2xl">Our Mission</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              To transition the entire School of Computer Applications from legacy, paper-based approval and planning processes into a fully verifiable, zero-friction digital environment. We aim to empower student coordinators with the tools they need to execute flawless events while giving faculty unprecedented visibility without micromanagement.
            </p>
          </div>
          <div className="rounded border border-border-color bg-surface p-8 shadow-sm">
            <div className="w-10 h-10 mb-4 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h2 className="font-sans font-bold text-2xl">Our Core Values</h2>
            <ul className="mt-4 space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Total Transparency:</strong> Every stakeholder knows the exact status of an event, who approved it, and what is currently pending.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong>Asynchronous Efficiency:</strong> Decisions are made swiftly without needing to chase signatures physically across the campus.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span><strong>Student Empowerment:</strong> Ownership is granted to student teams to lead events backed by a robust tracking framework.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16 border-t border-border-color pt-16">
          <h2 className="font-sans font-bold text-3xl md:text-4xl w-full text-center mb-12">The Impact of Digital Workflows</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="font-sans font-bold text-4xl text-primary">85%</div>
              <div className="mt-2 text-sm font-semibold">Faster Approvals</div>
              <p className="mt-1 text-xs text-text-muted max-w-[200px] mx-auto">Reduction in wait times from proposal submission to final administrative sign-off.</p>
            </div>
            <div className="text-center">
              <div className="font-sans font-bold text-4xl text-primary">0</div>
              <div className="mt-2 text-sm font-semibold">Venue Conflicts</div>
              <p className="mt-1 text-xs text-text-muted max-w-[200px] mx-auto">Double-booking of labs and auditoriums completely eliminated programmatically.</p>
            </div>
            <div className="text-center">
              <div className="font-sans font-bold text-4xl text-primary">2.1k</div>
              <div className="mt-2 text-sm font-semibold">Tasks Tracked</div>
              <p className="mt-1 text-xs text-text-muted max-w-[200px] mx-auto">Granular milestones monitored to ensure institutional standards are met.</p>
            </div>
            <div className="text-center">
              <div className="font-sans font-bold text-4xl text-primary">120+</div>
              <div className="mt-2 text-sm font-semibold">Hours Saved</div>
              <p className="mt-1 text-xs text-text-muted max-w-[200px] mx-auto">Administrative labor saved per month through automated routing and scheduling.</p>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded border border-border-color bg-white p-6 shadow-sm">
            <h2 className="font-sans font-bold text-lg text-primary">Why this system exists</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Institutional events require aligning immense logistical constraints: multiple distinct venues, cross-functional teams, tight budgets, and strict academic timelines. SCA EMS serves as the single source of truth to reduce confusion by aggressively centralizing tasks, deadlines, and core event metadata.
            </p>
          </div>
          <div className="rounded border border-border-color bg-white p-6 shadow-sm">
            <h2 className="font-sans font-bold text-lg text-primary">Who manages it</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Superadmins and Admins control overarching campus timelines. Faculty Mentors monitor their specifically assigned events, and Student Coordinators drive the granular execution. Each role enjoys a highly bespoke dashboard view perfectly calibrated for their responsibilities.
            </p>
          </div>
          <div className="rounded border border-border-color bg-white p-6 shadow-sm">
            <h2 className="font-sans font-bold text-lg text-primary">What it enables</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              From automated centralized calendars catching clashes instantaneously to role-based task lists tracking last-minute logistics, SCA EMS guarantees that every critical event milestone is visible, verified, and explicitly owned by an accountable individual.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter mode="dark" />
    </div>
  );
}

export default AboutPage;
