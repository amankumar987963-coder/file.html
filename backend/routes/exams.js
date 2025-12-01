const express = require('express');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

const router = express.Router();

// Create exam (admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { name, duration, startTime, endTime } = req.body;
        
        // Validate input
        if (!name || !duration || !startTime || !endTime) {
            return res.status(400).json({ message: 'Please provide all exam details' });
        }
        
        // Create exam
        const exam = new Exam({
            name,
            duration,
            startTime: new Date(startTime),
            endTime: new Date(endTime)
        });
        
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams
router.get('/', auth, async (req, res) => {
    try {
        const exams = await Exam.find().sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update exam (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { name, duration, startTime, endTime, isActive } = req.body;
        
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { name, duration, startTime, endTime, isActive },
            { new: true, runValidators: true }
        );
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json(exam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete exam (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const exam = await Exam.findByIdAndDelete(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
