// result.js - Display exam results

document.addEventListener('DOMContentLoaded', function() {
    const examResult = JSON.parse(localStorage.getItem('examResult') || '{}');
    
    if (!examResult.totalQuestions && !examResult.score) {
        // If no results, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    // Display summary
    document.getElementById('total-questions').textContent = examResult.totalQuestions || 'N/A';
    document.getElementById('correct-answers').textContent = examResult.correctAnswers || 'N/A';
    document.getElementById('score').textContent = examResult.score || 'N/A';
    
    // If we have detailed question results (offline mode), display them
    if (examResult.questionResults) {
        displayQuestionResults(examResult.questionResults);
    } else {
        // In a real implementation, we would fetch detailed results from the backend
        // For now, we'll just show the summary
        document.getElementById('question-results').innerHTML = 
            '<p>Detailed question results are available in admin panel.</p>';
    }
    
    // Setup back to login button
    document.getElementById('back-to-login').addEventListener('click', function() {
        // Clear exam data
        localStorage.removeItem('currentExam');
        localStorage.removeItem('examAnswers');
        localStorage.removeItem('examStartTime');
        localStorage.removeItem('violationCount');
        localStorage.removeItem('examResult');
        
        // Redirect to login
        window.location.href = 'index.html';
    });
});

function displayQuestionResults(questionResults) {
    const questionResultsContainer = document.getElementById('question-results');
    
    questionResultsContainer.innerHTML = questionResults.map((result, index) => `
        <div class="question-result ${result.isCorrect ? 'correct' : 'incorrect'}">
            <div class="question-text">Question ${index + 1}: ${result.question}</div>
            <div class="user-answer">Your Answer: ${result.userAnswer || 'No answer provided'}</div>
            <div class="correct-answer">Correct Answer: ${result.correctAnswer}</div>
        </div>
    `).join('');
}