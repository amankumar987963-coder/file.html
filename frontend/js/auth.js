// auth.js - Handle student login and session management

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const passwordField = document.getElementById('password');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Allow login when pressing Enter on password field
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem('examToken');
    if (token && window.location.pathname.includes('index.html')) {
        window.location.href = 'exam.html';
    }
});

async function handleLogin() {
    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.querySelector('#login-form button[type="submit"]');
    
    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    // Validate input
    if (!studentId || !password) {
        errorMessage.textContent = 'Please enter both Student ID and Password';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        console.log('Attempting login with:', { studentId, password });
        console.log('API Endpoint:', API_ENDPOINTS.AUTH_LOGIN);
        
        // Make API call to backend
        const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId, password })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Store token and user info in localStorage
            localStorage.setItem('examToken', data.token);
            localStorage.setItem('examUser', JSON.stringify(data.user));
            
            console.log('Login successful, redirecting...');
            // Redirect to exam page
            setTimeout(() => {
                window.location.href = 'exam.html';
            }, 500);
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('fetch')) {
            errorMessage.textContent = 'Unable to connect to server. Make sure the backend server is running on port 5000.';
        } else {
            errorMessage.textContent = 'Network error: ' + error.message;
        }
        
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

function logout() {
    localStorage.removeItem('examToken');
    localStorage.removeItem('examUser');
    localStorage.removeItem('currentExam');
    localStorage.removeItem('examAnswers');
    localStorage.removeItem('examStartTime');
    localStorage.removeItem('violationCount');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const user = localStorage.getItem('examUser');
    if (!user) return null;
    
    try {
        return JSON.parse(user);
    } catch (e) {
        return null;
    }
}

function getToken() {
    return localStorage.getItem('examToken');
}