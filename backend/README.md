# CIMAGE GROUP OF INSTITUTIONS Online Exam Portal - Backend

This is the backend API for the online examination portal for CIMAGE GROUP OF INSTITUTIONS students.

## Features

- User authentication with JWT
- Exam creation and scheduling
- Question management (MCQ, True/False, Short Answer)
- Submission handling with scoring
- CSV export of submissions
- Security measures (rate limiting, helmet)
- MongoDB integration with Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

1. Clone or download this repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp config/env.example .env
   ```
5. Update the `.env` file with your configuration:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   FRONTEND_URL=your_frontend_url
   PORT=5000
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Exams
- `POST /api/exams` - Create exam (admin only)
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `PUT /api/exams/:id` - Update exam (admin only)
- `DELETE /api/exams/:id` - Delete exam (admin only)

### Questions
- `POST /api/questions` - Create question (admin only)
- `GET /api/questions?examId=...` - Get questions for an exam
- `GET /api/questions/:id` - Get question by ID (admin only)
- `PUT /api/questions/:id` - Update question (admin only)
- `DELETE /api/questions/:id` - Delete question (admin only)

### Submissions
- `POST /api/submissions` - Submit exam answers
- `GET /api/submissions` - Get all submissions (admin only)
- `GET /api/submissions/:id` - Get submission by ID (admin only)
- `GET /api/submissions/export/csv` - Export submissions as CSV (admin only)

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `FRONTEND_URL` - Frontend application URL (for CORS)
- `PORT` - Server port (default: 5000)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth and submission endpoints
- Security headers with Helmet
- CORS restricted to frontend URL

## Data Models

### User
- studentId (unique)
- name
- password (hashed)
- role (student/admin)

### Exam
- name
- duration (in minutes)
- startTime
- endTime
- isActive

### Question
- examId (reference to Exam)
- type (mcq/truefalse/shortanswer)
- question
- options (array, for MCQ)
- correctAnswer

### Submission
- examId (reference to Exam)
- userId (reference to User)
- answers (array of questionId/answer pairs)
- score
- timeTaken (in seconds)
- violations