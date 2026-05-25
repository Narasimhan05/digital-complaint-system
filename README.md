# 🛡️ Digital Complaint Management System

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=white)

An enterprise-grade Complaint Management System with **SLA rules**, **automatic escalation**, **role-based access control**, and **real-time notifications**.

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 📝 **Raise Complaints** | Users can submit complaints with title, description, category, and priority |
| 📊 **Admin Dashboard** | Real-time statistics with charts showing complaint distribution |
| 👥 **Assign & Manage** | Admins assign complaints to team members and track progress |
| ⏰ **SLA Escalation** | Automatic escalation if complaints aren't resolved within 48 hours |
| 🔔 **Notifications** | Log-based or email notifications on status changes |
| 🔐 **JWT Authentication** | Secure login with role-based access (USER / ADMIN) |
| 📜 **Audit Trail** | Complete status change history with timestamps |
| 📖 **Swagger API Docs** | Interactive API documentation at `/swagger-ui.html` |

## 🔄 Complaint Flow

```
RAISED → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
              ↑             |
              └─────────────┘ (can return to IN_PROGRESS)
```

**SLA Rule:** If a complaint is not resolved within **48 hours**, it is automatically escalated by a scheduled job.

---

## 🧰 Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.5
- **Security:** Spring Security 6 + JWT (JJWT 0.12.5)
- **Database:** Spring Data JPA + MySQL 8.0
- **Scheduler:** Spring `@Scheduled` for SLA escalation
- **API Docs:** SpringDoc OpenAPI (Swagger)
- **Validation:** Jakarta Bean Validation

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT interceptors
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

---

## 📁 Project Structure

```
DigitalComp/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/digitalcomp/
│   │   ├── config/             # Swagger config
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── enums/              # Role, Status, Category, Priority
│   │   ├── exception/          # Global exception handler
│   │   ├── repository/         # JPA repositories
│   │   ├── scheduler/          # SLA escalation job
│   │   ├── security/           # JWT + Spring Security
│   │   └── service/            # Business logic
│   ├── Dockerfile              # Multi-stage Docker build
│   └── pom.xml
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── api/                # Axios instance + endpoints
    │   ├── components/         # Reusable UI components
    │   ├── context/            # Auth context (JWT)
    │   └── pages/              # All page components
    ├── vercel.json             # Vercel SPA routing
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0

### Backend

```bash
# 1. Create MySQL database
mysql -u root -p -e "CREATE DATABASE digital_complaints;"

# 2. Navigate to backend
cd backend

# 3. Run Spring Boot
mvn spring-boot:run
```

The API will start at `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

The app will start at `http://localhost:5173`

---

## ☁️ Deployment

### Backend → Render.com

1. Push code to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Connect your repo, set root directory to `backend`
4. Set runtime to **Docker**
5. Add environment variables:
   - `SPRING_DATASOURCE_URL` — Aiven MySQL JDBC URL
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET` — strong random string
   - `ALLOWED_ORIGINS` — your Vercel URL

### Database → Aiven MySQL

1. Create free MySQL service at [aiven.io](https://aiven.io)
2. Copy the JDBC connection string
3. Set it as `SPRING_DATASOURCE_URL` in Render

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your Render backend URL + `/api`

---

## 📡 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/register-admin` | Register admin |

### Complaints (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Raise complaint |
| GET | `/api/complaints` | Get user's complaints |
| GET | `/api/complaints/{id}` | Get complaint details |
| GET | `/api/complaints/{id}/history` | Get status history |

### Admin (ADMIN role only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/complaints` | Get all complaints |
| PUT | `/api/admin/complaints/{id}/assign` | Assign complaint |
| PUT | `/api/admin/complaints/{id}/status` | Update status |
| GET | `/api/admin/dashboard` | Get statistics |
| GET | `/api/admin/users` | List all users |

---

## 🔑 Default Test Accounts

After starting, register via the API or UI:

**Admin:**
```json
POST /api/auth/register-admin
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123"
}
```

**User:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "user123"
}
```

---

## 📄 License

This project is built for educational and portfolio purposes.
