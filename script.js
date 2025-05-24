// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const startPage = document.getElementById('start-page');
    const quizContainer = document.getElementById('quiz-container');
    const tableContainer = document.getElementById('table-container');
    
    // Button elements
    const startMultiplicationQuizBtn = document.getElementById('start-multiplication-quiz');
    const startDivisionQuizBtn = document.getElementById('start-division-quiz');
    const showTableBtn = document.getElementById('show-table');
    const backToStartBtns = document.querySelectorAll('#back-to-start');
    const quizTitle = document.getElementById('quiz-title');
    
    let quizInstance = null;

    // Navigation functions
    function showPage(pageToShow) {
        [startPage, quizContainer, tableContainer].forEach(page => {
            page.style.display = 'none';
        });
        pageToShow.style.display = 'block';
    }

    // Event listeners for navigation
    startMultiplicationQuizBtn.addEventListener('click', () => {
        showPage(quizContainer);
        quizTitle.textContent = 'Multiplication Practice';
        // Clean up previous instance
        if (quizInstance) {
            quizInstance.cleanup();
        }
        quizInstance = new MultiplicationPractice();
    });

    startDivisionQuizBtn.addEventListener('click', () => {
        showPage(quizContainer);
        quizTitle.textContent = 'Division Practice';
        // Clean up previous instance
        if (quizInstance) {
            quizInstance.cleanup();
        }
        quizInstance = new DivisionPractice();
    });

    showTableBtn.addEventListener('click', () => {
        showPage(tableContainer);
    });

    backToStartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(startPage);
            if (quizInstance) {
                quizInstance.cleanup();
                quizInstance = null;
            }
        });
    });
});

// Base class for quiz functionality
class QuizPractice {
    constructor() {
        this.currentTaskIndex = 0;
        this.totalTasks = 12;
        this.problems = [];
        this.timeLimit = 40; // 40 seconds per problem
        this.remainingTime = this.timeLimit; // Track remaining time for pause/resume
        this.timer = null;
        this.usedCombinations = new Set(); // Track used combinations
        this.celebrationImages = []; // Array to store preloaded images
        
        // DOM elements
        this.currentTaskElement = document.getElementById('current-task');
        this.nextButton = document.getElementById('next-button');
        this.scoreElement = document.getElementById('score');
        this.taskCounter = document.getElementById('task-counter');
        this.timerElement = document.getElementById('timer');
        
        // Bind methods to preserve context
        this.handleCheckAndNext = this.handleCheckAndNext.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Preload all celebration images
        this.preloadCelebrationImages();
        
        // Generate problems first
        this.generateNewProblems();
        
        // Set up event listeners after everything is ready
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add new event listeners
        this.nextButton.addEventListener('click', this.handleCheckAndNext);
        document.addEventListener('keypress', this.handleKeyPress);
    }

    cleanup() {
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Remove event listeners
        if (this.nextButton && this.handleCheckAndNext) {
            this.nextButton.removeEventListener('click', this.handleCheckAndNext);
        }
        if (this.nextButton && this.handleRestart) {
            this.nextButton.removeEventListener('click', this.handleRestart);
        }
        if (this.handleKeyPress) {
            document.removeEventListener('keypress', this.handleKeyPress);
        }
    }

