const express = require('express');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { Parser } = require('json2csv');

const router = express.Router();

// Submit exam answers
router.post('/', auth, async (req, res) => {
    try {
        const { examId, answers, timeTaken, violations } = req.body;
        
        // Validate input
        if (!examId || !answers || !timeTaken) {
            return res.status(400).json({ message: 'Please provide examId, answers, and timeTaken' });
        }
        
        // Validate exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(400).json({ message: 'Exam not found' });
        }
        
        // Check if exam is active
        const now = new Date();
        if (now < exam.startTime || now > exam.endTime) {
            return res.status(400).json({ message: 'Exam is not available at this time' });
        }
        
        // Get all questions for this exam
        const questions = await Question.find({ examId });
        
        // Calculate score
        let correctAnswers = 0;
        for (const answer of answers) {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            if (question && question.correctAnswer === answer.answer) {
                correctAnswers++;
            }
        }
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        
        // Create submission
        const submission = new Submission({
            examId,
            userId: req.user._id,
            answers,
            score,
            timeTaken,
            violations: violations || 0
        });
        
        await submission.save();
        
        res.status(201).json({
            submissionId: submission._id,
            score,
            correctAnswers,
            totalQuestions: questions.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all submissions (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const submissions = await Submission.find()
            .populate('userId', 'studentId name')
            .populate('examId', 'name')
            .sort({ createdAt: -1 });
        
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get submission by ID (admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const submission = await Submission.findById(req.params.id)
            .populate('userId', 'studentId name')
            .populate('examId', 'name');
        
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export submissions as CSV (admin only)
router.get('/export/csv', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const submissions = await Submission.find()
            .populate('userId', 'studentId name')
            .populate('examId', 'name')
            .sort({ createdAt: -1 });
        
        // Format data for CSV
        const csvData = submissions.map(submission => ({
            submissionId: submission._id,
            examName: submission.examId.name,
            studentId: submission.userId.studentId,
            studentName: submission.userId.name,
            score: submission.score,
            timeTaken: submission.timeTaken,
            violations: submission.violations,
            submittedAt: submission.createdAt
        }));
        
        // Convert to CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(csvData);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('submissions.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;