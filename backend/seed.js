const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

// Sample data
const users = [
    {
        studentId: '1',
        name: 'Student One',
        password: 'a',
        role: 'student'
    },
    {
        studentId: '2',
        name: 'Student Two',
        password: 'b',
        role: 'student'
    },
    {
        studentId: '3',
        name: 'Student Three',
        password: 'c',
        role: 'student'
    },
    {
        studentId: '4',
        name: 'Student Four',
        password: 'd',
        role: 'student'
    },
    {
        studentId: '5',
        name: 'Student Five',
        password: 'e',
        role: 'student'
    },
    {
        studentId: '6',
        name: 'Student Six',
        password: 'f',
        role: 'student'
    },
    {
        studentId: '7',
        name: 'Student Seven',
        password: 'g',
        role: 'student'
    },
    {
        studentId: '8',
        name: 'Student Eight',
        password: 'h',
        role: 'student'
    },
    {
        studentId: '9',
        name: 'Student Nine',
        password: 'i',
        role: 'student'
    },
    {
        studentId: '10',
        name: 'Student Ten',
        password: 'j',
        role: 'student'
    },
    {
        studentId: 'admin',
        name: 'Admin User',
        password: 'admin123',
        role: 'admin'
    }
];

const exams = [
    {
        name: 'Mathematics Exam',
        duration: 60, // 60 minutes
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started 1 day ago
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 1 week
        isActive: true
    },
    {
        name: 'English Exam',
        duration: 45, // 45 minutes
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // Started 12 hours ago
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Ends in 2 weeks
        isActive: true
    }
];

const questions = [
    {
        type: 'mcq',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris'
    },
    {
        type: 'mcq',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars'
    },
    {
        type: 'truefalse',
        question: 'The Earth is flat.',
        correctAnswer: 'False'
    },
    {
        type: 'truefalse',
        question: 'Water boils at 100°C at sea level.',
        correctAnswer: 'True'
    },
    {
        type: 'shortanswer',
        question: 'What is the chemical symbol for gold?',
        correctAnswer: 'Au'
    },
    {
        type: 'mcq',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4'
    },
    {
        type: 'mcq',
        question: 'Which is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswer: 'Pacific Ocean'
    },
    {
        type: 'truefalse',
        question: 'Light travels faster than sound.',
        correctAnswer: 'True'
    },
    {
        type: 'shortanswer',
        question: 'What is the square root of 144?',
        correctAnswer: '12'
    },
    {
        type: 'mcq',
        question: 'Which gas is most abundant in the Earth\'s atmosphere?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 'Nitrogen'
    }
];

const seedData = async () => {
    try {
        // Wait a bit for the connection to establish
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear existing data
        await User.deleteMany({});
        await Exam.deleteMany({});
        await Question.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Insert users
        await User.insertMany(users);
        console.log('Users inserted: ' + users.length);
        
        // Insert exams
        const insertedExams = await Exam.insertMany(exams);
        console.log('Exams inserted: ' + insertedExams.length);
        
        // Insert questions for both exams
        const mathQuestions = questions.slice(0, 5);
        const englishQuestions = questions.slice(5, 10);
        
        const mathQuestionsWithExamId = mathQuestions.map(q => ({ ...q, examId: insertedExams[0]._id }));
        const englishQuestionsWithExamId = englishQuestions.map(q => ({ ...q, examId: insertedExams[1]._id }));
        
        await Question.insertMany([...mathQuestionsWithExamId, ...englishQuestionsWithExamId]);
        console.log('Questions inserted');
        
        console.log('✓ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('Student IDs: 1-10 with passwords a-j');
        console.log('Admin: admin / admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedData();