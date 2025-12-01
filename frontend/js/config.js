// Configuration file for API endpoints
const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
    AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
    AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
    AUTH_HEARTBEAT: `${API_BASE_URL}/api/auth/heartbeat`,
    EXAMS: `${API_BASE_URL}/api/exams`,
    QUESTIONS: `${API_BASE_URL}/api/questions`,
    SUBMISSIONS: `${API_BASE_URL}/api/submissions`,
    SUBMISSIONS_EXPORT: `${API_BASE_URL}/api/submissions/export/csv`
};
