import React from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";

function SiteFooter({ mode = "light", context }) {
  const dark = mode === "dark";
  const baseClass = dark
    ? "border-t border-black/70 bg-text-main px-8 py-4 text-[11px] text-white/75"
    : "border-t border-border-color bg-white px-10 py-6 text-xs text-text-muted";

  return (
    <footer className={baseClass}>
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="SCA EMS"
              className="h-6 w-auto"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
              Event Management System
            </span>
          </div>
          {context && (
            <div className="mt-2 text-[11px]">
              {context}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 text-[11px] md:items-end">
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/team">Team</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em]">
            LPU · School of Computer Applications · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
