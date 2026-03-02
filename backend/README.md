# 🔐 Workflow Management System – Backend API

> Production-ready, multi-tenant Workflow & Task Management REST API built using Spring Boot.

This backend provides secure organization-based task management with role-based access control (RBAC), JWT authentication, and clean SaaS-grade architecture.

---

## 📌 Overview

The Workflow Backend is designed as a scalable multi-tenant system where:

- Users belong to one or more organizations
- Organizations manage members with specific roles
- Tasks are isolated per organization
- Security is enforced at both platform and organization levels

The system follows clean architecture and enterprise best practices.

---

## 🏗️ Architecture

Layered Architecture:

Controller → Service → Repository → Database

### Key Design Principles

- Multi-tenant SaaS architecture
- Stateless JWT authentication
- Role-Based Access Control (RBAC)
- Soft delete strategy
- Global exception handling
- Enum-driven domain modeling
- Audit timestamps for traceability

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Java 17+ | Core language |
| Spring Boot | Application framework |
| Spring Security | Authentication & authorization |
| JWT | Stateless authentication |
| Spring Data JPA | ORM layer |
| Hibernate | Persistence provider |
| MySQL / PostgreSQL | Database |
| Maven | Build tool |
| Lombok | Boilerplate reduction |

---

## 🧠 Domain Model

### 1️⃣ User (Platform Level)

Represents a registered user.

**Platform Roles:**
- `MASTER_ADMIN`
- `USER`

Features:
- Unique email
- Encrypted password
- Soft delete support
- Audit timestamps

---

### 2️⃣ Organization

Represents a tenant workspace.

- Owned by a User
- Isolates members and tasks
- Soft delete supported

Each organization operates independently.

---

### 3️⃣ OrganizationMember

Maps Users to Organizations.

Unique Constraint:
```

(organization_id, user_id)

```

**Organization Roles:**
- `OWNER`
- `ADMIN`
- `MANAGER`
- `EMPLOYEE`

This enables fine-grained authorization within organizations.

---

### 4️⃣ Task

Represents a work item scoped to an organization.

Fields:
- Title
- Description
- Created By
- Assigned To
- Organization
- Status
- Priority
- Due Date
- Soft delete flag
- Audit timestamps

Enums:
- `TaskStatus`
- `TaskPriority`

---

## 🔐 Security Architecture

### Authentication

- JWT-based stateless authentication
- Custom JWT filter
- Password encryption using BCrypt

**Authorization Header:**
```

Authorization: Bearer <token>

````

---

### Authorization Levels

#### Platform Level
- MASTER_ADMIN
- USER

#### Organization Level
- OWNER
- ADMIN
- MANAGER
- EMPLOYEE

Access is enforced via Spring Security configuration and service-level validation.

---

## ⚠️ Global Exception Handling

Centralized using `@ControllerAdvice`.

### Standard Response Structure

```json
{
  "timestamp": "2026-03-02T10:15:30",
  "status": 404,
  "error": "Not Found",
  "message": "Organization not found"
}
````

### HTTP Status Codes

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 400  | Validation Error                   |
| 401  | Unauthorized (Invalid/Missing JWT) |
| 403  | Forbidden (Access Denied)          |
| 404  | Resource Not Found                 |
| 500  | Internal Server Error              |

---

## 🗄️ Database Design

### Key Concepts

* Soft delete instead of hard delete
* Enum-based role modeling
* Multi-tenant isolation via `organization_id`
* Unique constraints for integrity
* Audit fields (`createdAt`, `updatedAt`)

---

## 🌱 Development Seeder

The application includes a `CommandLineRunner` that seeds development data:

* Master Admin
* Sample Users
* Organization
* Organization Members
* Sample Tasks

Seeder Class:

```
DataInitializer
```

Runs automatically when the database is empty.

---

## 📬 API Modules

The backend exposes REST endpoints for:

```
/auth
/users
/organizations
/organization-members
/tasks
/password-reset
```

All secured endpoints require a valid JWT.

---

## ▶️ Running Locally

### 1️⃣ Clone Repository

```
git clone <repository-url>
cd backend
```

### 2️⃣ Configure Database

Update:

```
application.yml
```

Configure:

* Database URL
* Username
* Password

---

### 3️⃣ Run Application

```
mvn spring-boot:run
```

Server runs at:

```
http://localhost:8080
```

---

## 📊 Example Authentication Flow

### Login Request

```json
POST /auth/login
{
  "email": "owner@workflow.com",
  "password": "password"
}
```

### Login Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use token in subsequent requests.

---

## 🧩 Production-Ready Features

* Multi-tenant architecture
* Role hierarchy separation
* Secure password handling
* Centralized exception handling
* Soft delete implementation
* Clean entity relationships
* Consistent API responses
* Scalable domain modeling

---

## 🚀 Planned Improvements

* Refresh token mechanism
* Email-based organization invitations
* Swagger/OpenAPI documentation
* Pagination & sorting
* Advanced filtering
* Audit logging
* Redis caching
* Docker support

---

## 🧪 Testing Strategy (Recommended)

* Unit tests (Service layer)
* Integration tests (Controller + DB)
* Security tests (Authorization checks)

---

## 📎 Deployment Ready

This backend is designed to be:

* Docker-compatible
* Cloud deployable (AWS, Azure, GCP)
* CI/CD ready

---

## 👨‍💻 Author

Built with scalable SaaS backend architecture principles and production-readiness in mind.

```