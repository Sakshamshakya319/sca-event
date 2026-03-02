import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
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

function ProtectedRoute({ children }) {
  const { mustChangePassword, token } = useAuth();
  
  if (token && mustChangePassword) {
    return <Navigate to="/portal" replace />;
  }
  
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-background text-text-main font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/portal" element={<AuthPortal />} />
        <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/profile" element={<ProtectedRoute><FacultyProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><AdminEventsPage /></ProtectedRoute>} />
        <Route path="/superadmin" element={<ProtectedRoute><SuperadminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/events" element={<ProtectedRoute><SuperadminEventsPage /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute><SuperadminUsersPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
