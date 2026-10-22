# Faculty Anonymous Feedback & Performance Analytics System

A comprehensive, competition-ready, full-stack web application developed for the **Rapid Web Challenge**. Built using **React + TypeScript + Vite + Tailwind CSS** on the frontend and **Node.js + Express** on the backend, running on **100% local mock data** with strict, privacy-preserving **Anti-Identity Architecture**.

---

## 🔒 Core Privacy & Security Architecture

The cardinal rule of this application is **complete anonymity of student feedback**:
1. **Identity-Stripping Ingestion (`POST /api/feedback`)**: Even if a student is authenticated, the backend automatically drops `studentId`, `studentName`, `email`, `phone`, and user identity before appending the record to `/backend/data/feedback.json`.
2. **Anonymous Receipt Token**: Students receive a one-way UUID receipt confirming submission without linking back to their user account.
3. **Duplicate Submission Protection**: A client-side anonymous session token (`x-anonymous-token`) combined with subject-session hashing prevents multiple submissions for the same course while strictly preserving anonymity.
4. **Faculty Dashboard Shield**: Faculty members can **only** see their own aggregated performance statistics (e.g. overall rating, parameter breakdown, total response counts, synthesized strengths/improvement themes). Raw feedback records, individual ratings, student identities, and timestamps that could reveal identity are **inaccessible to faculty** by backend RBAC enforcement.
5. **Role-Based Authorization (RBAC)**: Enforced via JWT tokens on both frontend routes and backend controller middleware. Students cannot call faculty or admin endpoints; faculty cannot call admin endpoints or access raw feedback tables.
6. **Local Rule-Based Sentiment Analysis**: Categorizes constructive remarks into *Positive*, *Neutral*, or *Needs Attention* completely locally without transmitting data to external third-party AI APIs.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Start the Backend API Server
```bash
cd backend
npm install
node server.js
```
*Backend runs at: `http://localhost:5000`*
*Health check: `http://localhost:5000/api/health`*

### 2. Start the Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 👥 Authorized Credentials

On the login page (`http://localhost:5173/login`), enter the credentials below:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Student** | `student1` | `student123` | Submit anonymous evaluations, rate 8 parameters, get anonymous receipt |
| **Faculty / Sir** | `faculty1` | `faculty123` | View own aggregated performance, 8 parameters, trends, PDF summary (ZERO student identity) |
| **High Authority / Admin** | `admin` | `admin123` | Institutional dashboard, 7 KPIs, 8 analytics charts, filterable anonymous logs, PDF & CSV export, configurable threshold |

---

## 🎯 Step-by-Step Judge Demonstration Workflow

Judges can verify the entire end-to-end feedback loop in under 2 minutes:

1. **Step 1: Login as Student**
   - Open `http://localhost:5173/login`.
   - Click the **Student** demo login card (`student1` / `student123`).
   - Observe the privacy shield banner on the student dashboard.
   - Click **Submit Feedback** in the sidebar or card.

2. **Step 2: Submit Anonymous Feedback**
   - Select Program: e.g. `Silver Oak College of Computer Application (SOCCA) — B.Sc. Data Science` or `Silver Oak College of Engineering & Technology (SOCET) — B.Tech. AI & Machine Learning`
   - Select Semester: e.g. `Semester 3` or `Semester 4`
   - Select Subject: e.g. `1010043201 - Foundations of Programming and Problem-Solving`
   - Select Faculty: e.g. `Prof. Deepa Shah` or `Dr. Arvind Sharma`
   - Rate the **8 Teaching Parameters** from 1 to 5 stars (Subject Knowledge, Clarity, Communication, Engagement, Punctuality, Doubt Resolution, Practical Examples, Overall Satisfaction).
   - Enter constructive remarks under *"What did the faculty do well?"* and *"What could be improved?"*.
   - Click **Submit Anonymous Feedback**.
   - Note the **Anonymous Receipt Token** on the success confirmation page.
   - Click **Logout**.

3. **Step 3: Login as Faculty & Verify Updated Aggregate Stats**
   - Click the **Faculty** demo card (`faculty1` / `faculty123`).
   - Observe that the **Total Anonymous Responses** count has incremented immediately.
   - Confirm that **NO student names, IDs, emails, or individual ratings** appear anywhere on the faculty dashboard.
   - Click **My Performance** in the sidebar to view:
     - 8-parameter progress bars
     - Longitudinal rating trend line chart
     - Subject-wise evaluation breakdown
     - AI-synthesized pedagogical strengths and improvement themes
     - Click **Download Performance Summary (PDF)** to verify the aggregated report.
   - Click **Logout**.

4. **Step 4: Login as High Authority / Admin**
   - Click the **High Authority** demo card (`admin` / `admin123`).
   - **System Overview**: Inspect the 7 institutional KPI cards, Faculty Rankings Leaderboard, Department Performance bar chart, and Rating Distribution chart.
   - **Faculty Directory**: Filter by department/category, click on any faculty card to open the **Deep-Dive Drawer** with parameter breakdown, AI sentiment tags, and authorized anonymous comment excerpts.
   - **Deep Analytics**: View all **8 required analytical charts**:
     1. Faculty Average Rating
     2. Department Average Rating
     3. Subject Average Rating
     4. Parameter-wise Institutional Averages
     5. Semester-wise Satisfaction Rating
     6. Feedback Volume by Semester
     7. Rating Star Distribution
     8. Longitudinal Satisfaction Trend
   - **Reports & Logs**: Filter anonymous comments by faculty, semester, or rating; download institutional **PDF Executive Report** and **CSV Report**.
   - **System Settings**: Modify the **Minimum Response Threshold for Ranking** (e.g. change to 3 or 10) and observe immediate recalculation of the "Insufficient Responses" classification across rankings.

