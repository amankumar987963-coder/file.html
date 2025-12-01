const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage
let users = [];
let exams = [];
let questions = [];
let submissions = [];

// Initialize with sample data
function initializeData() {
    // Create student users 1-10 with passwords a-j
    for (let i = 1; i <= 10; i++) {
        users.push({
            id: `student_${i}`,
            studentId: String(i),
            name: `Student ${i}`,
            password: String.fromCharCode(96 + i), // a, b, c, ... j
            role: 'student'
        });
    }
    
    // Add admin user
    users.push({
        id: 'admin_1',
        studentId: 'admin',
        name: 'Admin User',
        password: 'admin123',
        role: 'admin'
    });
    
    // Create sample exams
    exams = [
        {
            id: 'exam_1',
            name: 'Mathematics Exam',
            duration: 60,
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isActive: true,
            createdAt: new Date()
        },
        {
            id: 'exam_2',
            name: 'English Exam',
            duration: 45,
            startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            isActive: true,
            createdAt: new Date()
        }
    ];
    
    // Create sample questions
    questions = [
        { id: 'q1', examId: 'exam_1', type: 'mcq', question: 'What is 2+2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
        { id: 'q2', examId: 'exam_1', type: 'mcq', question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 'Paris' },
        { id: 'q3', examId: 'exam_1', type: 'truefalse', question: 'The Earth is flat.', correctAnswer: 'False' },
        { id: 'q4', examId: 'exam_1', type: 'truefalse', question: 'Water boils at 100°C at sea level.', correctAnswer: 'True' },
        { id: 'q5', examId: 'exam_1', type: 'shortanswer', question: 'What is the chemical symbol for gold?', correctAnswer: 'Au' },
        { id: 'q6', examId: 'exam_2', type: 'mcq', question: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 'Pacific' },
        { id: 'q7', examId: 'exam_2', type: 'mcq', question: 'What is the plural of cat?', options: ['cats', 'cates', 'cat\'s', 'catz'], correctAnswer: 'cats' },
        { id: 'q8', examId: 'exam_2', type: 'truefalse', question: 'Light travels faster than sound.', correctAnswer: 'True' },
        { id: 'q9', examId: 'exam_2', type: 'shortanswer', question: 'What is the square root of 144?', correctAnswer: '12' },
        { id: 'q10', examId: 'exam_2', type: 'mcq', question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'CO2', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Nitrogen' }
    ];
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { studentId, password } = req.body;
    
    const user = users.find(u => u.studentId === studentId && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
        { id: user.id, studentId: user.studentId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    res.json({
        token,
        user: {
            id: user.id,
            studentId: user.studentId,
            name: user.name,
            role: user.role
        }
    });
});

// Heartbeat
app.post('/api/auth/heartbeat', authMiddleware, (req, res) => {
    res.json({ status: 'alive', message: 'Session is still active' });
});

// Get exams
app.get('/api/exams', authMiddleware, (req, res) => {
    res.json(exams);
});

// Create exam
app.post('/api/exams', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const { name, duration, startTime, endTime } = req.body;
    const exam = {
        id: `exam_${Date.now()}`,
        name,
        duration,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
        createdAt: new Date()
    };
    exams.push(exam);
    res.status(201).json(exam);
});

// Get exam by ID
app.get('/api/exams/:id', authMiddleware, (req, res) => {
    const exam = exams.find(e => e.id === req.params.id);
    if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
});

// Update exam
app.put('/api/exams/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const exam = exams.find(e => e.id === req.params.id);
    if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
    }
    
    Object.assign(exam, req.body);
    res.json(exam);
});

// Delete exam
app.delete('/api/exams/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const index = exams.findIndex(e => e.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Exam not found' });
    }
    
    exams.splice(index, 1);
    res.json({ message: 'Exam deleted' });
});

// Get questions
app.get('/api/questions', authMiddleware, (req, res) => {
    const { examId } = req.query;
    if (!examId) {
        return res.status(400).json({ message: 'examId required' });
    }
    
    let result = questions.filter(q => q.examId === examId);
    
    // Randomize for students
    if (req.user.role === 'student') {
        result = result.sort(() => Math.random() - 0.5);
    }
    
    res.json(result);
});

// Create question
app.post('/api/questions', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const { examId, type, question, options, correctAnswer } = req.body;
    const q = {
        id: `q_${Date.now()}`,
        examId,
        type,
        question,
        options: options || [],
        correctAnswer
    };
    questions.push(q);
    res.status(201).json(q);
});

// Get question by ID
app.get('/api/questions/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const question = questions.find(q => q.id === req.params.id);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
});

// Update question
app.put('/api/questions/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const question = questions.find(q => q.id === req.params.id);
    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }
    
    Object.assign(question, req.body);
    res.json(question);
});

// Delete question
app.delete('/api/questions/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    const index = questions.findIndex(q => q.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Question not found' });
    }
    
    questions.splice(index, 1);
    res.json({ message: 'Question deleted' });
});

// Submit exam
app.post('/api/submissions', authMiddleware, (req, res) => {
    const { examId, answers, timeTaken, violations } = req.body;
    
    // Calculate score
    const examQuestions = questions.filter(q => q.examId === examId);
    let score = 0;
    
    examQuestions.forEach(question => {
        if (answers[question.id] === question.correctAnswer) {
            score++;
        }
    });
    
    const percentage = Math.round((score / examQuestions.length) * 100);
    
    const submission = {
        id: `sub_${Date.now()}`,
        userId: {
            id: req.user.id,
            studentId: req.user.studentId
        },
        examId: {
            id: examId,
            name: exams.find(e => e.id === examId)?.name || 'Unknown'
        },
        score: percentage,
        timeTaken,
        violations: violations || 0,
        createdAt: new Date()
    };
    
    submissions.push(submission);
    res.json(submission);
});

// Get submissions
app.get('/api/submissions', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(submissions);
});

// Export CSV
app.get('/api/submissions/export/csv', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    
    let csv = 'Student ID,Name,Exam,Score,Time Taken (seconds),Violations,Submitted At\n';
    
    submissions.forEach(sub => {
        csv += `"${sub.userId.studentId}","${users.find(u => u.id === sub.userId.id)?.name || 'Unknown'}","${sub.examId.name}","${sub.score}%","${sub.timeTaken}","${sub.violations}","${sub.createdAt}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    res.send(csv);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error' });
});

// 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Initialize data and start server
initializeData();

app.listen(PORT, () => {
    console.log(`\n✓ Server is running on port ${PORT}`);
    console.log(`\n📚 Test Credentials:`);
    console.log(`   Student IDs: 1-10 with passwords a-j`);
    console.log(`   Admin: admin / admin123\n`);
});
