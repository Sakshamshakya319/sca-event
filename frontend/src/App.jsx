import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import AuthPortal from "./pages/AuthPortal.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentProfilePage from "./pages/StudentProfilePage.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import FacultyProfilePage from "./pages/FacultyProfilePage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SuperadminDashboard from "./pages/SuperadminDashboard.jsx";
import SuperadminEventsPage from "./pages/SuperadminEventsPage.jsx";
import SuperadminUsersPage from "./pages/SuperadminUsersPage.jsx";
import AdminEventsPage from "./pages/AdminEventsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-background text-text-main font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/portal" element={<AuthPortal />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/profile" element={<FacultyProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        <Route path="/superadmin" element={<SuperadminDashboard />} />
        <Route path="/superadmin/events" element={<SuperadminEventsPage />} />
        <Route path="/superadmin/users" element={<SuperadminUsersPage />} />
      </Routes>
    </div>
  );
}

export default App;