    handleCheckAndNext() {
        this.checkAndNext();
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            this.checkAndNext();
        }
    }

    // Method to get celebration URLs - can be overridden by subclasses
    getCelebrationUrls() {
        // Default cat images for multiplication
        return [
            'https://i.imgur.com/6yHmlwT.jpeg',
            'https://i.imgur.com/AO6wMYS.jpeg', 
            'https://i.imgur.com/ZmcYXQK.jpeg', 
            'https://i.imgur.com/0LINzxs.jpeg',
            'https://i.imgur.com/lVlPvCB.gif',
        ];
    }

    preloadCelebrationImages() {
        const urls = this.getCelebrationUrls();
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
            this.celebrationImages.push(img);
        });
    }

    getRandomCelebrationImage() {
        const randomIndex = Math.floor(Math.random() * this.celebrationImages.length);
        return this.celebrationImages[randomIndex];
    }

    // Abstract method to be implemented by subclasses
    generateNewProblem() {
        throw new Error('generateNewProblem must be implemented by subclass');
    }

    // Abstract method to be implemented by subclasses
    formatProblem(problem) {
        throw new Error('formatProblem must be implemented by subclass');
    }

    generateNewProblems() {
        this.problems = [];
        this.currentTaskIndex = 0;
        this.remainingTime = this.timeLimit; // Reset timer for new problems
        this.usedCombinations.clear(); // Clear used combinations for new set
        
        for (let i = 0; i < this.totalTasks; i++) {
            const problem = this.generateNewProblem();
            this.problems.push(problem);
        }
        
        this.updateUI();
        this.scoreElement.textContent = '';
        this.startTimer();
        this.focusInput();
    }

    startTimer() {
        this.timerElement.textContent = this.remainingTime;
        this.timerElement.classList.remove('warning');
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.remainingTime--;
            this.timerElement.textContent = this.remainingTime;
            
            if (this.remainingTime <= 2) {
                this.timerElement.classList.add('warning');
            }
            
            if (this.remainingTime <= 0) {
                clearInterval(this.timer);
                this.handleTimeUp();
            }
        }, 1000);
    }

    pauseTimer() {
        clearInterval(this.timer);
    }

    handleTimeUp() {
        const problem = this.problems[this.currentTaskIndex];
        problem.isChecked = true;
        problem.userAnswer = null; // Mark as not answered
        this.currentTaskElement.classList.add('incorrect');
        
        // Disable the button when showing incorrect answer
        this.nextButton.disabled = true;
        
        // Show the correct answer
        this.showCorrectAnswer(problem);
        
        setTimeout(() => {
            // Re-enable the button when moving to next question
            this.nextButton.disabled = false;
            
            if (this.currentTaskIndex < this.totalTasks - 1) {
                this.currentTaskIndex++;
                this.updateUI();
                this.startTimer();
                this.focusInput();
            } else {
                this.showFinalScore();
            }
        }, 2000); // Increased delay to show the answer
    }

    showCorrectAnswer(problem) {
        const input = this.currentTaskElement.querySelector('input');
        if (input) {
            input.disabled = true;
        }
        
        const answerDisplay = document.createElement('div');
        answerDisplay.className = 'correct-answer';
        answerDisplay.innerHTML = `Correct answer: ${problem.answer}`;
        
        // Insert after the input
        if (input) {
            input.insertAdjacentElement('afterend', answerDisplay);
        }
    }

    checkAndNext() {
        this.pauseTimer();
        
        const input = this.currentTaskElement.querySelector('input');
        if (!input) {
            return;
        }
        
        const userAnswer = parseInt(input.value);
        
        if (isNaN(userAnswer)) {
            alert('Please enter a number!');
            this.startTimer(); // Resume with remaining time
            input.value = '';
            input.focus();
            return;
        }

        const problem = this.problems[this.currentTaskIndex];
        problem.userAnswer = userAnswer;
        problem.isChecked = true;

        const isCorrect = userAnswer === problem.answer;
        this.currentTaskElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        if (!isCorrect) {
            // Disable the button when showing incorrect answer
            this.nextButton.disabled = true;
            this.showCorrectAnswer(problem);
        }
        
        setTimeout(() => {
            // Re-enable the button when moving to next question
            this.nextButton.disabled = false;
            
            if (this.currentTaskIndex < this.totalTasks - 1) {
                this.currentTaskIndex++;
                this.remainingTime = this.timeLimit; // Reset timer for next problem
                this.updateUI();
                this.startTimer();
                this.focusInput();
            } else {
                this.showFinalScore();
            }
        }, isCorrect ? 500 : 2000); // Longer delay for wrong answers
    }

    focusInput() {
        // Use setTimeout to ensure the DOM is ready
        setTimeout(() => {
            const input = this.currentTaskElement.querySelector('input');
            if (input) {
                input.focus();
                input.select(); // Select any existing text
            }
        }, 100); // Increased timeout to ensure DOM is ready
    }

    updateUI() {
        const problem = this.problems[this.currentTaskIndex];
        
        const formattedProblem = this.formatProblem(problem);
        
        this.currentTaskElement.innerHTML = formattedProblem;
        
        this.taskCounter.textContent = `Task ${this.currentTaskIndex + 1} of ${this.totalTasks}`;
        this.currentTaskElement.className = 'task';
        this.nextButton.textContent = this.currentTaskIndex === this.totalTasks - 1 ? 'Finish' : 'Check & Next';
    }

    // Method to get celebration message - can be overridden by subclasses
    getCelebrationMessage() {
        return "You're a math master!";
    }

    showFinalScore() {
        clearInterval(this.timer);
        this.timerElement.textContent = '0';
        
        const correctCount = this.problems.filter(p => p.userAnswer === p.answer).length;
        const percentage = Math.round((correctCount / this.totalTasks) * 100);
        
        if (correctCount === this.totalTasks) {
            // Perfect score celebration with a random image!
            const celebrationImage = this.getRandomCelebrationImage();
            this.currentTaskElement.innerHTML = `
                <div class="celebration">
                    <h2>🎉 Amazing Job! Perfect Score! 🎉</h2>
                    <p>${this.getCelebrationMessage()}</p>
                    <img src="${celebrationImage.src}" alt="Celebration">
                </div>
            `;
            this.scoreElement.textContent = `Perfect Score: ${correctCount}/${this.totalTasks} (100%)! 🌟`;
        } else {
            this.scoreElement.textContent = `Final Score: ${correctCount}/${this.totalTasks} (${percentage}%)`;
        }
        
        this.nextButton.textContent = 'Try New Problems';
        this.nextButton.disabled = false; // Ensure button is enabled
        
        // Clean up existing listeners and add new one for restart
        this.nextButton.removeEventListener('click', this.handleCheckAndNext);
        
        // Create a bound restart handler
        this.handleRestart = () => {
            // Clean up event listeners before restart
            this.cleanup();
            
            // Generate new problems and reset state
            this.generateNewProblems();
            
            // Reset button text and re-setup event listeners
            this.nextButton.textContent = 'Check & Next';
            this.setupEventListeners();
        };
        
        this.nextButton.addEventListener('click', this.handleRestart);
    }
}

