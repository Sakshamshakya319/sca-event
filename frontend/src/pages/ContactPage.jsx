import React, { useState } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../../logo.png";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [role, setRole] = useState("student");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const auth = useAuth();
  const dashboardRoute =
    auth.role === "student"
      ? "/student"
      : auth.role === "faculty"
        ? "/faculty"
        : auth.role === "admin"
          ? "/admin"
          : auth.role === "superadmin"
            ? "/superadmin"
            : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email and message.");
      setSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("scaAuthToken");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          universityId: universityId.trim() || null,
          role,
          category,
          subject: subject.trim(),
          message: message.trim()
        })
      });
      if (res.ok) {
        setSuccess(
          "Thank you. Your query has been sent to the admin team for review."
        );
        setName("");
        setEmail("");
        setUniversityId("");
        setSubject("");
        setMessage("");
        setCategory("general");
      } else {
        setError("Could not submit your query. Please try again.");
      }
    } catch {
      setError("Unable to reach server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Contact Us
          </p>
          <h1 className="mt-3 font-sans font-bold text-3xl md:text-4xl">
            Reach the School of Computer Applications event team
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-text-muted">
            Use this form to share queries related to SCA EMS, cultural events,
            access issues or suggestions. Your message will be sent to the
            admin and superadmin so that it can be reviewed and routed to the
            right faculty or coordinator.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.6fr,1.1fr]">
          <section className="rounded border border-border-color bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    University Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="yourid@lpu.in"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    University ID
                  </label>
                  <input
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Query Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="event">Event related</option>
                    <option value="access">Access / login</option>
                    <option value="feedback">Suggestion / feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="Short summary of your query"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded border border-border-color px-3 py-2 text-sm"
                  placeholder="Share as much detail as possible so we can route this correctly."
                />
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-border-color pt-4 text-[11px]">
                <p className="text-text-muted">
                  Queries are reviewed by the SCA EMS admin and superadmin, who
                  will respond through official university channels.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-primary px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>

              {(error || success) && (
                <div className="mt-2 text-[11px]">
                  {error && <div className="text-red-600">{error}</div>}
                  {success && <div className="text-green-700">{success}</div>}
                </div>
              )}
            </form>
          </section>

          <aside className="space-y-6 text-sm text-text-muted">
            <div className="rounded-lg border border-border-color bg-surface p-8 shadow-sm">
              <h2 className="font-sans font-bold text-2xl text-primary mb-4">Official Offices</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-text-main">School of Computer Applications</h4>
                  <p className="mt-1 leading-relaxed">
                    Lovely Professional University<br />
                    Block 32, First Floor, Room 104<br />
                    Phagwara, Punjab 144411
                  </p>
                </div>
                <div className="pt-4 border-t border-border-color">
                  <h4 className="font-bold text-text-main">Operating Hours</h4>
                  <p className="mt-1">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    <span className="text-xs text-primary block mt-2">Emergencies handled 24/7 by IT Helpdesk</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border-color bg-surface p-8 shadow-sm">
              <h3 className="font-sans font-bold text-xl text-primary mb-4">Frequently Asked Questions</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-text-main text-sm">How long does event approval take?</h4>
                  <p className="mt-1 text-[13px] leading-relaxed">Standard requests are processed by the Dean within 48 working hours. Ensure all budget and venue details are complete before submitting.</p>
                </div>
                <div className="pt-3 border-t border-border-color">
                  <h4 className="font-bold text-text-main text-sm">Who can request a new event?</h4>
                  <p className="mt-1 text-[13px] leading-relaxed">Only registered Faculty Mentors or officially designated Student Presidents can initiate a direct event proposal on the platform.</p>
                </div>
                <div className="pt-3 border-t border-border-color">
                  <h4 className="font-bold text-text-main text-sm">I lost my portal access password.</h4>
                  <p className="mt-1 text-[13px] leading-relaxed">Please use the form to the left and select the 'Access / Login' category. Include your UID and it will be routed to the IT desk.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter mode="dark" />
    </div>
  );
}

export default ContactPage;
