# 🔐 Workflow Management System – Backend API

> Production-ready, multi-tenant Workflow & Task Management REST API built with Spring Boot.
> Secure, scalable, and SaaS-ready architecture with JWT authentication, role-based access control, real-time SSE notifications, and email-based invite flows.

---

## 📌 Overview

This backend powers a **scalable multi-tenant SaaS system**:

- Users belong to one or more organizations with distinct roles per organization
- Organizations fully isolate their members, tasks, and data
- Security is enforced at both platform and organization levels
- Real-time in-app notifications delivered via Server-Sent Events (SSE)
- Email-based organization invite system with token validation and expiry
- Clean layered architecture following enterprise best practices

---

## 🏗️ Architecture

```
Controller → Service → Repository → Database
```

### Key Design Principles

- Multi-tenant SaaS architecture with per-org data isolation
- Stateless JWT authentication
- Role-Based Access Control (RBAC) at platform and organization levels
- Method-level security via `@PreAuthorize` and custom `OrgSecurity` bean
- Soft delete strategy across all entities
- Centralized exception handling via `@ControllerAdvice`
- Enum-driven domain modeling
- Audit timestamps for traceability

---

## 🛠️ Tech Stack

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| Java 17+          | Core language                  |
| Spring Boot 3.2   | Application framework          |
| Spring Security 6 | Authentication & authorization |
| JWT (JJWT)        | Stateless authentication       |
| Spring Data JPA   | ORM layer                      |
| Hibernate         | Persistence provider           |
| PostgreSQL        | Primary database               |
| JavaMailSender    | Transactional email delivery   |
| SSE (Spring MVC)  | Real-time push notifications   |
| Swagger/OpenAPI   | API documentation              |
| Maven             | Build tool                     |
| Lombok            | Boilerplate reduction          |

---

## 🧠 Domain Model

### 1️⃣ User (Platform Level)

Represents a registered user across the platform.

**Platform Roles:** `MASTER_ADMIN`, `USER`

- Unique email, BCrypt-encrypted password
- Soft delete support with audit timestamps
- Password change with current password verification

---

### 2️⃣ Organization

Represents a tenant workspace.

- Created and owned by a user
- Fully isolates members, tasks, and invites
- Supports soft delete (owner only)
- Name updates restricted to OWNER role

---

### 3️⃣ OrganizationMember

Maps users to organizations with org-scoped roles.

**Unique Constraint:** `(organization_id, user_id)`

**Organization Roles:**
| Role | Permissions |
|------|-------------|
| `OWNER` | Full control — manage org, members, tasks |
| `ADMIN` | Manage members, send invites, manage tasks |
| `MANAGER` | Approve/reject tasks, manage assigned tasks |
| `EMPLOYEE` | Create and manage own tasks |

---

### 4️⃣ Task

Represents a work item scoped to an organization.

**Key Fields:** Title, Description, Created By, Assigned To, Organization, Status, Priority, Rejection Reason, Soft delete, Timestamps

**TaskStatus flow:**

```
TO_DO → IN_PROGRESS → PENDING / COMPLETED → APPROVED / REJECTED
REJECTED → IN_PROGRESS
IN_PROGRESS → ON_HOLD / CANCELLED
APPROVED → ARCHIVED
```

**TaskPriority:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

---

### 5️⃣ OrgInvite

Email-based invite system for adding members to organizations.

- Unique token per invite (UUID)
- 48-hour expiry
- Tracks inviter (`invitedBy`) for notifications
- **Statuses:** `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`
- Email sent to invitee on creation
- Email sent to inviter on accept/decline

---

### 6️⃣ Notification

In-app notifications delivered in real time via SSE.

**Types:**
| Type | Trigger |
|------|---------|
| `TASK_ASSIGNED` | Task assigned to a user |
| `TASK_APPROVED` | Task creator's task was approved |
| `TASK_REJECTED` | Task creator's task was rejected (with reason) |
| `INVITE_ACCEPTED` | Invitee accepted the org invite |
| `INVITE_DECLINED` | Invitee declined the org invite |

---

## 🔐 Security Architecture

### Authentication

- JWT-based stateless authentication
- BCrypt password hashing
- Custom `JwtAuthenticationFilter` on every request
- Custom `AuthenticationEntryPoint` and `AccessDeniedHandler` for clean error responses

**Authorization Header:**

```
Authorization: Bearer <token>
```

