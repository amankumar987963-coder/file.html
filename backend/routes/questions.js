const express = require('express');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

const router = express.Router();

// Create question (admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { examId, type, question, options, correctAnswer } = req.body;
        
        // Validate input
        if (!examId || !type || !question || !correctAnswer) {
            return res.status(400).json({ message: 'Please provide all question details' });
        }
        
        // Validate exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(400).json({ message: 'Exam not found' });
        }
        
        // Create question
        const newQuestion = new Question({
            examId,
            type,
            question,
            options: options || [],
            correctAnswer
        });
        
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get questions for an exam (randomized for students)
router.get('/', auth, async (req, res) => {
    try {
        const { examId } = req.query;
        
        if (!examId) {
            return res.status(400).json({ message: 'Please provide examId' });
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
        
        // Get questions
        let questions = await Question.find({ examId });
        
        // Randomize questions for students (not for admins)
        if (req.user.role === 'student') {
            questions = questions.sort(() => Math.random() - 0.5);
        }
        
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get question by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // Only admins can view individual questions
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update question (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { examId, type, question, options, correctAnswer } = req.body;
        
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { examId, type, question, options, correctAnswer },
            { new: true, runValidators: true }
        );
        
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete question (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const question = await Question.findByIdAndDelete(req.params.id);
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;