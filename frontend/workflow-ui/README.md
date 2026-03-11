# 💻 Workflow Management System – Frontend

> Modern, responsive Angular SaaS dashboard for multi-tenant workflow and task management.
> Features real-time SSE notifications, email-based invite flows, role-based UI, and a polished component architecture.

---

## 📌 Overview

The frontend delivers a complete SaaS dashboard experience:

- **Multi-tenant workspace switching** — users belong to multiple orgs, switch seamlessly from the navbar
- **Role-aware UI** — components adapt based on OWNER / ADMIN / MANAGER / EMPLOYEE
- **Real-time notifications** — live unread count via Server-Sent Events, no polling
- **Email invite flow** — invite members via link, accept/decline with full state handling
- **Task management** — create, assign, filter, approve, and reject tasks
- **Settings** — password change, org rename, org deletion with confirmation
- **Responsive design** — sidebar collapses on mobile, works across all screen sizes

---

## 🏗️ Architecture

```
src/app/
├── core/
│   └── auth/               # Guards (AuthGuard, OrgGuard, OnboardingGuard)
├── features/
│   ├── auth/               # Login, Signup, Forgot/Reset Password
│   ├── dashboard/          # Dashboard home, stats, recent tasks
│   ├── organization/       # Org select, Onboarding, Invite page
│   ├── tasks/              # Task list, Create task
│   ├── approvals/          # Pending task approvals
│   ├── members/            # Member list, invite panel
│   ├── profile/            # User profile
│   └── settings/           # Account, Organization, Appearance tabs
├── layout/
│   └── dashboard-layout/   # Navbar, Sidebar, Layout shell
│       └── services/       # CurrentOrgService, NotificationService
└── shared/
    └── components/
        └── toast/          # Global toast notification system
```

**Key Architectural Decisions:**

- **Standalone Components** throughout — no NgModules
- **RxJS BehaviorSubjects** for reactive shared state (active org, notifications)
- **CurrentOrgService** as the single source of truth for the active workspace
- **`takeUntil(destroy$)`** pattern for clean subscription management
- **`shareReplay({ bufferSize: 1, refCount: true })`** on shared data streams
- **JWT stored in localStorage** — resolved on every request via `HttpInterceptor`
- **Guard chain** on dashboard routes: `AuthGuard → OnboardingGuard → OrgGuard`

---

## 🛠️ Tech Stack

| Technology       | Purpose                                  |
| ---------------- | ---------------------------------------- |
| Angular 16       | Frontend framework (standalone APIs)     |
| TypeScript       | Type safety                              |
| RxJS             | Reactive state and async data management |
| Angular Router   | Client-side routing with guard chains    |
| HttpClient       | REST API integration with interceptors   |
| EventSource API  | SSE real-time notification stream        |
| CSS3 / Flex/Grid | Layout and component styling             |
| Material Icons   | Iconography                              |

---

## 🌐 Features

### Authentication

- Login, Signup, Forgot Password, Reset Password
- JWT stored in localStorage, attached to all requests via interceptor
- Invite-aware login/signup — preserves invite token through auth flow

### Onboarding

- New users are guided to create or join an organization before accessing the dashboard
- Guard prevents skipping onboarding

### Dashboard

- Org stats: total tasks, my tasks, completed, overdue, member count
- Recent tasks feed
- Quick actions: Create Task, New Workspace

### Tasks

- Full task list with status and priority filters
- Create task with optional assignee and priority
- Status transitions following defined workflow rules
- Assign tasks to org members
- Manager+ can approve or reject with optional reason

### Approvals

- Dedicated view for MANAGER+ to review PENDING tasks
- Approve / Reject with reason

### Members

- List all org members with roles
- Invite panel: send email invite with role selection (ADMIN+)
- Duplicate invite and already-member error handling
- Role display with color-coded badges

### Invite Flow

- Public invite page handles: loading → validation → wrong-user → accept/decline → success
- Wrong account detection: shows both emails, "Switch Account" clears JWT and redirects to login
- Invite token preserved through login and signup

### Settings

- **Account tab**: Change password with show/hide toggles and validation
- **Organization tab**:
  - OWNER: rename org, delete org (requires typing org name to confirm)
  - Non-owner: read-only view with role badge
- **Appearance tab**: Light/Dark theme selection (dark mode coming soon)

### Notifications (Real-Time SSE)

- Persistent SSE connection established on login, closed on logout
- Live unread badge on navbar bell — updates instantly without polling
- Notification dropdown: typed icons and colors per notification type
- Mark individual or all notifications as read
- Auto-reconnect on connection drop (5s retry)

### Toast System

- Global `ToastService` used across all features
- Success / Error / Info variants with auto-dismiss
- Slide-in animation, fixed bottom-right position

---

## 🔑 Role-Based UI

| Feature                | OWNER | ADMIN | MANAGER | EMPLOYEE |
| ---------------------- | ----- | ----- | ------- | -------- |
| Rename / Delete org    | ✅    | ❌    | ❌      | ❌       |
| Send invites           | ✅    | ✅    | ❌      | ❌       |
| Approve / Reject tasks | ✅    | ✅    | ✅      | ❌       |
| Assign tasks           | ✅    | ✅    | ✅      | ✅       |
| Create tasks           | ✅    | ✅    | ✅      | ✅       |

---

## 📂 Route Structure

```
/                          → Landing page
/login                     → Login
/signup                    → Signup
/forgot-password           → Forgot password
/reset-password            → Reset password
/onboarding                → Create first org   [AuthGuard]
/org-select                → Switch/create org   [AuthGuard, OnboardingGuard]
/invite                    → Invite accept/decline [PUBLIC]
/dashboard                 → Dashboard layout    [AuthGuard, OrgGuard, OnboardingGuard]
  /dashboard               → Home
  /dashboard/tasks         → Task list
  /dashboard/tasks/new     → Create task
  /dashboard/approvals     → Approvals
  /dashboard/members       → Members + invite
  /dashboard/profile       → Profile
  /dashboard/settings      → Settings
```

---

## ▶️ Running Locally

### 1. Clone Repository

```bash
git clone https://github.com/Anuj-Gupta79/workflow-management-system
cd workflow-management-system/frontend/workflow-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Dev Server

```bash
ng serve
```

Frontend runs at: `http://localhost:4200`  
Make sure the backend is running at: `http://localhost:8080`

---

## 🚀 Production-Ready Highlights

- Standalone component architecture (Angular 16 best practice)
- Reactive state management via BehaviorSubjects — no NgRx complexity
- Real-time SSE with automatic reconnect
- Full invite flow with cross-account detection
- Guard chain prevents unauthorized dashboard access
- Global toast system decoupled from components
- Clean subscription management with `takeUntil` + `destroy$`
- Consistent error handling across all API calls

---

## 👨‍💻 Author

**Anuj Gupta**  
Built with modern Angular best practices and SaaS-grade UX for multi-tenant applications.