### Authorization Levels

**Platform Level** — enforced via Spring Security  
**Organization Level** — enforced via custom `OrgSecurity` bean:

```java
@orgSecurity.isMember(#orgId, authentication)
@orgSecurity.isManagerOrAbove(#orgId, authentication)
@orgSecurity.hasRole(#orgId, T(...).OWNER, authentication)
```

### SSE Authentication

SSE connections cannot send custom headers. Token is passed as a query parameter (`?token=`) and validated manually in the controller before establishing the stream.

---

## 📡 Real-Time Notifications (SSE)

- Each authenticated user maintains a persistent SSE connection
- `NotificationService` maps `userId → SseEmitter` in memory
- On any notification event, the emitter pushes an updated unread count to the client instantly
- Emitters auto-cleanup on timeout, error, or disconnect
- Reconnect logic handled on the frontend (5s retry)

---

## 📧 Email Service

Transactional emails sent via `JavaMailSender`:

| Trigger            | Recipient |
| ------------------ | --------- |
| Org invite created | Invitee   |
| Invite accepted    | Inviter   |
| Invite declined    | Inviter   |

---

## ⚠️ Global Exception Handling

Centralized via `@ControllerAdvice`.

**Standard Error Response:**

```json
{
  "timestamp": "2026-03-09T10:15:30",
  "status": 404,
  "error": "Not Found",
  "message": "Organization not found"
}
```

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 400  | Validation Error                   |
| 401  | Unauthorized (Invalid/Missing JWT) |
| 403  | Forbidden (Insufficient role)      |
| 404  | Resource Not Found                 |
| 500  | Internal Server Error              |

---

## 📬 API Reference

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
```

### Users

```
GET  /users/me
PUT  /users/me
PUT  /users/me/password
```

### Organizations

```
POST   /organizations
PUT    /organizations/{orgId}          [OWNER]
DELETE /organizations/{orgId}          [OWNER]
GET    /organizations/{orgId}/dashboard/stats
GET    /organizations/{orgId}/dashboard/recent-tasks
```

### Organization Members

```
GET    /organization-members/user/{userId}
GET    /organization-members/organization/{orgId}
POST   /organization-members
PATCH  /organization-members/organization/{orgId}/user/{userId}/role
DELETE /organization-members/organization/{orgId}/user/{userId}
```

### Tasks

```
GET    /organizations/{orgId}/tasks
POST   /organizations/{orgId}/tasks
GET    /organizations/{orgId}/tasks/pending
PATCH  /organizations/{orgId}/tasks/{taskId}/status
PATCH  /organizations/{orgId}/tasks/{taskId}/assign
PATCH  /organizations/{orgId}/tasks/{taskId}/approve   [MANAGER+]
PATCH  /organizations/{orgId}/tasks/{taskId}/reject    [MANAGER+]
```

### Invites

```
POST /invites                    [ADMIN+]
GET  /invites/validate           [PUBLIC]
POST /invites/accept
POST /invites/decline
```

### Notifications

```
GET  /notifications/stream       [SSE — token via query param]
GET  /notifications/me
PUT  /notifications/{id}/read
PUT  /notifications/me/read-all
```

---

## ▶️ Running Locally

### 1. Clone Repository

```bash
git clone https://github.com/Anuj-Gupta79/workflow-management-system
cd workflow-management-system/backend
```

### 2. Configure `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/workflow_db
    username: your_username
    password: your_password
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_email@gmail.com
    password: your_app_password

jwt:
  secret: your_secret_key
  expiration: 86400000
```

### 3. Run

```bash
mvn spring-boot:run
```

Server starts at: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

---

## 🧩 Production-Ready Features

- Multi-tenant architecture with org-scoped data isolation
- Dual-level RBAC (platform + organization)
- Real-time SSE notification delivery
- Email-based invite flow with token expiry
- Secure password change with current password verification
- Soft delete across all entities
- Custom security bean for method-level org authorization
- Centralized exception handling with consistent error responses
- Swagger/OpenAPI documentation

---

## 🚀 Planned Improvements

- Refresh token mechanism
- Redis-backed SSE for horizontal scaling
- Pagination & sorting on task/member lists
- Audit logging
- Docker + Docker Compose setup
- CI/CD pipeline

---

## 👨‍💻 Author

**Anuj Gupta**  
Built with SaaS-grade architecture principles and production-ready backend standards.
