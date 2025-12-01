// exam.js - Handle exam functionality including timer, navigation, and auto-save

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('examToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load exam data
    loadExamData();
});

async function loadExamData() {
    // For demo purposes, we'll use a hardcoded exam ID
    // In a real application, this would be passed from the login or exam selection page
    const examId = '64a8f8c2d9e8b42a3c7f1e90'; // Sample exam ID
    
    try {
        // Fetch questions from backend
        const response = await fetch(`${API_ENDPOINTS.QUESTIONS}?examId=${examId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('examToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load exam questions');
        }
        
        const questions = await response.json();
        
        // Initialize exam
        initializeExam(questions);
    } catch (error) {
        console.error('Error loading exam:', error);
        // Fallback to sample questions if backend is unreachable
        const sampleQuestions = [
            {
                _id: 1,
                type: 'mcq',
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 'Paris'
            },
            {
                _id: 2,
                type: 'mcq',
                question: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 'Mars'
            },
            {
                _id: 3,
                type: 'truefalse',
                question: 'The Earth is flat.',
                correctAnswer: 'False'
            },
            {
                _id: 4,
                type: 'truefalse',
                question: 'Water boils at 100°C at sea level.',
                correctAnswer: 'True'
            },
            {
                _id: 5,
                type: 'shortanswer',
                question: 'What is the chemical symbol for gold?',
                correctAnswer: 'Au'
            }
        ];
        
        initializeExam(sampleQuestions);
        
        // Show offline mode banner
        const warningBanner = document.getElementById('warning-banner');
        warningBanner.innerHTML = '<p>Working in offline mode. Some features may be limited.</p>';
        warningBanner.classList.remove('hidden');
    }
}

let questions = [];
let currentQuestionIndex = 0;
let examStartTime = null;
let examDuration = 30 * 60; // 30 minutes in seconds
let violationCount = 0;
let autoSaveInterval = null;
let timerInterval = null;
let heartbeatInterval = null;

function initializeExam(questionsData) {
    // Randomize question order
    questions = [...questionsData].sort(() => Math.random() - 0.5);
    
    // Store in localStorage
    localStorage.setItem('currentExam', JSON.stringify(questions));
    
    // Initialize answers array
    const answers = new Array(questions.length).fill(null);
    localStorage.setItem('examAnswers', JSON.stringify(answers));
    
    // Set exam start time
    examStartTime = Date.now();
    localStorage.setItem('examStartTime', examStartTime.toString());
    
    // Render first question
    renderQuestion(0);
    
    // Render question navigation
    renderQuestionNavigation();
    
    // Start timer
    startTimer();
    
    // Setup auto-save
    setupAutoSave();
    
    // Setup heartbeat
    setupHeartbeat();
    
    // Setup violation detection
    setupViolationDetection();
    
    // Disable right-click and copy/paste
    setupSecurityMeasures();
    
    // Setup navigation buttons
    setupNavigationButtons();
}

function renderQuestion(index) {
    const question = questions[index];
    const questionContainer = document.getElementById('question-content');
    const answers = JSON.parse(localStorage.getItem('examAnswers') || '[]');
    
    let html = `
        <div class="question-card">
            <div class="question-text">Question ${index + 1}: ${question.question}</div>
            <div class="options-container">
    `;
    
    if (question.type === 'mcq') {
        html += question.options.map((option, i) => `
            <div class="option ${answers[index] === option ? 'selected' : ''}" 
                 data-option="${option}" 
                 onclick="selectOption(${index}, '${option}')">
                ${String.fromCharCode(65 + i)}. ${option}
            </div>
        `).join('');
    } else if (question.type === 'truefalse') {
        html += `
            <div class="option ${answers[index] === 'True' ? 'selected' : ''}" 
                 data-option="True" 
                 onclick="selectOption(${index}, 'True')">
                A. True
            </div>
            <div class="option ${answers[index] === 'False' ? 'selected' : ''}" 
                 data-option="False" 
                 onclick="selectOption(${index}, 'False')">
                B. False
            </div>
        `;
    } else if (question.type === 'shortanswer') {
        html += `
            <textarea class="short-answer" 
                      placeholder="Enter your answer here..." 
                      oninput="updateShortAnswer(${index}, this.value)">${answers[index] || ''}</textarea>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    questionContainer.innerHTML = html;
    currentQuestionIndex = index;
    
    // Update active question button
    document.querySelectorAll('.question-btn').forEach((btn, i) => {
        btn.classList.remove('active');
        if (i === index) {
            btn.classList.add('active');
        }
    });
}

function selectOption(questionIndex, option) {
    const answers = JSON.parse(localStorage.getItem('examAnswers') || '[]');
    answers[questionIndex] = option;
    localStorage.setItem('examAnswers', JSON.stringify(answers));
    
    // Update UI
    renderQuestion(questionIndex);
    
    // Mark question as answered
    document.getElementById(`question-btn-${questionIndex}`).classList.add('answered');
}

function updateShortAnswer(questionIndex, value) {
    const answers = JSON.parse(localStorage.getItem('examAnswers') || '[]');
    answers[questionIndex] = value;
    localStorage.setItem('examAnswers', JSON.stringify(answers));
    
    // Mark question as answered if not empty
    const btn = document.getElementById(`question-btn-${questionIndex}`);
    if (value.trim() !== '') {
        btn.classList.add('answered');
    } else {
        btn.classList.remove('answered');
    }
}

function renderQuestionNavigation() {
    const navigationContainer = document.getElementById('question-buttons');
    
    navigationContainer.innerHTML = questions.map((_, index) => `
        <button class="question-btn" 
                id="question-btn-${index}" 
                onclick="renderQuestion(${index})">
            ${index + 1}
        </button>
    `).join('');
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - examStartTime) / 1000);
        const remaining = examDuration - elapsed;
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
            submitExam();
            return;
        }
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function setupAutoSave() {
    autoSaveInterval = setInterval(() => {
        // Auto-save is already handled by updating localStorage on each answer change
        // This interval is for periodic sync (could be extended to save to backend)
        console.log('Auto-saving answers...');
    }, 5000); // Every 5 seconds
}