class MultiplicationPractice extends QuizPractice {
    constructor() {
        super();
        this.minNumber = 2; // Starting from 2 instead of 1
        this.maxNumber = 10;
    }

    generateNewProblem() {
        const availableCombinations = [];
        
        // Generate all possible combinations that haven't been used yet (2 to 10)
        for (let i = this.minNumber; i <= this.maxNumber; i++) {
            for (let j = i; j <= this.maxNumber; j++) {  // Start j from i to avoid duplicates
                const combination = `${Math.min(i,j)}x${Math.max(i,j)}`; // Store in sorted order
                if (!this.usedCombinations.has(combination)) {
                    availableCombinations.push([i, j]);
                }
            }
        }

        // If all combinations were used, reset the used combinations
        if (availableCombinations.length === 0) {
            this.usedCombinations.clear();
            return this.generateNewProblem();
        }

        // Pick a random combination from available ones
        const randomIndex = Math.floor(Math.random() * availableCombinations.length);
        const [num1, num2] = availableCombinations[randomIndex];
        
        // Mark this combination as used (in sorted order)
        this.usedCombinations.add(`${Math.min(num1,num2)}x${Math.max(num1,num2)}`);
        
        // Randomly decide if we should swap the numbers for display
        const shouldSwap = Math.random() < 0.5;
        return {
            num1: shouldSwap ? num2 : num1,
            num2: shouldSwap ? num1 : num2,
            answer: num1 * num2,
            userAnswer: null,
            isChecked: false
        };
    }

    formatProblem(problem) {
        return `
            <div>${problem.num1} × ${problem.num2} = </div>
            <input type="number" min="0" max="100" autofocus>
        `;
    }
}

class DivisionPractice extends QuizPractice {
    constructor() {
        super();
    }

    // Override to use pug images for division tests
    getCelebrationUrls() {
        return [
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', // Happy pug from Unsplash
            'https://images.unsplash.com/photo-1514373941175-0a141072bbc8?w=400', // Cute pug with tongue out
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', // Adorable pug face
            'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400', // Pug in natural setting
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', // Sleepy pug
            'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400', // Pug with funny expression
            'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400', // Pug close-up
            'https://images.unsplash.com/photo-1530041539828-114de669390e?w=400', // Pug portrait
            'https://images.unsplash.com/photo-1593134257782-e89567b7718a?w=400', // Funny pug
        ];
    }

    // Override celebration message for division tests
    getCelebrationMessage() {
        return "You're a division champion! The pugs are proud! 🐶";
    }

    generateNewProblem() {
        // Generate all possible division combinations dynamically
        const availableCombinations = [];
        
        // Dividends from 10 to 100
        for (let dividend = 10; dividend <= 100; dividend++) {
            // Find all divisors that divide evenly (no remainder), starting from 2
            for (let divisor = 2; divisor <= dividend; divisor++) {
                if (dividend % divisor === 0 && dividend !== divisor) { // Check if division is exact and numbers are not equal
                    const quotient = dividend / divisor;
                    const combination = `${dividend}/${divisor}`;
                    
                    // Only add if not already used
                    if (!this.usedCombinations.has(combination)) {
                        availableCombinations.push([dividend, divisor, quotient]);
                    }
                }
            }
        }
        
        // If we've used all combinations, reset and allow reuse
        if (availableCombinations.length === 0) {
            this.usedCombinations.clear();
            
            // Regenerate with cleared used combinations
            for (let dividend = 10; dividend <= 100; dividend++) {
                for (let divisor = 2; divisor <= dividend; divisor++) {
                    if (dividend % divisor === 0 && dividend !== divisor) {
                        const quotient = dividend / divisor;
                        availableCombinations.push([dividend, divisor, quotient]);
                    }
                }
            }
        }

        // Pick a random combination
        const randomIndex = Math.floor(Math.random() * availableCombinations.length);
        const [dividend, divisor, quotient] = availableCombinations[randomIndex];
        
        // Mark this combination as used
        this.usedCombinations.add(`${dividend}/${divisor}`);
        
        const problem = {
            dividend: dividend,
            divisor: divisor,
            answer: quotient,
            userAnswer: null,
            isChecked: false
        };
        
        return problem;
    }

    formatProblem(problem) {
        const html = `
            <div>${problem.dividend} ÷ ${problem.divisor} = </div>
            <input type="number" min="0" max="100" autofocus>
        `;
        
        return html;
    }
} 
