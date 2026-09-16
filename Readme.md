# Celarox Enterprise

> **A Web-based Dynamic Customizable Unified Business Management Platform** designed to help organizations launch, manage, and scale operations through interconnected business applications, autonomous workflows, real-time analytics, and secure document management.

[![Production Frontend](https://img.shields.io/badge/Frontend-https%3A%2F%2Fcelarox.com%2F-6366F1)](https://celarox.com/)
[![Production Backend](https://img.shields.io/badge/Backend-https%3A%2F%2Fcelarox.onrender.com%2F-10B981)](https://celarox.onrender.com/)
[![Database](https://img.shields.io/badge/Database-Neon%20Serverless%20PostgreSQL-00E599)](https://neon.tech/)
[![Email](https://img.shields.io/badge/Email-Brevo%20Transactional%20API-0B99FF)](https://www.brevo.com/)
[![Storage](https://img.shields.io/badge/Cloud%20Storage-Cloudinary%20CDN-3448C5)](https://cloudinary.com/)

---

## 🏛️ System Architecture

Celarox Enterprise brings together core operational business functions into a unified, high-performance platform with an Apple-grade dark theme design system (`#07090E` Obsidian palette), sub-millisecond data interactions, and multi-device support (Desktop, Tablet, iOS, and Android).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CELAROX ENTERPRISE UNIFIED UI                     │
│      (React Native Web / Expo SDK 57 • Desktop, Tablet & Mobile)        │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
               ▼                                           ▼
┌──────────────────────────────┐            ┌─────────────────────────────┐
│    PUBLIC & MARKETING PORTAL │            │ ENTERPRISE COMMAND CENTER   │
│  • Interactive App Demos     │            │  • Multi-tenant Workspaces  │
│  • Brevo Inquiry Dispatch    │            │  • Real-time KPI Telemetry  │
│  • Privacy Policy & Terms    │            │  • Cross-module Navigation  │
└──────────────┬───────────────┘            └──────────────┬──────────────┘
               │                                           │
               └───────────────────────┬───────────────────┘
                                       │ HTTPS / TLS 1.3
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DJANGO REST FRAMEWORK BACKEND CORE                    │
│            (Python 3.14 • SimpleJWT Auth • WhiteNoise • Render)          │
├──────────────┬───────────────┬──────────────┬─────────────┬─────────────┤
│     CRM      │   PROJECTS    │   FINANCE    │  DOCUMENTS  │  WORKFLOWS  │
│  • Pipelines │  • Kanban     │  • Invoices  │ • Cloudinary│ • Triggers  │
│  • Deals     │  • Sprints    │  • PDF Gen   │ • GDrive    │ • Event Bus │
│  • Contacts  │  • Tasks      │  • Expenses  │ • Versions  │ • Audit Log │
├──────────────┴───────────────┴──────────────┴─────────────┴─────────────┤
│         HR & TEAMS           │           FORMS & SUPPORT DESK           │
│  • Employee Directory        │  • Dynamic Schema Web Form Builder       │
│  • PTO Leave Approvals       │  • Customer SLA Support Ticket Queue     │
└──────────────┬───────────────┴──────────────┬───────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐   ┌──────────────────────────────────────┐
│ NEON SERVERLESS POSTGRESQL   │   │ THIRD-PARTY ENTERPRISE SERVICES      │
│  • Multi-Tenant Schema       │   │  • Brevo (no-reply / hello inbox)    │
│  • SSL Connection Pooling    │   │  • Cloudinary ("Celarox Enterprise") │
│  • High-Availability Replica │   │  • Google Workspace OAuth & Drive    │
└──────────────────────────────┘   └──────────────────────────────────────┘
```

---

## 🚀 Connected Enterprise Applications

### 1. 📊 Command Center & Dashboard
- Real-time revenue telemetry (MRR, Total Revenue, Active Pipeline Value).
- Interactive quick actions to create invoices, add contacts, open projects, and deploy automations.
- Recent activity audit feed and live system operational metrics.

### 2. 🤝 CRM & Revenue Pipeline
- Visual stage-based deal pipeline (`Lead`, `Qualified`, `Proposal`, `Negotiation`, `Closed Won`, `Closed Lost`).
- Deal value tracking with automated win-probability weighting and stage updates.
- Centralized Contacts directory and Enterprise Accounts database.

### 3. 📋 Operations & Project Sprints
- Portfolio project status management with budget tracking and progress bars.
- Sprint Kanban board (`Todo`, `In Progress`, `Review`, `Done`) with priority badges.
- Time tracking logs and sub-task checklists.

### 4. 💳 Finance, Invoices & Expenses
- Dynamic invoice builder with multi-line item calculations, tax rates, and discounts.
- Server-side pixel-perfect PDF invoice rendering via ReportLab.
- Automated electronic invoice dispatch to client billing contacts via Brevo.
- Business expense logging and client billing profile records.

### 5. 📁 Knowledge & Cloud Documents
- Cloud storage integration with Cloudinary (stored under `"Celarox Enterprise"` folder).
- Support for linked Google Drive and external cloud assets.
- Document versioning, tagging, and direct asset access.

### 6. ⚡ Workflows & Automations Engine
- Event-driven rule engine listening to system signals (`deal.won`, `invoice.paid`, `task.completed`, `form.submitted`).
- Multi-step action dispatchers with real-time execution audit logs.

### 7. 👥 HR & Team Hub
- Complete employee directory with department hierarchies and job roles.
- Employee PTO and medical leave request submission and approval workflows.
- Workspace-wide executive broadcast announcements.

### 8. 🎫 Dynamic Forms & Support Desk
- No-code dynamic form builder generating JSON-schema web forms and public endpoints.
- Customer support ticket queue with issue tracking, SLA priorities, and message threading.

### 9. 📈 Analytics & Strategic Intelligence
- Full-funnel sales conversion analysis and department expense allocation graphs.
- Autonomous intelligence suggestions based on platform performance metrics.

---

## 🔒 Security & Mail Architecture

- **Transactional Outgoing Emails:** Sent securely from `no-reply@celarox.com` via Brevo API.
- **Admin Inquiries / Contact Forms:** Dispatched to `hello@celarox.com` with `Reply-To` set dynamically to the customer's email address.
- **Authentication:** Custom Django SimpleJWT with refresh token rotation and Google OAuth 2.0 integration.
- **Database:** Serverless Neon DB PostgreSQL with strict SSL encryption (`sslmode=require`).
- **Isolation:** Multi-tenant workspace data isolation enforced at the Django ORM level via workspace foreign keys and middleware verification.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React Native Web / Expo SDK 57 (React 19.2, React Native 0.86) |
| **Frontend Language** | TypeScript |
| **Design System** | Custom Obsidian Design System (Lucide React Native, Expo Linear Gradient) |
| **Backend Framework** | Django 6.1+ / Django REST Framework |
| **Backend Language** | Python 3.14 |
| **Database** | Neon DB Serverless PostgreSQL |
| **PDF Generation** | ReportLab |
| **Object CDN Storage** | Cloudinary (`Celarox Enterprise` bucket folder) |
| **Email Service** | Brevo (Sendinblue API v3) |
| **SSO & Cloud Drive** | Google OAuth 2.0 & Google Drive API |
| **Frontend Hosting** | Vercel (`https://celarox.com/`) |
| **Backend Hosting** | Render (`https://celarox.onrender.com/`) |

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.11+ (or Python 3.14)
- Node.js 20+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/jasonkennethn/Celarox.git
cd Celarox
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations against Neon DB (or SQLite fallback)
python manage.py migrate

# Run backend unit & integration tests
python manage.py test apps.authentication apps.workspaces apps.crm apps.projects apps.finance apps.workflows apps.forms_support

# Start Django development server
python manage.py runserver 8000
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Type-check TypeScript
npx tsc --noEmit

# Start Expo Web development server
npm run web
```
The application will launch on `http://localhost:8081` (or `http://localhost:19006`).

---

## 🌐 Production Deployment

### Frontend (Vercel)
- Configured via `frontend/vercel.json`.
- Build Command: `npx expo export -p web`
- Output Directory: `dist`
- Target URL: [https://celarox.com/](https://celarox.com/)

### Backend (Render)
- Configured via `backend/render.yaml` and `backend/build.sh`.
- Build Command: `./build.sh`
- Start Command: `gunicorn celarox_core.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120`
- Target URL: [https://celarox.onrender.com/](https://celarox.onrender.com/)

---

## 📄 Legal & Compliance

- **Home Page:** [https://celarox.com/](https://celarox.com/)
- **Privacy Policy:** [https://celarox.com/privacy](https://celarox.com/privacy)
- **Terms of Service:** [https://celarox.com/terms](https://celarox.com/terms)

---

## 🏢 License

Copyright © 2026 Celarox Inc. All rights reserved.
