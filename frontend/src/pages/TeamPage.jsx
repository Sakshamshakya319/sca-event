import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

const leadershipTeam = [
  {
    name: "Dr. A. Das",
    role: "Dean of Student Affairs",
    focus: "Strategic Oversight & Approvals",
    email: "dean.sca@lpu.co.in"
  },
  {
    name: "Dr. M. Singh",
    role: "Head of Technical Events",
    focus: "Hackathons & Seminars Mentorship",
    email: "technical.head@lpu.co.in"
  },
  {
    name: "Prof. P. Sharma",
    role: "Cultural Events Mentor",
    focus: "Music Festival & Cultural Nights",
    email: "cultural@lpu.co.in"
  }
];

const coreTeam = [
  {
    name: "Rahul Verma",
    role: "Student President",
    focus: "Overall Execution & Logistics",
    email: "12201234@lpu.in"
  },
  {
    name: "Simran Kaur",
    role: "Tech Lead",
    focus: "EMS Platform Development & Maintenance",
    email: "12204567@lpu.in"
  },
  {
    name: "Aryan Gupta",
    role: "Operations Head",
    focus: "Venue & Budget Coordination",
    email: "12208901@lpu.in"
  },
  {
    name: "Priya Patel",
    role: "Design & Outreach",
    focus: "Marketing & Public Relations",
    email: "12203344@lpu.in"
  }
];

const supportTeam = [
  {
    name: "SCA Superadmin",
    role: "System Integration",
    focus: "EMS Core Admin Controls",
    email: "sca.admin@lpu.co.in"
  },
  {
    name: "IT Support Desk",
    role: "Technical Support",
    focus: "Authentication & Network Access",
    email: "it.support@lpu.co.in"
  }
];

function TeamPage() {
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
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Our Team
        </p>
        <h1 className="mt-3 font-sans font-bold text-3xl md:text-4xl">
          People behind SCA EMS at the School of Computer Applications
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-text-muted">
          SCA EMS is a collaboration between student coordinators, faculty
          mentors and the technical team. Together they ensure that every event
          at the School of Computer Applications runs with clarity and proper
          coordination.
        </p>

        <section className="mt-8 grid gap-10 md:grid-cols-[1.6fr,1.2fr]">
          <div className="space-y-8">
            <div className="rounded border border-border-color bg-surface p-8 shadow-sm">
              <h2 className="font-sans font-bold text-2xl text-primary">Strategic Leadership</h2>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                The strategic direction of SCA events is led by a dedicated team of Deans and core Faculty Mentors who ensure that all student activities align with the university's academic standards and safety policies.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {leadershipTeam.map((member) => (
                  <div
                    key={member.email}
                    className="rounded-lg border border-border-color bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
                  >
                    <div className="font-sans font-bold text-lg">{member.name}</div>
                    <div className="mt-1 text-[12px] font-mono uppercase tracking-[0.18em] text-primary">
                      {member.role}
                    </div>
                    <div className="mt-2 text-[13px] text-text-muted">
                      {member.focus}
                    </div>
                    <div className="mt-3 text-[12px] text-text-muted font-mono">
                      {member.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-border-color bg-surface p-8 shadow-sm">
              <h3 className="font-sans font-bold text-2xl text-primary">Core Execution Team</h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                The execution core is entirely student-led. These coordinators manage horizontal functions across all SCA events including logistics, digital platforms, operations, and public relations.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {coreTeam.map((member) => (
                  <div
                    key={member.email}
                    className="rounded-lg border border-border-color bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
                  >
                    <div className="font-sans font-bold text-lg">{member.name}</div>
                    <div className="mt-1 text-[12px] font-mono uppercase tracking-[0.18em] text-primary">
                      {member.role}
                    </div>
                    <div className="mt-2 text-[13px] text-text-muted">
                      {member.focus}
                    </div>
                    <div className="mt-3 text-[12px] text-text-muted font-mono">
                      {member.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded border border-border-color bg-white p-6">
              <h3 className="font-sans font-bold text-sm">System & admin support</h3>
              <p className="mt-2 text-sm text-text-muted">
                The admin and superadmin maintain overall control of events,
                access policies and approvals inside SCA EMS.
              </p>
              <div className="mt-3 space-y-2 text-sm">
                {supportTeam.map((member) => (
                  <div key={member.email}>
                    <div className="font-sans font-bold text-base">{member.name}</div>
                    <div className="mt-1 text-[12px] font-mono uppercase tracking-[0.18em] text-text-muted">
                      {member.role}
                    </div>
                    <div className="mt-1 text-[13px] text-text-muted">
                      {member.focus}
                    </div>
                    <div className="mt-2 text-[12px] text-text-muted">
                      {member.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-border-color bg-white p-6 text-sm text-text-muted">
              <h3 className="font-sans font-bold text-sm">How to reach the team</h3>
              <p className="mt-2 text-[13px] text-text-muted">
                For any questions regarding SCA EMS or event workflows, use the
                Contact page. Your query will be visible to the admin and
                superadmin who will coordinate with faculty or student
                coordinators as needed.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <SiteFooter mode="dark" />
    </div>
  );
}

export default TeamPage;
