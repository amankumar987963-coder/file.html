# CIMAGE GROUP OF INSTITUTIONS Online Exam Portal - Frontend

This is the frontend for the online examination portal for CIMAGE GROUP OF INSTITUTIONS students.

## Features

- Student login with Student ID and Password
- Responsive design for mobile and desktop
- Exam timer with auto-submit on completion
- Multiple question types (MCQ, True/False, Short Answer)
- Randomized question order per student
- Auto-save answers to LocalStorage every 5 seconds
- Offline support with Service Worker (PWA)
- Security measures to detect tab switching and prevent copy/paste

## File Structure

```
frontend/
├── index.html          # Login page
├── exam.html           # Exam interface
├── result.html         # Result display
├── css/
│   └── style.css       # Responsive styling
├── js/
│   ├── auth.js         # Authentication helpers
│   ├── exam.js         # Exam functionality
│   └── result.js       # Result display
├── sw.js               # Service Worker for offline support
└── manifest.json       # PWA manifest
```

## How to Run Locally

1. Clone or download this repository
2. Open `index.html` in your browser directly, or
3. Serve the files using a local server:

### Using Python (if installed):
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Using Node.js (if installed):
```bash
npx serve
```
Then open `http://localhost:3000` in your browser.

## Login Credentials (Demo Mode)

Since this is a frontend-only demo, any Student ID and Password combination will work:
- Student ID: `student123`
- Password: `password123`

## Browser Support

For full functionality, use a modern browser that supports:
- LocalStorage
- Service Workers
- Fetch API
- Promise

## Security Features

- Tab switching detection (visibilitychange API)
- Right-click disabled
- Copy/paste/cut disabled
- Warning banner on violations

## Offline Support

The application works offline thanks to the Service Worker:
- Pages are cached on first visit
- Users can continue taking exams even without internet
- Results are stored locally until connection is restored