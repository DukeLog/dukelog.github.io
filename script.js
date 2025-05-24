// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const startPage = document.getElementById('start-page');
    const quizContainer = document.getElementById('quiz-container');
    const tableContainer = document.getElementById('table-container');
    
    // Button elements
    const startQuizBtn = document.getElementById('start-quiz');
    const showTableBtn = document.getElementById('show-table');
    const backToStartBtns = document.querySelectorAll('#back-to-start');
    
    let quizInstance = null;

    // Navigation functions
    function showPage(pageToShow) {
        [startPage, quizContainer, tableContainer].forEach(page => {
            page.style.display = 'none';
        });
        pageToShow.style.display = 'block';
    }

    // Event listeners for navigation
    startQuizBtn.addEventListener('click', () => {
        showPage(quizContainer);
        if (!quizInstance) {
            quizInstance = new MultiplicationPractice();
        } else {
            quizInstance.generateNewProblems();
        }
    });

    showTableBtn.addEventListener('click', () => {
        showPage(tableContainer);
    });

    backToStartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(startPage);
        });
    });
});

class MultiplicationPractice {
    constructor() {
        this.currentTaskIndex = 0;
        this.totalTasks = 12;
        this.problems = [];
        this.timeLimit = 40; // 20 seconds per problem
        this.remainingTime = this.timeLimit; // Track remaining time for pause/resume
        this.timer = null;
        this.usedCombinations = new Set(); // Track used combinations
        this.minNumber = 2; // Starting from 2 instead of 1
        this.maxNumber = 10;
        this.celebrationImages = []; // Array to store preloaded images
        
        // Collection of celebration GIF URLs
        this.celebrationUrls = [
            'https://i.imgur.com/6yHmlwT.jpeg',
            'https://i.imgur.com/AO6wMYS.jpeg', 
            'https://i.imgur.com/ZmcYXQK.jpeg', 
            'https://i.imgur.com/0LINzxs.jpeg',
            'https://i.imgur.com/lVlPvCB.gif',
        ];
        
        // DOM elements
        this.currentTaskElement = document.getElementById('current-task');
        this.nextButton = document.getElementById('next-button');
        this.scoreElement = document.getElementById('score');
        this.taskCounter = document.getElementById('task-counter');
        this.timerElement = document.getElementById('timer');
        
        // Event listeners
        this.nextButton.addEventListener('click', () => this.checkAndNext());
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission
                this.checkAndNext();
            }
        });
        
        // Preload all celebration images
        this.preloadCelebrationImages();
        
        this.generateNewProblems();
    }

    preloadCelebrationImages() {
        this.celebrationUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            this.celebrationImages.push(img);
        });
    }

    getRandomCelebrationImage() {
        const randomIndex = Math.floor(Math.random() * this.celebrationImages.length);
        return this.celebrationImages[randomIndex];
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

    generateNewProblems() {
        this.problems = [];
        this.currentTaskIndex = 0;
        this.remainingTime = this.timeLimit; // Reset timer for new problems
        this.usedCombinations.clear(); // Clear used combinations for new set
        
        for (let i = 0; i < this.totalTasks; i++) {
            this.problems.push(this.generateNewProblem());
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
        
        // Show the correct answer
        this.showCorrectAnswer(problem);
        
        setTimeout(() => {
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
        input.disabled = true;
        
        const answerDisplay = document.createElement('div');
        answerDisplay.className = 'correct-answer';
        answerDisplay.innerHTML = `Correct answer: ${problem.answer}`;
        
        // Insert after the input
        input.insertAdjacentElement('afterend', answerDisplay);
    }

    checkAndNext() {
        this.pauseTimer();
        
        const input = this.currentTaskElement.querySelector('input');
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
            this.showCorrectAnswer(problem);
        }
        
        setTimeout(() => {
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
        }, 0);
    }

    updateUI() {
        const problem = this.problems[this.currentTaskIndex];
        
        this.currentTaskElement.innerHTML = `
            <div>${problem.num1} × ${problem.num2} = </div>
            <input type="number" min="0" max="100" autofocus>
        `;
        
        this.taskCounter.textContent = `Task ${this.currentTaskIndex + 1} of ${this.totalTasks}`;
        this.currentTaskElement.className = 'task';
        this.nextButton.textContent = this.currentTaskIndex === this.totalTasks - 1 ? 'Finish' : 'Check & Next';
    }

    showFinalScore() {
        clearInterval(this.timer);
        this.timerElement.textContent = '0';
        
        const correctCount = this.problems.filter(p => p.userAnswer === p.answer).length;
        const percentage = Math.round((correctCount / this.totalTasks) * 100);
        
        if (correctCount === this.totalTasks) {
            // Perfect score celebration with a random cat image!
            const celebrationImage = this.getRandomCelebrationImage();
            this.currentTaskElement.innerHTML = `
                <div class="celebration">
                    <h2>🎉 Amazing Job! Perfect Score! 🎉</h2>
                    <p>You're a multiplication master!</p>
                    <img src="${celebrationImage.src}" alt="Celebration cat">
                </div>
            `;
            this.scoreElement.textContent = `Perfect Score: ${correctCount}/${this.totalTasks} (100%)! 🌟`;
        } else {
            this.scoreElement.textContent = `Final Score: ${correctCount}/${this.totalTasks} (${percentage}%)`;
        }
        
        this.nextButton.textContent = 'Try New Problems';
        this.nextButton.removeEventListener('click', () => this.checkAndNext());
        this.nextButton.addEventListener('click', () => {
            this.generateNewProblems();
            this.nextButton.textContent = 'Check & Next';
            this.nextButton.removeEventListener('click', () => this.generateNewProblems());
            this.nextButton.addEventListener('click', () => this.checkAndNext());
        });
    }
} 
