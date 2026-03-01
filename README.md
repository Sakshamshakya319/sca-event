<div align="center">

<!-- Logo / Banner -->
<img src="https://img.shields.io/badge/SCA-Event%20Management%20System-1a1a2e?style=for-the-badge&logo=calendar&logoColor=white" alt="SCA EMS Banner" width="500"/>

<br/>
<br/>

# 🎓 SCA Event Management System
### *School of Computer Applications — Lovely Professional University*

<p align="center">
  <img src="https://img.shields.io/badge/React.js-18.x-61DAFB?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Anime.js-3.x-FF6B6B?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>
</p>

<br/>

> **A professional, real-time event management platform built exclusively for the School of Computer Applications at Lovely Professional University — enabling seamless multi-event organisation, role-based access control, and live progress tracking — all in one elegant interface.**

<br/>

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo & Screenshots](#-live-demo--screenshots)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Role & Permission Matrix](#-role--permission-matrix)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Authentication & Login Routes](#-authentication--login-routes)
- [Database Schema](#-database-schema)
- [UI/UX Design Philosophy](#-uiux-design-philosophy)
- [Animation System](#-animation-system)
- [Event Lifecycle](#-event-lifecycle)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **SCA Event Management System** is a full-stack web application designed to eliminate the chaos of organising multiple concurrent events within the School of Computer Applications at Lovely Professional University. Built with a clean, professional **white theme** and powered by **real-time data synchronisation**, this platform ensures every faculty member, administrator, and student volunteer knows exactly what needs to be done, by whom, and by when.

As of **February 2026**, the School of Computer Applications manages upwards of **30+ events per semester**, ranging from cultural fests to academic seminars. This system was purpose-built to handle that scale — with zero confusion.

### Why This System Exists

Before this platform, event organisation relied on WhatsApp groups, spreadsheets, and verbal communication — leading to missed deadlines, duplicated tasks, and accountability gaps. The SCA EMS replaces all of that with a structured, trackable, and auditable workflow.

---

## 🎬 Live Demo & Screenshots

> 🔗 **Production URL:** `https://sca-ems.lpu.edu.in` *(internal network)*
> 🔗 **Staging URL:** `https://sca-ems-staging.vercel.app`

| View | Description |
|------|-------------|
| 🏠 Landing Page | Animated hero with mouse-tracking particle effect and smooth fade-in sections |
| 📅 Calendar Dashboard | Interactive event calendar with colour-coded status indicators |
| 📊 Admin Dashboard | Real-time progress overview with countdown timers for all active events |
| 🗂️ Event Detail Page | Checklist-style task management with assignment and progress rings |
| 🔔 Popup Notification | Faculty login triggers an elegant animated modal for upcoming events |
| 👥 Student Assignment | Faculty can assign student volunteers with role-specific task cards |

---

## ✨ Key Features

### 🔐 Authentication & Access Control
- **Dual Login Routes** — Separate `/faculty-login` and `/admin-login` portals for clean UX separation
- **Firebase Google Auth** — One-click OAuth login for faculty members
- **Superadmin Account** — Dedicated credentials with full platform access
- **JWT Session Management** — Secure token-based sessions with role verification
- **Auto Role Detection** — System identifies user type on login and redirects accordingly

### 📅 Calendar & Event Management
- **Interactive Calendar View** — Month/week/day views with event status overlays
- **Colour-coded Event Status** — Pending (amber), Approved (green), In Progress (blue), Completed (grey)
- **Countdown Timers** — "X days remaining" displayed prominently on every active event card
- **Multi-Event Oversight** — Superadmin sees all events simultaneously; faculty sees only their assigned events
- **February 2026 Contextual Data** — System auto-highlights current month events at login

### 📋 Task & Progress Management
- **Hierarchical Task Lists** — Faculty creates main tasks; each can have sub-tasks
- **Real-Time Progress Bars** — Animated circular progress rings update as tasks are completed
- **Student Assignment Module** — Faculty can assign students to specific tasks with deadlines
- **Admin Progress Visibility** — Admins and superadmins see complete task trees for every event
- **Activity Log** — Every action (task marked done, student assigned, event approved) is timestamped

### 🔔 Smart Notifications
- **Login Popup — Upcoming Events** — When faculty logs in, an elegant animated modal surfaces the next 3 upcoming events they're managing
- **Approval Notifications** — Faculty receives in-app notification when event is approved or rejected
- **Deadline Alerts** — System flags tasks/events within 48 hours of deadline
- **Progress Milestones** — Auto-notification when event crosses 25%, 50%, 75%, 100% completion

### 👥 Role-Based Dashboards
- **Superadmin Dashboard** — Bird's-eye view of all events, all teams, all progress across the entire SCA department
- **Admin Dashboard** — Manage approval queue, monitor assigned faculty, track events under jurisdiction
- **Faculty Dashboard** — Personal event workspace with task management, student assignment, and timeline view
- **Student View** — Lightweight task checklist with due dates and assignment context

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  React 18 + Vite 5 + TailwindCSS + Anime.js                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Faculty  │ │  Admin   │ │ Superadm │ │ Student          │  │
│  │ Portal   │ │ Portal   │ │ Portal   │ │ View             │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────▼───────────────────────────────────────┐
│                       API LAYER                                 │
│  Node.js + Express.js                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────┐ │
│  │ Auth       │ │ Events     │ │ Tasks      │ │ Users       │ │
│  │ Middleware │ │ Controller │ │ Controller │ │ Controller  │ │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     DATA LAYER                                  │
│  ┌─────────────────────────┐  ┌────────────────────────────┐   │
│  │      MongoDB Atlas      │  │    Firebase Auth           │   │
│  │  Events | Tasks | Users │  │  Google OAuth + JWT        │   │
│  │  Logs | Notifications   │  │  Session Management        │   │
│  └─────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Role & Permission Matrix

| Action | 👤 Student | 🧑‍🏫 Faculty | 🛡️ Admin | 👑 Superadmin |
|--------|-----------|---------|---------|-------------|
| View assigned tasks | ✅ | ✅ | ✅ | ✅ |
| Mark task complete | ✅ | ✅ | ✅ | ✅ |
| Create new event | ❌ | ✅ | ✅ | ✅ |
| Edit event details | ❌ | ✅ (own) | ✅ | ✅ |
| Approve/reject events | ❌ | ❌ | ✅ | ✅ |
| Assign students to tasks | ❌ | ✅ | ✅ | ✅ |
| View all faculty events | ❌ | ❌ (own) | ✅ | ✅ |
| View complete task tree | ❌ | ❌ (own) | ✅ | ✅ |
| Manage user roles | ❌ | ❌ | ❌ | ✅ |
| View analytics/reports | ❌ | ❌ | ✅ | ✅ |
| Delete events | ❌ | ❌ | ❌ | ✅ |
| System configuration | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 18.x | UI component framework |
| **Vite** | 5.x | Lightning-fast build tool & dev server |
| **TailwindCSS** | 3.x | Utility-first CSS framework (white professional theme) |
| **Anime.js** | 3.x | High-performance animations & micro-interactions |
| **React Router DOM** | 6.x | Client-side routing & protected routes |
| **React Query** | 5.x | Server state management & real-time sync |
| **Framer Motion** | 11.x | Page transitions & layout animations |
| **FullCalendar** | 6.x | Professional interactive calendar component |
| **Recharts** | 2.x | Analytics charts & progress visualisations |
| **React Hot Toast** | 2.x | Elegant notification toasts |
| **Lucide React** | latest | Consistent iconography |

### Typography System
| Element | Font Family | Notes |
|---------|------------|-------|
| **Headings (H1–H6)** | `Merriweather` — Serif, 700/900 weight | Premium academic look |
| **Body Text** | `Open Sans` — Humanist Sans, 400/500/600 | Highly legible at all sizes |
| **Monospaced** | `DM Mono` — 400/500 weight | Badges, IDs, dates, metadata |
| **Google Fonts URL** | `family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500` | Load in `<head>` |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x LTS | Server runtime |
| **Express.js** | 4.x | REST API framework |
| **Mongoose** | 8.x | MongoDB ODM & schema validation |
| **Firebase Admin SDK** | 12.x | Server-side auth verification |
| **Socket.io** | 4.x | Real-time task/progress updates |
| **Zod** | 3.x | Request validation & type safety |
| **Helmet.js** | 7.x | HTTP security headers |
| **Morgan** | 1.x | HTTP request logging |

### Database & Services
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Primary database — events, tasks, users, logs |
| **Firebase Authentication** | Google OAuth + custom token auth |
| **Cloudinary** | Event banner/image uploads |
| **Vercel** | Frontend deployment |
| **Railway / Render** | Backend API deployment |

### Fonts & Design
| Element | Choice |
|---------|--------|
| **Primary Font** | `Open Sans` — warm, humanist, highly legible for body text |
| **Display Font** | `Merriweather` — premium serif for headings, academic and authoritative |
| **Mono Font** | `JetBrains Mono` — code, IDs, timestamps |
| **Theme** | Pure white `#FFFFFF` / warm ivory `#F9F9F6` background, `#0A0A0A` text, `#1A3470` accent, `#B8962E` gold |

---

## 📁 Directory Structure

```
sca-event-management/
├── 📁 client/                          # React + Vite frontend
│   ├── 📁 public/
│   │   └── favicon.ico
│   ├── 📁 src/
│   │   ├── 📁 animations/              # Anime.js animation configs
│   │   │   ├── fadeAnimations.js       # Fade in/out presets
│   │   │   ├── mouseTracker.js         # Custom cursor & particle trail
│   │   │   ├── pageTransitions.js      # Route change animations
│   │   │   └── progressAnimations.js  # Progress ring animations
│   │   ├── 📁 assets/
│   │   │   ├── 📁 fonts/
│   │   │   ├── 📁 images/
│   │   │   └── 📁 icons/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   ├── AnimatedCard.jsx    # Card with hover lift effect
│   │   │   │   ├── CountdownTimer.jsx  # Animated days-remaining timer
│   │   │   │   ├── CustomCursor.jsx    # Magnetic cursor component
│   │   │   │   ├── FadeInSection.jsx   # Intersection observer fade-in
│   │   │   │   ├── LoadingSpinner.jsx  # Branded loading animation
│   │   │   │   ├── ProgressRing.jsx    # Animated circular progress
│   │   │   │   └── StatusBadge.jsx     # Event status indicator
│   │   │   ├── 📁 calendar/
│   │   │   │   ├── EventCalendar.jsx   # FullCalendar wrapper
│   │   │   │   ├── EventPopover.jsx    # Calendar event quick-view
│   │   │   │   └── CalendarFilters.jsx # Filter by status/role
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── EventCard.jsx       # Event summary card
│   │   │   │   ├── ProgressOverview.jsx # Analytics summary
│   │   │   │   ├── QuickStats.jsx      # Stat counters with animation
│   │   │   │   └── RecentActivity.jsx  # Activity feed
│   │   │   ├── 📁 events/
│   │   │   │   ├── CreateEventForm.jsx # Multi-step event creation
│   │   │   │   ├── EventDetails.jsx    # Full event view
│   │   │   │   ├── TaskList.jsx        # Hierarchical task manager
│   │   │   │   ├── TaskItem.jsx        # Individual task with checkbox
│   │   │   │   ├── StudentAssignment.jsx # Assign students to tasks
│   │   │   │   └── ApprovalBadge.jsx   # Pending/approved/rejected
│   │   │   ├── 📁 modals/
│   │   │   │   ├── UpcomingEventsPopup.jsx # Login welcome modal
│   │   │   │   ├── ApproveEventModal.jsx   # Admin approval dialog
│   │   │   │   └── AssignStudentModal.jsx  # Student assignment dialog
│   │   │   └── 📁 layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── 📁 contexts/
│   │   │   ├── AuthContext.jsx          # Auth state + Firebase
│   │   │   └── NotificationContext.jsx  # Real-time notifications
│   │   ├── 📁 hooks/
│   │   │   ├── useAuth.js              # Auth helper hook
│   │   │   ├── useEvents.js            # Event CRUD operations
│   │   │   ├── useTasks.js             # Task management
│   │   │   ├── useMousePosition.js     # Cursor tracking
│   │   │   └── useScrollAnimation.js   # Scroll-triggered animations
│   │   ├── 📁 pages/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── FacultyLogin.jsx    # Route: /faculty-login
│   │   │   │   └── AdminLogin.jsx      # Route: /admin-login (admin + superadmin + student)
│   │   │   ├── 📁 superadmin/
│   │   │   │   ├── SuperAdminDashboard.jsx
│   │   │   │   ├── AllEvents.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── SystemAnalytics.jsx
│   │   │   ├── 📁 admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ApprovalQueue.jsx
│   │   │   │   └── FacultyEvents.jsx
│   │   │   ├── 📁 faculty/
│   │   │   │   ├── FacultyDashboard.jsx
│   │   │   │   ├── MyEvents.jsx
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   └── ManageEvent.jsx
│   │   │   ├── 📁 student/
│   │   │   │   └── StudentTasks.jsx
│   │   │   ├── Landing.jsx             # Public landing page
│   │   │   └── NotFound.jsx
│   │   ├── 📁 routes/
│   │   │   ├── ProtectedRoute.jsx      # Role-based route guard
│   │   │   └── AppRouter.jsx           # All routes configured
│   │   ├── 📁 services/
│   │   │   ├── api.js                  # Axios instance + interceptors
│   │   │   ├── eventService.js
│   │   │   ├── taskService.js
│   │   │   └── userService.js
│   │   ├── 📁 utils/
│   │   │   ├── dateHelpers.js          # Date formatting & countdowns
│   │   │   ├── constants.js            # Roles, statuses, colours
│   │   │   └── validators.js           # Form validation rules
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.local
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📁 server/                          # Node.js + Express backend
│   ├── 📁 config/
│   │   ├── db.js                       # MongoDB connection
│   │   └── firebase.js                 # Firebase Admin init
│   ├── 📁 controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── 📁 middleware/
│   │   ├── authenticate.js             # Firebase token verification
│   │   ├── authorize.js                # Role-based access control
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── 📁 models/
│   │   ├── User.model.js
│   │   ├── Event.model.js
│   │   ├── Task.model.js
│   │   └── ActivityLog.model.js
│   ├── 📁 routes/
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── task.routes.js
│   │   └── user.routes.js
│   ├── 📁 sockets/
│   │   └── socketHandlers.js           # Real-time event handlers
│   ├── 📁 utils/
│   │   ├── emailTemplates.js
│   │   └── responseHelper.js
│   ├── .env
│   ├── server.js                       # Entry point
│   └── package.json
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your machine:

- **Node.js** v20.x LTS or higher — [Download](https://nodejs.org)
- **npm** v10.x or higher (bundled with Node)
- **MongoDB Atlas** account — [Create free cluster](https://www.mongodb.com/atlas)
- **Firebase Project** with Google Auth enabled — [Firebase Console](https://console.firebase.google.com)
- **Git** — [Download](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/lpu-sca/event-management-system.git
cd event-management-system
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Configure Environment Variables

> See the [Environment Variables](#-environment-variables) section for all required variables.

```bash
# Frontend
cp client/.env.example client/.env.local

# Backend
cp server/.env.example server/.env
```

Fill in all required values in both `.env` files.

### 4. Start Development Servers

```bash
# Terminal 1 — Start backend API (runs on port 5000)
cd server
npm run dev

# Terminal 2 — Start frontend dev server (runs on port 5173)
cd client
npm run dev
```

### 5. Access the Application

| Route | Purpose |
|-------|---------|
| `http://localhost:5173/` | Landing page |
| `http://localhost:5173/faculty-login` | Faculty login portal |
| `http://localhost:5173/admin-login` | Admin / Superadmin / Student login portal |
| `http://localhost:5173/superadmin/dashboard` | Superadmin dashboard (protected) |
| `http://localhost:5173/admin/dashboard` | Admin dashboard (protected) |
| `http://localhost:5173/faculty/dashboard` | Faculty dashboard (protected) |

---

## 🔐 Environment Variables

### Client (`client/.env.local`)

```env
# App
VITE_APP_NAME="SCA Event Management System"
VITE_APP_VERSION="1.0.0"
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Firebase (from Firebase Console → Project Settings → Your Apps)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_ANALYTICS=true
```

### Server (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sca_ems?retryWrites=true&w=majority

# Firebase Admin SDK (download service account JSON from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# JWT (used as additional session layer)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d

# Superadmin (pre-seeded account)
SUPERADMIN_ID=sca
SUPERADMIN_EMAIL=sca-sca@admin.lpu
SUPERADMIN_PASSWORD=sca@admin@nrt*gam

# Cloudinary (event image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔑 Authentication & Login Routes

The application uses **two separate login routes** by design — to provide a clear separation of concerns and prevent confusion between user types.

### Route 1: `/faculty-login`
**Intended for:** Faculty members only  
**Auth Method:** Firebase Google OAuth (one-click sign-in with institutional email)  
**Post-login:** Redirected to Faculty Dashboard + Upcoming Events popup shown  
**Registration:** Faculty can self-register; admin receives notification of new faculty registration with full details  
**Admin Visibility:** When a faculty member registers, admin dashboard shows: faculty name, department, assigned events, and history of completed events

```
Faculty Login Flow:
  Click "Sign in with Google"
    → Firebase OAuth popup
      → Token verified server-side
        → Role checked (faculty)
          → JWT issued
            → Redirect /faculty/dashboard
              → UpcomingEventsPopup shown (if events in next 14 days)
```

### Route 2: `/admin-login`
**Intended for:** Admins, Superadmins, and Students  
**Auth Method:** Email + Password (with optional Google OAuth for students)  

| Credential | User Type |
|------------|-----------|
| `[id]-sca@admin.lpu` + `sca@admin@nrt*gam` | **Superadmin** |
| Admin-issued email + password | **Admin** |
| Student registration form | **Student** |

> 💡 **Note:** The Superadmin ID format is `[id]-sca@admin.lpu`. Replace `[id]` with the assigned superadmin identifier (e.g., `001-sca@admin.lpu`). This is seeded automatically on first deployment via the database seed script.

```bash
# Seed superadmin account
cd server
npm run seed:superadmin
```

---

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  uid: String,                    // Firebase UID
  name: String,
  email: String,
  role: enum['superadmin', 'admin', 'faculty', 'student'],
  department: String,             // e.g., "SCA"
  employeeId: String,             // LPU employee/student ID
  avatar: String,                 // URL
  isActive: Boolean,
  createdAt: Date,                // "February 2026"
  lastLogin: Date,
  eventsManaged: [ObjectId],      // refs to Event
  eventsCompleted: Number,        // auto-incremented
  registrationApproved: Boolean   // admin approves faculty registration
}
```

### Event Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  banner: String,                 // Cloudinary URL
  category: enum['cultural', 'academic', 'sports', 'technical', 'other'],
  status: enum['draft', 'pending_approval', 'approved', 'in_progress', 'completed', 'cancelled'],
  
  createdBy: ObjectId,            // faculty who created
  approvedBy: ObjectId,           // admin/superadmin who approved
  
  startDate: Date,
  endDate: Date,
  venue: String,
  estimatedAttendees: Number,
  
  tasks: [ObjectId],              // refs to Task
  assignedStudents: [ObjectId],   // refs to User (students)
  
  progressPercentage: Number,     // computed from tasks
  daysRemaining: Number,          // computed field
  
  requirements: [{
    item: String,
    status: enum['needed', 'arranged', 'done'],
    assignedTo: ObjectId
  }],
  
  timeline: [{
    date: Date,
    milestone: String,
    completed: Boolean
  }],
  
  activityLog: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  _id: ObjectId,
  event: ObjectId,                // parent event
  title: String,
  description: String,
  
  assignedTo: ObjectId,           // User
  assignedBy: ObjectId,           // User (faculty/admin)
  
  status: enum['todo', 'in_progress', 'done', 'blocked'],
  priority: enum['low', 'medium', 'high', 'critical'],
  
  dueDate: Date,
  completedAt: Date,
  
  subtasks: [{
    title: String,
    completed: Boolean,
    completedAt: Date
  }],
  
  comments: [{
    author: ObjectId,
    text: String,
    createdAt: Date
  }],
  
  attachments: [String],          // Cloudinary URLs
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Log Model
```javascript
{
  _id: ObjectId,
  event: ObjectId,
  user: ObjectId,
  action: String,                 // "marked task complete", "approved event", etc.
  details: Object,
  timestamp: Date                 // "February 20, 2026, 10:42 AM"
}
```

---

## 🎨 UI/UX Design Philosophy

### Design Principles
The SCA EMS is built on four core design tenets:

1. **White Space is Premium** — Generous padding and breathing room communicate professionalism and reduce cognitive load
2. **Typography Hierarchy** — Playfair Display for display headings, Inter for body — creates visual rhythm that guides the eye naturally
3. **Motion with Purpose** — Every animation serves a function: fade-ins draw attention, progress rings communicate data, hover effects confirm interactivity
4. **Consistent Depth** — Subtle shadows (`shadow-sm` to `shadow-lg`) create natural Z-axis layering without visual noise

### Colour Palette

```css
/* Primary */
--white:        #FFFFFF;    /* Backgrounds */
--slate-50:     #F8FAFC;    /* Subtle section backgrounds */
--slate-100:    #F1F5F9;    /* Cards, inputs */
--slate-800:    #1E293B;    /* Primary text */
--slate-900:    #0F172A;    /* Headings */

/* Accent */
--blue-600:     #2563EB;    /* Primary CTA, links */
--blue-50:      #EFF6FF;    /* Hover states */

/* Status */
--amber-500:    #F59E0B;    /* Pending */
--emerald-500:  #10B981;    /* Approved / Complete */
--blue-500:     #3B82F6;    /* In Progress */
--red-500:      #EF4444;    /* Overdue / Cancelled */
--slate-400:    #94A3B8;    /* Completed (muted) */
```

### Typography Scale

```css
/* Display */
font-family: 'Merriweather', serif;        /* Event titles, hero text, all headings */
font-family: 'Open Sans', sans-serif;      /* All UI, body, navigation, buttons */
font-family: 'DM Mono', monospace;         /* IDs, dates, badges, code */

/* Sizes (Tailwind) */
text-5xl / text-6xl  → Hero headings
text-3xl / text-4xl  → Page headings
text-xl / text-2xl   → Section headings
text-base / text-lg  → Body text
text-sm              → Labels, metadata
text-xs              → Badges, timestamps
```

---

## ✨ Animation System

The SCA EMS uses **Anime.js** as its primary animation engine, supplemented by **Framer Motion** for React component-level transitions.

### Custom Cursor & Mouse Effects

```javascript
// src/animations/mouseTracker.js
// Magnetic cursor that tracks mouse with elastic easing
// Particle trail that fades out over 800ms
// Hover state: cursor expands and inverts colour over interactive elements

const cursor = anime({
  targets: '.custom-cursor',
  translateX: mouseX,
  translateY: mouseY,
  duration: 150,
  easing: 'easeOutElastic(1, 0.5)',
  update: () => { /* continuous tracking */ }
});
```

### Fade In / Fade Out Sections

```javascript
// src/animations/fadeAnimations.js
// Intersection Observer triggers fade-in as sections enter viewport
// Staggered children: each card/item fades in 80ms after the previous

const fadeInSection = anime({
  targets: '.fade-section',
  opacity: [0, 1],
  translateY: [24, 0],
  duration: 600,
  easing: 'easeOutCubic',
  delay: anime.stagger(80)
});
```

### Progress Ring Animation

```javascript
// src/animations/progressAnimations.js
// Circular SVG progress rings animate from 0 to actual value on mount
// Duration scales with value: 100% = 1200ms, 50% = 600ms

anime({
  targets: '.progress-ring-circle',
  strokeDashoffset: [circumference, dashOffset],
  duration: progressPercentage * 12,
  easing: 'easeInOutQuart'
});
```

### Page Transitions

All route changes trigger a white-fade transition using Framer Motion:

```javascript
// Entry: opacity 0 → 1, translateY 12 → 0, duration 400ms
// Exit:  opacity 1 → 0, translateY 0 → -12, duration 300ms
// Easing: easeInOutQuad
```

### Countdown Timer Animation

```javascript
// Animated number flip when days-remaining changes
// Red pulsing glow when ≤ 3 days remaining
// Green static badge when event is completed
```

---

## 🔄 Event Lifecycle

```
DRAFT ──────→ PENDING APPROVAL ──────→ APPROVED ──────→ IN PROGRESS ──────→ COMPLETED
  ↑                  │                     │                  │
  │              (rejected)          (cancelled)          (blocked)
  └──────────────────┘
       Faculty revises & resubmits

Stage 1: DRAFT
  - Faculty creates event with all details
  - Can add tasks, requirements, timeline
  - Not visible to admin until submitted

Stage 2: PENDING APPROVAL
  - Faculty submits event for review
  - Admin receives notification in dashboard
  - Admin can view full event details, task plan, requirements

Stage 3: APPROVED / REJECTED
  - Admin approves → Event moves to calendar, faculty notified
  - Admin rejects → Faculty notified with reason, can revise

Stage 4: IN PROGRESS
  - Auto-transitions when start date arrives
  - Tasks can now be marked complete by assigned users
  - Progress percentage updates in real-time

Stage 5: COMPLETED
  - All tasks marked done OR manual completion by faculty
  - Event archived in faculty's "completed events" count
  - Superadmin sees in analytics
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/v1/auth/faculty-login      # Verify Firebase token (faculty)
POST   /api/v1/auth/admin-login        # Email/password login (admin, superadmin, student)
POST   /api/v1/auth/logout
GET    /api/v1/auth/me                 # Get current user profile
```

### Events
```
GET    /api/v1/events                  # All events (role-filtered)
GET    /api/v1/events/:id              # Single event with full details
POST   /api/v1/events                  # Create event (faculty)
PUT    /api/v1/events/:id              # Update event (faculty — own only)
PATCH  /api/v1/events/:id/approve      # Approve event (admin/superadmin)
PATCH  /api/v1/events/:id/reject       # Reject event (admin/superadmin)
DELETE /api/v1/events/:id              # Delete event (superadmin only)
GET    /api/v1/events/upcoming         # Next 14 days events (for login popup)
GET    /api/v1/events/analytics        # Progress analytics (admin+)
```

### Tasks
```
GET    /api/v1/events/:id/tasks        # All tasks for an event
POST   /api/v1/events/:id/tasks        # Create task
PUT    /api/v1/tasks/:taskId           # Update task
PATCH  /api/v1/tasks/:taskId/complete  # Mark task complete
POST   /api/v1/tasks/:taskId/assign    # Assign student to task
DELETE /api/v1/tasks/:taskId           # Delete task
```

### Users
```
GET    /api/v1/users                   # All users (admin+)
GET    /api/v1/users/faculty           # All faculty with event stats (admin+)
GET    /api/v1/users/:id               # User profile
PATCH  /api/v1/users/:id/role          # Change user role (superadmin)
PATCH  /api/v1/users/:id/approve       # Approve faculty registration (admin+)
```

---

## 🚢 Deployment

### Frontend — Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
npm run build
vercel --prod
```

Set all `VITE_*` environment variables in the Vercel project dashboard.

### Backend — Railway

```bash
# Connect repository to Railway
# Set all server environment variables in Railway dashboard
# Railway auto-deploys on push to main branch
```

### Docker (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Services started:
# → MongoDB: port 27017
# → Backend API: port 5000
# → Frontend: port 5173
```

### Production Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas IP whitelist updated (or set to `0.0.0.0/0` for Vercel)
- [ ] Firebase authorised domains include production URL
- [ ] Superadmin seed script run on production database
- [ ] CORS origin updated to production frontend URL
- [ ] Rate limiting configured
- [ ] SSL/TLS certificate verified

---

## 🧪 Scripts

### Frontend
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Production build to /dist
npm run preview    # Preview production build locally
npm run lint       # ESLint check
npm run lint:fix   # Auto-fix lint errors
```

### Backend
```bash
npm run dev        # Start with nodemon (hot reload)
npm run start      # Production start
npm run seed       # Seed all demo data
npm run seed:superadmin  # Seed only superadmin account
npm run lint       # ESLint check
```

---

## 🔒 Security

- **Firebase ID tokens** verified server-side on every protected request
- **Role middleware** enforces permission checks at route level — UI hiding alone is insufficient
- **Rate limiting** — 100 requests per 15 minutes per IP (configurable)
- **Helmet.js** — Sets 11 security-related HTTP headers automatically
- **Input validation** — All request bodies validated with Zod before processing
- **Environment secrets** — Never committed; managed via `.env` files (gitignored)
- **MongoDB injection** — Prevented by Mongoose schema type enforcement
- **CORS** — Restricted to configured frontend origin in production

---

## 🤝 Contributing

This project is maintained by the **SCA Tech Team at LPU**. For internal contributors:

1. Clone the repo and create a feature branch: `git checkout -b feature/your-feature-name`
2. Follow the established code style (ESLint + Prettier config included)
3. Write meaningful commit messages: `feat: add student assignment modal`
4. Open a pull request targeting `main` with a description of changes
5. Await review from at least one senior team member before merging

### Commit Convention
```
feat:     New feature
fix:      Bug fix
style:    UI/styling changes
refactor: Code restructuring
docs:     Documentation updates
chore:    Build, dependencies, config
```

---

## 📄 License

```
MIT License

Copyright (c) 2026 School of Computer Applications — Lovely Professional University

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

<br/>

**Built with ❤️ by the MCA Student**  
*Lovely Professional University — Phagwara, Punjab*  
*February 2026*

<br/>

<img src="https://img.shields.io/badge/Made%20for-LPU%20SCA-1a1a2e?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Year-2026-2563EB?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Status-Active%20Development-10B981?style=for-the-badge"/>

<br/><br/>

*"Organise every event with clarity, accountability, and zero confusion."*

</div>
