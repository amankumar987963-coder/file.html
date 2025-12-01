// admin.js - Handle admin dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const user = getCurrentUser();
    const token = getToken();
    
    if (!token || !user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Setup form submissions
    setupFormSubmissions();
    
    // Setup logout
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Load initial data
    loadExams();
    loadQuestions();
    loadSubmissions();
});

// Track edit state
let editingExamId = null;
let editingQuestionId = null;

function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding tab
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupFormSubmissions() {
    // Exam form submission
    const examForm = document.getElementById('exam-form');
    if (examForm) {
        examForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createExam();
        });
    }
    
    // Question form submission
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createQuestion();
        });
    }
    
    // Question type change
    const questionType = document.getElementById('question-type');
    if (questionType) {
        questionType.addEventListener('change', function() {
            const optionsContainer = document.getElementById('options-container');
            if (this.value === 'truefalse') {
                optionsContainer.style.display = 'none';
                document.getElementById('correct-answer').placeholder = 'True or False';
            } else {
                optionsContainer.style.display = 'block';
                document.getElementById('correct-answer').placeholder = '';
            }
        });
    }
    
    // Export CSV button
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportSubmissionsCSV();
        });
    }
    
    // Cancel exam edit button
    const cancelExamBtn = document.getElementById('cancel-exam');
    if (cancelExamBtn) {
        cancelExamBtn.addEventListener('click', function() {
            cancelEditExam();
        });
    }
    
    // Cancel question edit button
    const cancelQuestionBtn = document.getElementById('cancel-question');
    if (cancelQuestionBtn) {
        cancelQuestionBtn.addEventListener('click', function() {
            cancelEditQuestion();
        });
    }
}

async function createExam() {
    const name = document.getElementById('exam-name').value;
    const duration = document.getElementById('exam-duration').value;
    const startTime = document.getElementById('exam-start').value;
    const endTime = document.getElementById('exam-end').value;
    
    try {
        const url = editingExamId ? `${API_ENDPOINTS.EXAMS}/${editingExamId}` : API_ENDPOINTS.EXAMS;
        const method = editingExamId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name, duration, startTime, endTime })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(editingExamId ? 'Exam updated successfully!' : 'Exam created successfully!');
            document.getElementById('exam-form').reset();
            // reset editing state
            editingExamId = null;
            const submitBtn = document.querySelector('#exam-form button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Create Exam';
            const cancelBtn = document.getElementById('cancel-exam');
            if (cancelBtn) cancelBtn.style.display = 'none';
            loadExams();
        } else {
            alert((editingExamId ? 'Error updating exam: ' : 'Error creating exam: ') + data.message);
        }
    } catch (error) {
        console.error('Error creating exam:', error);
        alert('Network error. Please try again.');
    }
}