function setupHeartbeat() {
    // Send heartbeat every 30 seconds to mark active session
    heartbeatInterval = setInterval(async () => {
        try {
            await fetch(API_ENDPOINTS.AUTH_HEARTBEAT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('examToken')}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Heartbeat failed:', error);
        }
    }, 30000); // Every 30 seconds
}

function setupViolationDetection() {
    violationCount = parseInt(localStorage.getItem('violationCount') || '0');
    document.getElementById('violation-count').textContent = violationCount;
    
    // Detect visibility change (tab switch/minimize)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            violationCount++;
            localStorage.setItem('violationCount', violationCount.toString());
            document.getElementById('violation-count').textContent = violationCount;
            
            // Show warning banner
            const warningBanner = document.getElementById('warning-banner');
            warningBanner.classList.remove('hidden');
            
            // Hide warning after 5 seconds
            setTimeout(() => {
                warningBanner.classList.add('hidden');
            }, 5000);
        }
    });
}

function setupSecurityMeasures() {
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showSecurityWarning('Right-click is disabled');
        return false;
    });
    
    // Disable copy/paste
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showSecurityWarning('Copy is disabled');
        return false;
    });
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        showSecurityWarning('Cut is disabled');
        return false;
    });
    
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        showSecurityWarning('Paste is disabled');
        return false;
    });
    
    // Setup beforeunload warning
    window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = '';
        return 'Are you sure you want to leave? Your exam progress may be lost.';
    });
}

function showSecurityWarning(message) {
    // Create warning element if it doesn't exist
    let warning = document.getElementById('security-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'security-warning';
        warning.className = 'warning-banner';
        document.body.appendChild(warning);
    }
    
    warning.textContent = message;
    warning.classList.remove('hidden');
    
    // Hide warning after 3 seconds
    setTimeout(() => {
        warning.classList.add('hidden');
    }, 3000);
}

function setupNavigationButtons() {
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            renderQuestion(currentQuestionIndex - 1);
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) {
            renderQuestion(currentQuestionIndex + 1);
        }
    });
    
    document.getElementById('submit-btn').addEventListener('click', function() {
        submitExam();
    });
}

async function submitExam() {
    clearInterval(timerInterval);
    clearInterval(autoSaveInterval);
    clearInterval(heartbeatInterval);
    
    // Get answers from localStorage
    const answers = JSON.parse(localStorage.getItem('examAnswers') || '[]');
    
    // Format answers for submission
    const formattedAnswers = answers.map((answer, index) => ({
        questionId: questions[index]._id,
        answer: answer || ''
    }));
    
    const timeTaken = Math.floor((Date.now() - examStartTime) / 1000);
    
    try {
        // Submit answers to backend
        const response = await fetch(API_ENDPOINTS.SUBMISSIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('examToken')}`
            },
            body: JSON.stringify({
                examId: questions[0].examId || '64a8f8c2d9e8b42a3c7f1e90', // Sample exam ID
                answers: formattedAnswers,
                timeTaken: timeTaken,
                violations: violationCount
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Store results in localStorage
            const examResult = {
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                score: result.score,
                submissionId: result.submissionId
            };
            
            localStorage.setItem('examResult', JSON.stringify(examResult));
            
            // Redirect to result page
            window.location.href = 'result.html';
        } else {
            throw new Error(result.message || 'Failed to submit exam');
        }
    } catch (error) {
        console.error('Submission error:', error);
        // Fallback to local calculation if backend is unreachable
        let correctCount = 0;
        const questionResults = questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctCount++;
            
            return {
                questionId: question._id,
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            };
        });
        
        const score = Math.round((correctCount / questions.length) * 100);
        
        // Store results in localStorage
        const examResult = {
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            score: score,
            questionResults: questionResults,
            violations: violationCount,
            timeTaken: timeTaken
        };
        
        localStorage.setItem('examResult', JSON.stringify(examResult));
        
        // Redirect to result page
        window.location.href = 'result.html';
    }
}