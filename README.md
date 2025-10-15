# Attendance Management System (Class Attendance System / Attendance Modules)

A full‑stack Database Management System for managing classes, students, teachers, attendance, results, and simple dashboards. The project uses React + Vite on the frontend and Node.js + Express + MongoDB (via Mongoose) on the backend.

## Features

- Authentication with JWT and role‑based access (admin, teacher, student)
- Admin dashboard: classes, students, attendance stats, quick actions
- Teacher tools: view assigned classes, mark/view attendance, manage results, view timetable
- Student tools: view enrolled classes and personal attendance
- CRUD APIs for Classes, Attendance, Teachers, Results
- Responsive UI styled with Tailwind CSS

## Tech Stack

- Frontend: React 18, React Router, Axios, Tailwind CSS, Vite
- Backend: Node.js, Express.js, JWT, bcryptjs, dotenv, CORS
- Database: MongoDB with Mongoose ODM

## Project Structure

```
project/
  README.md
  package.json
  vite.config.ts
  tailwind.config.js
  index.html
  postcss.config.js
  src/
    main.jsx
    App.jsx
    index.css
    components/
      Dashboard.jsx
      Teachers.jsx
      TeacherAttendanceView.jsx
      TeacherResultsView.jsx
      TeacherTimetable.jsx
      Attendance.jsx
      Classes.jsx
      Students.jsx
      CreateStudent.jsx
      ...
    contexts/
      AuthContext.jsx
  server/
    server.js
    seedAdmin.js
    middleware/
      auth.js
    models/
      User.js
      Class.js
      Attendance.js
      Result.js
    routes/
      auth.js
      classes.js
      students.js
      attendance.js
      teachers.js
      results.js
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB running locally (default: `mongodb://localhost:27017`)

## Environment Variables

Create a `.env` file in `project/` with at least:

```
PORT=5000
JWT_SECRET=replace-with-a-long-random-string
MONGODB_URI=mongodb://localhost:27017/class-attendance
```

Notes:

- `server/server.js` currently connects to `mongodb://localhost:27017/class-attendance` by default. If you need to use `MONGODB_URI`, update the connection string in `server/server.js` or keep the default.
- `server/seedAdmin.js` already reads `MONGODB_URI` and falls back to the local default.

## Install & Run (Dev)

From the `project` folder:

```cmd
cd "D:\Attendance modules\project"
npm install
npm run dev
```

This runs client and server together via `concurrently`:

- Client (Vite): http://localhost:5173
- API Server (Express): http://localhost:5000

If `concurrently` has issues on your system, run them separately:

```cmd
npm run server
```

Open a second terminal:

```cmd
npm run client
```

## Seed an Admin User

Create or reset the default admin user (`admin` / `admin123`):

```cmd
node server\seedAdmin.js
```

The script will connect to `MONGODB_URI` if set, or default to `mongodb://localhost:27017/class-attendance`.

## API Overview

Most endpoints require a JWT in the `Authorization` header: `Bearer <token>`.

### Attendance (`server/routes/attendance.js`)

- `POST /api/attendance` — Mark/Upsert attendance (admin or assigned teacher)
- `GET  /api/attendance/class/:classId` — Get class attendance (admin or enrolled student)
- `GET  /api/attendance/student/:studentId` — Get a student’s attendance (admin or the student)
- `GET  /api/attendance/stats/:classId` — Aggregated stats for a class
- `GET  /api/attendance/today/count` — Count of today’s attendance (admin only)

### Classes (`server/routes/classes.js`)

- `POST /api/classes` — Create class (admin)
- `GET  /api/classes` — List classes (filtered by role)
- `GET  /api/classes/:id` — Class details
- `POST /api/classes/:id/enroll` — Enroll a student (admin)
- `PUT  /api/classes/:id` — Update class (admin)
- `PUT  /api/classes/:id/assign-teacher` — Assign a teacher (admin)
- `GET  /api/classes/teacher/:teacherId` — Classes for a teacher

### Teachers (`server/routes/teachers.js`)