async function loadExams() {
    try {
        const response = await fetch(API_ENDPOINTS.EXAMS, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const exams = await response.json();
        
        if (response.ok) {
            const examsTable = document.querySelector('#exams-table tbody');
            examsTable.innerHTML = exams.map(exam => `
                <tr>
                    <td>${exam.name}</td>
                    <td>${exam.duration} minutes</td>
                    <td>${new Date(exam.startTime).toLocaleString()}</td>
                    <td>${new Date(exam.endTime).toLocaleString()}</td>
                    <td>${exam.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                        <button class="btn" onclick="editExam('${exam._id}')">Edit</button>
                        <button class="btn" onclick="deleteExam('${exam._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

async function createQuestion() {
    const examId = document.getElementById('question-exam').value;
    const type = document.getElementById('question-type').value;
    const question = document.getElementById('question-text').value;
    const options = document.getElementById('question-options').value.split('\n').filter(opt => opt.trim() !== '');
    const correctAnswer = document.getElementById('correct-answer').value;
    
    try {
        const url = editingQuestionId ? `${API_ENDPOINTS.QUESTIONS}/${editingQuestionId}` : API_ENDPOINTS.QUESTIONS;
        const method = editingQuestionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ examId, type, question, options, correctAnswer })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(editingQuestionId ? 'Question updated successfully!' : 'Question created successfully!');
            document.getElementById('question-form').reset();
            // reset editing state
            editingQuestionId = null;
            const submitBtn = document.querySelector('#question-form button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Create Question';
            const cancelBtn = document.getElementById('cancel-question');
            if (cancelBtn) cancelBtn.style.display = 'none';
            loadQuestions();
        } else {
            alert((editingQuestionId ? 'Error updating question: ' : 'Error creating question: ') + data.message);
        }
    } catch (error) {
        console.error('Error creating question:', error);
        alert('Network error. Please try again.');
    }
}

async function loadQuestions() {
    try {
        // First load exams for the select dropdown
        const examResponse = await fetch(API_ENDPOINTS.EXAMS, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const exams = await examResponse.json();
        
        if (examResponse.ok) {
            const examSelect = document.getElementById('question-exam');
            examSelect.innerHTML = '<option value="">Select an exam</option>' + 
                exams.map(exam => `<option value="${exam._id}">${exam.name}</option>`).join('');
        }
        
        // Load questions
        const response = await fetch(API_ENDPOINTS.QUESTIONS, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const questions = await response.json();
        
        if (response.ok) {
            const questionsTable = document.querySelector('#questions-table tbody');
            questionsTable.innerHTML = questions.map(q => `
                <tr>
                    <td>${q.question}</td>
                    <td>${q.type}</td>
                    <td>${exams.find(e => e._id === q.examId)?.name || 'Unknown'}</td>
                    <td>
                        <button class="btn" onclick="editQuestion('${q._id}')">Edit</button>
                        <button class="btn" onclick="deleteQuestion('${q._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.QUESTIONS}/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Question deleted successfully!');
            loadQuestions();
        } else {
            alert('Error deleting question: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Network error. Please try again.');
    }
}

async function loadSubmissions() {
    try {
        const response = await fetch(API_ENDPOINTS.SUBMISSIONS, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const submissions = await response.json();
        
        if (response.ok) {
            const submissionsTable = document.querySelector('#submissions-table tbody');
            submissionsTable.innerHTML = submissions.map(sub => `
                <tr>
                    <td>${sub.userId.studentId || sub.userId.name}</td>
                    <td>${sub.examId.name}</td>
                    <td>${sub.score}%</td>
                    <td>${Math.floor(sub.timeTaken / 60)}m ${sub.timeTaken % 60}s</td>
                    <td>${sub.violations}</td>
                    <td>${new Date(sub.createdAt).toLocaleString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

async function exportSubmissionsCSV() {
    try {
        const response = await fetch(API_ENDPOINTS.SUBMISSIONS_EXPORT, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'submissions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            const data = await response.json();
            alert('Error exporting CSV: ' + data.message);
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Network error. Please try again.');
    }
}

// These functions would be implemented in a full version
function editExam(examId) {
    alert('Edit functionality would be implemented in a full version');
}

function deleteExam(examId) {
    alert('Delete functionality would be implemented in a full version');
}

function editQuestion(questionId) {
    alert('Edit functionality would be implemented in a full version');
}

async function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.EXAMS}/${examId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Exam deleted successfully!');
            loadExams();
            // reload exams for question select as well
            loadQuestions();
        } else {
            alert('Error deleting exam: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Network error. Please try again.');
    }
}

async function editExam(examId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.EXAMS}/${examId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) {
            const data = await response.json();
            alert('Error fetching exam: ' + data.message);
            return;
        }

        const exam = await response.json();
        document.getElementById('exam-name').value = exam.name || '';
        document.getElementById('exam-duration').value = exam.duration || '';
        // convert ISO dates to local datetime-local input value
        const toLocalInput = (iso) => {
            if (!iso) return '';
            const d = new Date(iso);
            const pad = n => n.toString().padStart(2, '0');
            const yyyy = d.getFullYear();
            const mm = pad(d.getMonth() + 1);
            const dd = pad(d.getDate());
            const hh = pad(d.getHours());
            const mi = pad(d.getMinutes());
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
        };

        document.getElementById('exam-start').value = toLocalInput(exam.startTime);
        document.getElementById('exam-end').value = toLocalInput(exam.endTime);

        editingExamId = examId;
        const submitBtn = document.querySelector('#exam-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Exam';
        const cancelBtn = document.getElementById('cancel-exam');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        // switch to exams tab if not active
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const examsTabLink = document.querySelector('.tab-link[data-tab="exams"]');
        if (examsTabLink) examsTabLink.classList.add('active');
        const examsTab = document.getElementById('exams-tab');
        if (examsTab) examsTab.classList.add('active');
    } catch (error) {
        console.error('Error editing exam:', error);
        alert('Network error. Please try again.');
    }
}

async function editQuestion(questionId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.QUESTIONS}/${questionId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) {
            const data = await response.json();
            alert('Error fetching question: ' + data.message);
            return;
        }

        const q = await response.json();

        // populate the form
        await loadExams(); // ensure exam select is populated
        document.getElementById('question-exam').value = q.examId || '';
        document.getElementById('question-type').value = q.type || 'mcq';
        document.getElementById('question-text').value = q.question || '';
        document.getElementById('question-options').value = (q.options || []).join('\n');
        document.getElementById('correct-answer').value = q.correctAnswer || '';

        editingQuestionId = questionId;
        const submitBtn = document.querySelector('#question-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Question';
        const cancelBtn = document.getElementById('cancel-question');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        // switch to questions tab
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const qTabLink = document.querySelector('.tab-link[data-tab="questions"]');
        if (qTabLink) qTabLink.classList.add('active');
        const qTab = document.getElementById('questions-tab');
        if (qTab) qTab.classList.add('active');
    } catch (error) {
        console.error('Error editing question:', error);
        alert('Network error. Please try again.');
    }
}

function cancelEditExam() {
    document.getElementById('exam-form').reset();
    editingExamId = null;
    const submitBtn = document.querySelector('#exam-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Create Exam';
    const cancelBtn = document.getElementById('cancel-exam');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function cancelEditQuestion() {
    document.getElementById('question-form').reset();
    editingQuestionId = null;
    const submitBtn = document.querySelector('#question-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Create Question';
    const cancelBtn = document.getElementById('cancel-question');
    if (cancelBtn) cancelBtn.style.display = 'none';
}