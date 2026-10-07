# ServeHub — Community Service Management Portal
> **Academic Full-Stack Project | 3rd-Year IT / Computer Science**

ServeHub is a modern, responsive web application connecting local community needs with civic volunteers and organized services. Users can discover verified community assistance, submit service requests, register for local drives, and track their participation with an automated, rule-based **Community Impact Score**.

---

## 🌟 Key Features

1. **3-Tier Role-Based Architecture:**
   * **Citizen / User:** Discover community services, request assistance, register for events, and track status.
   * **Volunteer:** Browse opportunities, submit volunteer applications, log verified civic hours, and view real-time Impact Scores.
   * **Administrator:** Complete oversight of users, services CRUD, event scheduling, request approvals/rejections, and Recharts analytics.

2. **Standout Feature — Rule-Based Community Impact Score:**
   * Computed automatically:
     $$\text{Impact Score} = (\text{Completed Activities} \times 10) + (\text{Volunteer Hours} \times 2)$$
   * Gamifies and rewards community participation without complex black-box AI algorithms.

3. **ACID Transaction-Based Event Registrations:**
   * Uses MySQL `START TRANSACTION ... FOR UPDATE ... COMMIT / ROLLBACK` to enforce capacity limits and prevent race conditions or double bookings.

4. **Accessible & Ethical UI/UX:**
   * Designed with **Plus Jakarta Sans** typography, WCAG AAA compliant contrast, Lucide SVG icons, responsive cards, and Recharts interactive analytics.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React, Recharts.
* **Backend:** Node.js, Express.js (REST API, ES Modules).
* **Database:** MySQL 8 / 9 (InnoDB engine, foreign keys, cascade rules, indexes).
* **Security:** JWT (JSON Web Tokens), bcryptjs password hashing, Helmet security headers, CORS, parameterized SQL queries.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+ or v20+)
* **MySQL Server** (v8.0+ or v9.7, running on port `3306`)

---

### Step 1: Clone & Configure Database
1. Open your terminal in the project directory.
2. Ensure your MySQL server is running.
3. Import the database schema and seed data:
   ```powershell
   # In PowerShell (Windows):
   Get-Content backend/src/db/schema.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p
   Get-Content backend/src/db/seed.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p
   ```
4. Verify your database password in [`backend/.env`](file:///c:/Users/ycher/Desktop/WT_PRO/backend/.env):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=community_portal_db
   DB_PORT=3306
   JWT_SECRET=servehub_super_secret_jwt_key_2026
   ```

---

### Step 2: Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs at:* **`http://localhost:5000`**

---

### Step 3: Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at:* **`http://localhost:5173`**

---

## 👥 Demo Accounts (Viva Presentation Ready)

The application includes one-click login buttons on the `/login` page for fast demonstration:

| Role | Email | Password | What to Demo |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@servehub.org` | `Password@123` | Dashboard analytics, moderation tables, creating services/events, and logging volunteer hours. |
| **Volunteer** | `sarah.volunteer@servehub.org` | `Password@123` | **Community Impact Score (72+ pts)**, hours chart, applying for open volunteer positions. |
| **Citizen (User)** | `alex.citizen@servehub.org` | `Password@123` | Requesting services, registering for upcoming events, checking notifications. |

---

## 🎓 Viva Questions & Key Explanations

### Q1: Why did you choose a 3-tier architecture instead of microservices?
> *"For a practical academic platform, 3-tier architecture provides clear separation of concerns (Presentation, Business Logic, and Data Tier) without the deployment complexity, network latency, and orchestration overhead of microservices."*

### Q2: How do you prevent SQL Injection?
> *"Every single query executes through parameterized SQL placeholders (`?`) using `mysql2/promise`. User inputs are never concatenated directly into query strings."*

### Q3: How do you prevent overbooking in event registration?
> *"We execute registrations within a MySQL transaction with row-level locking (`SELECT ... FOR UPDATE`). We atomically check if `available_slots > 0`, insert the registration record, and decrement `available_slots` within the same transaction. If an error occurs, the entire transaction rolls back."*

### Q4: How is the Community Impact Score calculated?
> *"It uses a clear rule-based formula: $(\text{Activities} \times 10) + (\text{Hours} \times 2)$. When the administrator logs verified hours for a volunteer, the system automatically sums verified activities and hours, evaluates the formula, and updates the volunteer's profile and tier."*