- `POST /api/teachers` — Create teacher (admin)
- `GET  /api/teachers` — List teachers (admin)
- `PUT  /api/teachers/:id/assign` — Assign classes to teacher (admin)
- `PUT  /api/teachers/:id/timetable` — Update timetable (admin)
- `GET  /api/teachers/:id` — Teacher details (admin or self)
- `GET  /api/teachers/:id/classes` — Teacher’s assigned classes (with students)

### Results (`server/routes/results.js`)

- `POST /api/results` — Create/Update result (admin or teacher)
- `GET  /api/results/class/:classId` — Results for a class (role-filtered)
- `GET  /api/results/student/:studentId` — Results for a student (admin/teacher/student)

### Auth (`server/routes/auth.js`)

- Login/registration endpoints (JWT issuance). See file for details.

## Frontend Routes (React Router)

See `src/App.jsx`.

- Public: `/login`
- Protected Shell: wraps everything in `Layout`
- Admin:
  - `/dashboard`
  - `/classes`
  - `/students`
  - `/attendance`
  - `/create-student`
  - `/teachers`
- Student:
  - `/my-classes`
  - `/my-attendance`
- Teacher specific views:
  - `/teachers/:id/attendance`
  - `/teachers/:id/results`
  - `/teachers/:id/timetable`

## Build & Preview (Frontend)

```cmd
npm run build
npm run preview
```

The API server (`npm run server`) must be running for API calls to work during preview.

## Security Notes

- Passwords are hashed with `bcryptjs` before storage
- JWT-based authentication with role checks in middleware
- CORS enabled for local development

## Troubleshooting (Windows)

- ENOENT for `package.json` when running from the wrong directory:

  - Make sure you are inside the `project` folder: `cd "D:\Attendance modules\project"`

- `concurrently` or `npm` PATH issues:

  - Try running client and server separately (`npm run server`, `npm run client`)
  - Ensure Node.js LTS is installed and `npm -v` works in a new terminal
  - If you see errors referencing `python.exe\scripts` or `node-gyp`, repair your Node/npm install or remove global npm prefix misconfigs

- MongoDB connection errors:
  - Ensure MongoDB is running locally or update connection settings in `server/server.js`

## Useful Scripts

- Start dev (both): `npm run dev`
- Start server only: `npm run server`
- Start client only: `npm run client`
- Seed admin: `node server\seedAdmin.js`

## License

This project is provided for educational purposes. You may adapt and extend it as needed for your coursework.

<img width="1901" height="932" alt="Screenshot 2025-10-15 071105" src="https://github.com/user-attachments/assets/26f214a0-a559-4a9b-911c-84dc509eb304" />
<img width="1901" height="932" alt="Screenshot 2025-10-15 071105" src="https://github.com/user-attachments/assets/5932d533-3f1c-46d9-ad1d-31d11eb3d9f5" />
<img width="1886" height="918" alt="Screenshot 2025-10-15 071121" src="https://github.com/user-attachments/assets/afba3396-1433-4c71-ab05-62d46d25b161" />
<img width="1886" height="917" alt="Screenshot 2025-10-15 071158" src="https://github.com/user-attachments/assets/332941bd-dc48-4089-97de-149f434fa9a2" />
<img width="1878" height="919" alt="Screenshot 2025-10-15 071249" src="https://github.com/user-attachments/assets/0652cbdb-2703-4f3f-9b7c-d9af97d0abd9" />
<img width="1883" height="932" alt="Screenshot 2025-10-15 071302" src="https://github.com/user-attachments/assets/992efa96-d5d2-438d-9f44-85f03768ee6f" />
<img width="1884" height="928" alt="Screenshot 2025-10-15 071311" src="https://github.com/user-attachments/assets/5831881d-4450-4e10-99dc-c7b49fadd0eb" />
<img width="1760" height="938" alt="Screenshot 2025-10-15 072711" src="https://github.com/user-attachments/assets/0054d359-aa22-41e2-92f2-f0d70cfc34d7" />
<img width="1761" height="934" alt="Screenshot 2025-10-15 072729" src="https://github.com/user-attachments/assets/2b88fd81-93ba-4957-973b-24b2277b9f41" />



