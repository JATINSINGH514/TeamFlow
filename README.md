# TeamFlow - Role-Based Project & Task Management System

## Project Overview
TeamFlow is a full-stack web application designed for managing projects, team members, and tasks with role-based access control (Admin/Member).

## Submission Information
- **Live URL**: [Replace with your Railway URL after deployment]
- **GitHub Repo**: https://github.com/JATINSINGH514/TeamFlow

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Chart.js
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose)
- **Authentication**: JWT & bcrypt

## Deployment Instructions (Railway)
This project is configured as a Monorepo for zero-config Railway deployment.
1. Create an account on [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository (`JATINSINGH514/TeamFlow`).
4. Railway will automatically detect the root `package.json`, build the frontend, and start the backend serving the static files!
5. *Optional*: Add the `MONGO_URI` and `JWT_SECRET` variables in the Railway "Variables" tab.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will start on port 5000.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```

## Next Steps
This project boilerplate contains the full backend API structure (Auth, Projects, Tasks) and the frontend Vite/React setup. 
To continue development, expand the frontend components inside `client/src/components` to integrate with the backend API endpoints.
