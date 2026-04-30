# TeamFlow - Role-Based Project & Task Management System

## Project Overview
TeamFlow is a full-stack web application designed for managing projects, team members, and tasks with role-based access control (Admin/Member).

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT & bcrypt

## Prerequisites
Before running this project, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or an Atlas URI)

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
