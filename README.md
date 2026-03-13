Online Course and Learning Platform
===================================

This is a full-stack web application for managing online courses, built as a university project.

Stack:
- Backend: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT
- Frontend: React.js, React Router, Axios, HTML5, CSS3

## Project Structure

- `server/` - Node.js + Express REST API (MVC structure: `models/`, `controllers/`, `routes/`, `middleware/`, `config/`)
- `client/` - React SPA built with Vite (`pages/`, `components/`, `context/`, `api/`)

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account and connection string

## Backend Setup (`server`)

1. Install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create `.env` from the example:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:

   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = any strong random string
   - `PORT` = `5000` (or another port if you prefer)

4. Run the backend in development mode:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`.

## Frontend Setup (`client`)

1. Install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Start the React dev server:

   ```bash
   npm run dev
   ```

3. Open the printed URL (by default `http://localhost:5173`).\
   Vite is configured to proxy `/api` requests to the backend at `http://localhost:5000`.

## Main Features

- **Authentication & Roles**
  - JWT-based login and registration (`/api/auth/register`, `/api/auth/login`)
  - Roles: `student`, `instructor`, `admin`
  - Role-based route protection on both backend and frontend

- **Course Management**
  - Instructors create and manage courses with content (videos, PDFs, notes)
  - Students browse courses and view course details
  - Enrollments tracked with progress and completion flags

- **Payments (Simulated)**
  - Simulated payment gateway (`/api/payments`) records payments as `success`
  - Enrollment requires successful payment for paid courses

- **Assignments & Quizzes (Simplified)**
  - Instructors create assignments per course
  - Students submit answers; instructors can grade submissions

- **Certificates**
  - Certificates issued for completed courses and stored in `Certificates` collection
  - Students can view earned certificates on the Certificates page

- **Notifications & Admin**
  - Notifications stored and shown to users
  - Admin dashboard with high-level stats
  - Admin management panel to manage users, courses, and approve instructors

## MongoDB Collections (Schemas)

Implemented using Mongoose models:

- `User`:
  - `name`, `email`, `password`, `role (student|instructor|admin)`, `bio`, `approved`
- `Course`:
  - `title`, `description`, `instructor`, `price`, `content[]`, `isPublished`
- `Enrollment`:
  - `studentId`, `courseId`, `progress`, `completed`
- `Assignment`:
  - `courseId`, `title`, `questions[]`, `dueDate`
- `Submission`:
  - `studentId`, `assignmentId`, `fileUrl`, `answers`, `grade`, `feedback`
- `Payment`:
  - `studentId`, `courseId`, `amount`, `status`, `transactionId`
- `Certificate`:
  - `studentId`, `courseId`, `completionDate`, `certificateCode`
- `Notification`:
  - `userId`, `message`, `read`, timestamps

## Key API Endpoints (Summary)

Base URL: `/api`

- **Auth**
  - `POST /auth/register` – register as student or instructor
  - `POST /auth/login` – login and receive JWT

- **Users**
  - `GET /users/me` – get current profile
  - `PUT /users/me` – update profile
  - `GET /users` – list all users (admin)

- **Courses**
  - `GET /courses` – list published courses
  - `GET /courses/:id` – course details
  - `POST /courses` – create course (instructor/admin)
  - `GET /courses/instructor/me` – instructor's courses
  - `PUT /courses/:id` – update course (owner instructor/admin)
  - `DELETE /courses/:id` – delete course (owner instructor/admin)
  - `GET /courses/student/me/enrollments` – student enrollments

- **Enrollments**
  - `POST /enrollments` – enroll in a course (student)
  - `PUT /enrollments/:enrollmentId/progress` – update progress (student)

- **Assignments & Submissions**
  - `POST /assignments` – create assignment (instructor/admin)
  - `GET /assignments/course/:courseId` – list assignments for course
  - `POST /assignments/:assignmentId/submissions` – submit assignment (student)
  - `PUT /assignments/submissions/:submissionId/grade` – grade submission (instructor/admin)

- **Payments**
  - `POST /payments` – simulate payment for course (student)
  - `GET /payments/me` – student payments
  - `GET /payments` – all payments (admin)

- **Certificates**
  - `GET /certificates/me` – list student certificates
  - `POST /certificates` – issue certificate for completed course (student)

- **Notifications**
  - `GET /notifications/me` – my notifications
  - `PUT /notifications/:id/read` – mark as read
  - `POST /notifications` – create notification (admin/instructor)

- **Admin**
  - `GET /admin/stats` – platform statistics
  - `GET /admin/users` – manage users
  - `GET /admin/courses` – manage courses
  - `PUT /admin/instructors/:id/approve` – approve instructor

## Running the Full Stack

1. Start backend (in `server` folder): `npm run dev`
2. Start frontend (in `client` folder): `npm run dev`
3. Access the app in the browser, register users with different roles, and explore:
   - Student dashboard, enrollments, assignments, certificates
   - Instructor dashboard for creating courses
   - Admin dashboard and management panel