---

## 🏛️ Curriculum & Reference Structure

Modeled after publicly available **B.Sc. Data Science** curriculum standards from Silver Oak University:
- **Core Subjects**: Python Programming I & II, DBMS Principles, Principles of Data Science, Mathematical Foundations, Tableau Visualization, Artificial Intelligence, Statistical Methods, Flutter Interface Design, etc.
- **Departments**: Computer Application, Data Science & Analytics, Information Technology.
- **Roster**: Over 10 realistic faculty profiles, 20+ curriculum subjects, and 60+ pre-seeded anonymous feedback records.

---

## 🛠️ Technology Stack & Project Structure

### Frontend (`/frontend`)
- **React 19 + TypeScript**: Type-safe, component-driven UI
- **Vite 6**: Lightning-fast dev server and production bundler
- **Tailwind CSS v3**: Clean, responsive, glassmorphic university design system
- **Recharts**: Interactive SVG charts (Bar, Line, Pie)
- **Lucide React**: Modern iconography
- **jsPDF & jspdf-autotable**: Client-side, formatted executive PDF reports

### Backend (`/backend`)
- **Node.js + Express**: RESTful API architecture
- **JWT & BCrypt**: Role-based authentication and secure token handling
- **Local JSON Storage**: File-based persistence in `/backend/data/` (zero external DB dependency)
- **Local Sentiment Analyzer**: Rule-based lexicon for comment tone classification

### File Directory Layout
```
FEEDBACK/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── facultyController.js
│   │   └── studentController.js
│   ├── data/
│   │   ├── faculty.json
│   │   ├── feedback.json
│   │   ├── programs.json
│   │   ├── settings.json
│   │   ├── subjects.json
│   │   └── users.json
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── faculty.js
│   │   └── student.js
│   ├── services/
│   │   ├── analyticsService.js
│   │   └── sentimentService.js
│   ├── server.js
│   └── test_e2e_flow.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── SidebarLayout.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Faculty.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── faculty/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Performance.tsx
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── FeedbackForm.tsx
│   │   │   │   └── Success.tsx
│   │   │   └── Login.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

---

## 📡 REST API Specifications

| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token and user info |
| `GET` | `/api/programs` | Student / Public | List academic programs |
| `GET` | `/api/semesters?program={id}` | Student / Public | Get semesters for program |
| `GET` | `/api/subjects?program={id}&semester={n}` | Student / Public | Get mapped subjects |
| `GET` | `/api/faculty?subjectId={id}` | Student / Public | Get faculty teaching the subject |
| `POST` | `/api/feedback` | Student | Submit feedback (student identity stripped before store) |
| `GET` | `/api/faculty/me` | Faculty | Get logged-in faculty profile and assigned subjects |
| `GET` | `/api/faculty/me/performance` | Faculty | Get own aggregate ratings, parameters, trend, themes |
| `GET` | `/api/admin/dashboard` | Admin | Get system KPIs, rankings, department averages |
| `GET` | `/api/admin/faculty` | Admin | Get list of all faculty with aggregate scores |
| `GET` | `/api/admin/faculty/:id/detail` | Admin | Get faculty deep-dive, parameters, and comments |
| `GET` | `/api/admin/analytics` | Admin | Get data for all 8 institutional charts |
| `GET` | `/api/admin/feedback` | Admin | Search/filter anonymous comments and sentiment tags |
| `GET` | `/api/admin/reports/csv` | Admin | Download system CSV evaluation report |
| `GET` | `/api/admin/reports/json` | Admin | Get formatted report data for PDF generation |
| `GET` | `/api/admin/settings` | Admin | Retrieve system settings (minimum response threshold) |
| `POST` | `/api/admin/settings` | Admin | Update minimum response threshold for rankings |

---

## 🏆 Competition Compliance & Verification Checklist

- [x] Complete local mock data only — no private or real student credentials scraped.
- [x] 3 Role Login system with demo credentials clearly displayed and one-click quick login.
- [x] Complete Student Portal with dynamic Program -> Semester -> Subject -> Faculty dropdown cascade.
- [x] Evaluation across all 8 required parameters with 1-5 star rating and constructive comments.
- [x] **Anti-Identity Enforcement**: Student names, IDs, emails, and phone numbers are never stored in feedback records.
- [x] **Faculty Shield**: Faculty dashboard displays strictly aggregated numbers, averages, parameter progress bars, and high-level themes. Individual responses are blocked at API level.
- [x] **Admin Analytics**: 7 KPI cards, 8 rich analytics charts, ranking thresholds, filterable audit log, AI sentiment analysis, and PDF/CSV downloads.
- [x] **Minimum Response Threshold**: Configurable threshold (default 5) with automatic "Insufficient Responses" label.
- [x] **Responsive & Dark/Light Theme**: Glassmorphic UI with dark/light mode toggle on every dashboard.
- [x] **Automated E2E Verification**: End-to-end flow verified programmatically with automated tests.
