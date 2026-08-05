# Smart College Lost & Found System

A modern, responsive, and professional full-stack web application for colleges where students, faculty, and administrators can report, search, claim, and manage lost items.

## Technologies Used

* **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide React, Chart.js
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JSON Web Tokens (JWT)
* **File Storage**: Local Storage with Multer
* **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js (v18 or v20 recommended)
- MongoDB running locally, OR Docker & Docker Compose

## Quick Start (Docker)

The easiest way to run the application is using Docker Compose:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Manual Setup

### 1. Backend Setup

```bash
cd server
npm install
```

Ensure MongoDB is running locally. Check `server/.env` to confirm the `MONGO_URI`.

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

## Features

- **Authentication**: Role-based access control (Student, Admin).
- **Report Items**: Dedicated forms for reporting lost or found items with image uploads.
- **Claims System**: Users can submit claims for found items with proof, which admins can approve/reject.
- **Dark Mode**: Fully supported Antigravity-themed dark and light modes.
- **Dashboard**: Overview of user statistics and recent activity.

## Further Development

The scaffolding for all necessary routes and models is provided. To extend:
- Implement AI matching heuristics in `itemController.js`.
- Connect real email services (e.g. Nodemailer) to the notification hooks in `claimController.js`.
- Add Cloudinary integration in `middleware/upload.js` for production scale storage.
