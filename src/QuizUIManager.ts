import { Problem, QuizConfig, QuizTaskGenerator } from './types.js';

export class QuizUIManager<T extends Problem> {
    private currentTaskIndex = 0;
    private problems: T[] = [];
    private remainingTime: number;
    private timer: NodeJS.Timeout | null = null;
    private celebrationImages: HTMLImageElement[] = [];
    
    // DOM elements
    private currentTaskElement: HTMLElement;
    private nextButton: HTMLButtonElement;
    private scoreElement: HTMLElement;
    private taskCounter: HTMLElement;
    private timerElement: HTMLElement;
    
    constructor(
        private config: QuizConfig,
        private taskGenerator: QuizTaskGenerator<T>
    ) {
        this.remainingTime = config.timeLimit;
        
        // Get DOM elements
        this.currentTaskElement = document.getElementById('current-task')!;
        this.nextButton = document.getElementById('next-button') as HTMLButtonElement;
        this.scoreElement = document.getElementById('score')!;
        this.taskCounter = document.getElementById('task-counter')!;
        this.timerElement = document.getElementById('timer')!;
        
        // Bind methods to preserve context
        this.handleCheckAndNext = this.handleCheckAndNext.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        
        // Initialize
        this.preloadCelebrationImages();
        this.generateNewProblems();
        this.setupEventListeners();
    }

    private preloadCelebrationImages(): void {
        const urls = this.taskGenerator.getCelebrationUrls();
        this.celebrationImages = urls.map(url => {
            const img = new Image();
            img.src = url;
            return img;
        });
    }

    private getRandomCelebrationImage(): HTMLImageElement {
        const randomIndex = Math.floor(Math.random() * this.celebrationImages.length);
        return this.celebrationImages[randomIndex];
    }

    private setupEventListeners(): void {
        this.nextButton.addEventListener('click', this.handleCheckAndNext);
        document.addEventListener('keypress', this.handleKeyPress);
    }

    private handleCheckAndNext(): void {
        this.checkAndNext();
    }

    private handleKeyPress(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.checkAndNext();
        }
    }

    private handleRestart(): void {
        this.cleanup();
        this.generateNewProblems();
        this.nextButton.textContent = 'Check & Next';
        this.setupEventListeners();
    }

    public cleanup(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.nextButton.removeEventListener('click', this.handleCheckAndNext);
        this.nextButton.removeEventListener('click', this.handleRestart);
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    private generateNewProblems(): void {
        this.problems = [];
        this.currentTaskIndex = 0;
        this.remainingTime = this.config.timeLimit;
        
        for (let i = 0; i < this.config.totalTasks; i++) {
            const problem = this.taskGenerator.generateNewProblem();
            this.problems.push(problem);
        }
        
        this.updateUI();
        this.scoreElement.textContent = '';
        this.startTimer();
        this.focusInput();
    }

    private startTimer(): void {
        this.timerElement.textContent = this.remainingTime.toString();
        this.timerElement.classList.remove('warning');
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.remainingTime--;
            this.timerElement.textContent = this.remainingTime.toString();
            
            if (this.remainingTime <= 2) {
                this.timerElement.classList.add('warning');
            }
            
            if (this.remainingTime <= 0) {
                if (this.timer) {
                    clearInterval(this.timer);
                }
                this.handleTimeUp();
            }
        }, 1000);
    }

    private pauseTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    private handleTimeUp(): void {
        const problem = this.problems[this.currentTaskIndex];
        problem.isChecked = true;
        problem.userAnswer = null;
        this.currentTaskElement.classList.add('incorrect');
        
        this.nextButton.disabled = true;
        this.showCorrectAnswer(problem);
        
        setTimeout(() => {
            this.nextButton.disabled = false;
            
            if (this.currentTaskIndex < this.config.totalTasks - 1) {
                this.currentTaskIndex++;
                this.updateUI();
                this.startTimer();
                this.focusInput();
            } else {
                this.showFinalScore();
            }
        }, 2000);
    }

    private showCorrectAnswer(problem: T): void {
        const input = this.currentTaskElement.querySelector('input');
        if (input) {
            input.disabled = true;
        }
        
        const answerDisplay = document.createElement('div');
        answerDisplay.className = 'correct-answer';
        answerDisplay.innerHTML = `Correct answer: ${problem.answer}`;
        
        if (input) {
            input.insertAdjacentElement('afterend', answerDisplay);
        }
    }

    private checkAndNext(): void {
        this.pauseTimer();
        
        const input = this.currentTaskElement.querySelector('input') as HTMLInputElement;
        if (!input) {
            return;
        }
        
        const userAnswer = parseInt(input.value);
        
        if (isNaN(userAnswer)) {
            alert('Please enter a number!');
            this.startTimer();
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
            this.nextButton.disabled = true;
            this.showCorrectAnswer(problem);
        }
        
        setTimeout(() => {
            this.nextButton.disabled = false;
            
            if (this.currentTaskIndex < this.config.totalTasks - 1) {
                this.currentTaskIndex++;
                this.remainingTime = this.config.timeLimit;
                this.updateUI();
                this.startTimer();
                this.focusInput();
            } else {
                this.showFinalScore();
            }
        }, isCorrect ? 500 : 2000);
    }

    private focusInput(): void {
        setTimeout(() => {
            const input = this.currentTaskElement.querySelector('input') as HTMLInputElement;
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    private updateUI(): void {
        const problem = this.problems[this.currentTaskIndex];
        const formattedProblem = this.taskGenerator.formatProblem(problem);
        
        this.currentTaskElement.innerHTML = formattedProblem;
        this.taskCounter.textContent = `Task ${this.currentTaskIndex + 1} of ${this.config.totalTasks}`;
        this.currentTaskElement.className = 'task';
        this.nextButton.textContent = this.currentTaskIndex === this.config.totalTasks - 1 ? 'Finish' : 'Check & Next';
    }

    private showFinalScore(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timerElement.textContent = '0';
        
        const correctCount = this.problems.filter(p => p.userAnswer === p.answer).length;
        const percentage = Math.round((correctCount / this.config.totalTasks) * 100);
        
        if (correctCount === this.config.totalTasks) {
            const celebrationImage = this.getRandomCelebrationImage();
            this.currentTaskElement.innerHTML = `
                <div class="celebration">
                    <h2>🎉 Amazing Job! Perfect Score! 🎉</h2>
                    <p>${this.taskGenerator.getCelebrationMessage()}</p>
                    <img src="${celebrationImage.src}" alt="Celebration">
                </div>
            `;
            this.scoreElement.textContent = `Perfect Score: ${correctCount}/${this.config.totalTasks} (100%)! 🌟`;
        } else {
            this.scoreElement.textContent = `Final Score: ${correctCount}/${this.config.totalTasks} (${percentage}%)`;
        }
        
        this.nextButton.textContent = 'Try New Problems';
        this.nextButton.disabled = false;
        
        this.nextButton.removeEventListener('click', this.handleCheckAndNext);
        this.nextButton.addEventListener('click', this.handleRestart);
    }
} 