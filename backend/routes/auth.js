const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Student/Admin Login
router.post('/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        // Validate input
        if (!studentId || !password) {
            return res.status(400).json({ message: 'Please provide Student ID and Password' });
        }
        
        // Find user
        const user = await User.findOne({ studentId });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                studentId: user.studentId,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register (for creating initial admin user)
router.post('/register', async (req, res) => {
    try {
        const { studentId, name, password, role } = req.body;
        
        // Validate input
        if (!studentId || !name || !password) {
            return res.status(400).json({ message: 'Please provide Student ID, Name, and Password' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ studentId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create user
        const user = new User({
            studentId,
            name,
            password,
            role: role || 'student'
        });
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                studentId: user.studentId,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Heartbeat endpoint to keep session alive
router.post('/heartbeat', auth, async (req, res) => {
    try {
        res.json({ status: 'alive', message: 'Session is still active' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;