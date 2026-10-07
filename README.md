# Daycraft 🚀

**Daycraft** is a modern, full-stack daily productivity and discipline application built with React (Vite), Node.js, Express, and MySQL. It goes beyond a simple to-do list by implementing an authentic streak and discipline system based on **successful days**, **streak freezes with accountability penalties**, and **milestone badges**.

---

## 🌟 Key Features

1. **Daily Action Planner & Categorization**
   - Create, edit, and delete daily tasks.
   - Categorize into **Professional**, **Entertainment**, and **Hobby / Habit**.
   - Prioritize tasks: **High**, **Medium**, and **Low**.
   - Filter by category and completion status.
   - Date picker to view and plan tasks for past or future days.

2. **Genuine Streak System**
   - Streaks are awarded for **successful days** (hitting your target task quota, e.g., 3 tasks/day), not just checking a single box.
   - Tracks **Current Streak**, **Longest Streak**, **Successful Days**, and **Missed Days**.
   - Handles consecutive calendar days properly.

3. **Two-Tier Streak Freeze Shield**
   - **Normal Freeze**:
     - Protects your streak after missing a day so it doesn't reset to zero.
     - **Penalty**: The following day requires **2 additional tasks** to be considered successful.
   - **Pro Freeze**:
     - Earned automatically by crushing **10 tasks in a single day**.
     - Protects your streak with **zero extra-task penalty**!
   - Tracks available and used inventory with full audit logs.

4. **Discipline Badges & Celebrations**
   - Master catalog of badges seeded in MySQL:
     - 🎯 **First Step**: First completed task
     - 🏆 **Getting Started**: 3 successful days
     - 🔥 **Week Warrior**: 7-day unbroken streak
     - 🛡️ **Two Week Discipline**: 14-day unbroken streak
     - 👑 **Consistency**: 30-day streak milestone
     - ⚡ **Task Master**: 50 total completed tasks
     - 🥇 **Hundred Club**: 100 total completed tasks
     - ✨ **Perfect Day**: Completed 100% of scheduled tasks in a day
     - 🎯 **Ten Strong**: Completed 10 tasks in one single day (awards Pro Freeze!)
   - Visual celebration toasts and confetti on unlocks.

5. **Security & Data Isolation**
   - Passwords hashed using `bcryptjs`.
   - Stateless `JWT` authentication.
   - Protected Express routes with JWT middleware.
   - Complete data isolation: users can only view and mutate their own tasks, logs, and freezes.
   - Parameterized MySQL queries preventing SQL injection.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, JavaScript, Custom Responsive CSS, Lucide Icons, Canvas Confetti
- **Backend:** Node.js (ES Modules), Express.js, `mysql2/promise`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`
- **Database:** MySQL 8.0+
- **Version Control:** Git

---

## 📁 Project Structure

```
DayCraft/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── taskController.js     # Task CRUD and toggle
│   │   ├── streakController.js   # Streak stats and freeze activation
│   │   ├── badgeController.js    # Badges catalog and progress
│   │   └── statsController.js    # Dashboard summary and analytics
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── streakRoutes.js
│   │   ├── badgeRoutes.js
│   │   └── statsRoutes.js
│   ├── services/
│   │   ├── streakService.js      # Streak algorithm & freeze penalty logic
│   │   └── badgeService.js       # Badge evaluation service
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express entrypoint
├── database/
│   ├── schema.sql                # Complete schema & badges seed script
│   └── init-db.js                # Automatic database setup script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── FreezeModal.jsx
│   │   │   └── CelebrationToast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── BadgesPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js            # REST API client
│   │   ├── App.jsx
│   │   ├── index.css             # Teal theme & responsive styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json                  # Root scripts
└── README.md
```

---

## ⚙️ Prerequisites & Setup

### 1. Configure Environment Variables
Inside `backend/`, copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=daycraft

# JWT
JWT_SECRET=daycraft_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
```

### 2. Initialize the MySQL Database
You can initialize the database using the automated script:
```bash
cd backend
npm run db:init
```
*(Or alternatively, import `database/schema.sql` into MySQL Workbench or MySQL CLI: `mysql -u root -p < database/schema.sql`)*

### 3. Run the Backend & Frontend

**Option A — Running both from separate terminals:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000`.

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 🧪 Testing Checklist

- [ ] **Registration**: Create a new account with a chosen daily target (e.g., 3 tasks).
- [ ] **Starter Freezes**: Check Profile to verify 2 welcome Normal Freezes were granted.
- [ ] **First Task Badge**: Create and check off 1 task — see the "First Step" badge unlock with confetti!
- [ ] **Categories & Priorities**: Add tasks under Professional, Entertainment, and Hobby/Habit with High/Medium/Low priority.
- [ ] **Daily Target & Progress**: Mark 3 tasks completed to see the progress bar hit 100% and today's day secured.
- [ ] **History & Freeze**: View the History page, inspect logged outcomes, and test protecting a missed day.
- [ ] **Pro Freeze Challenge**: Complete 10 tasks in one day to unlock the "Ten Strong" badge and earn a Pro Freeze.
