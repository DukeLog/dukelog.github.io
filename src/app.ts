import { QuizUIManager } from './QuizUIManager.js';
import { MultiplicationTaskGenerator } from './MultiplicationTaskGenerator.js';
import { DivisionTaskGenerator } from './DivisionTaskGenerator.js';
import { QuizConfig, MultiplicationProblem, DivisionProblem } from './types.js';

class MathPracticeApp {
    private quizInstance: QuizUIManager<any> | null = null;
    
    // DOM elements
    private startPage: HTMLElement;
    private quizContainer: HTMLElement;
    private tableContainer: HTMLElement;
    private quizTitle: HTMLElement;

    constructor() {
        // Get DOM elements
        this.startPage = document.getElementById('start-page')!;
        this.quizContainer = document.getElementById('quiz-container')!;
        this.tableContainer = document.getElementById('table-container')!;
        this.quizTitle = document.getElementById('quiz-title')!;
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Button elements
        const startMultiplicationQuizBtn = document.getElementById('start-multiplication-quiz')!;
        const startDivisionQuizBtn = document.getElementById('start-division-quiz')!;
        const showTableBtn = document.getElementById('show-table')!;
        const backToStartBtns = document.querySelectorAll('#back-to-start');

        // Event listeners for navigation
        startMultiplicationQuizBtn.addEventListener('click', () => {
            this.startMultiplicationQuiz();
        });

        startDivisionQuizBtn.addEventListener('click', () => {
            this.startDivisionQuiz();
        });

        showTableBtn.addEventListener('click', () => {
            this.showPage(this.tableContainer);
        });

        backToStartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPage(this.startPage);
                if (this.quizInstance) {
                    this.quizInstance.cleanup();
                    this.quizInstance = null;
                }
            });
        });
    }

    private showPage(pageToShow: HTMLElement): void {
        [this.startPage, this.quizContainer, this.tableContainer].forEach(page => {
            page.style.display = 'none';
        });
        pageToShow.style.display = 'block';
    }

    private startMultiplicationQuiz(): void {
        this.showPage(this.quizContainer);
        this.quizTitle.textContent = 'Multiplication Practice';
        
        // Clean up previous instance
        if (this.quizInstance) {
            this.quizInstance.cleanup();
        }

        const config: QuizConfig = {
            totalTasks: 12,
            timeLimit: 40,
            celebrationImages: []
        };

        const taskGenerator = new MultiplicationTaskGenerator();
        this.quizInstance = new QuizUIManager<MultiplicationProblem>(config, taskGenerator);
    }

    private startDivisionQuiz(): void {
        this.showPage(this.quizContainer);
        this.quizTitle.textContent = 'Division Practice';
        
        // Clean up previous instance
        if (this.quizInstance) {
            this.quizInstance.cleanup();
        }

        const config: QuizConfig = {
            totalTasks: 12,
            timeLimit: 40,
            celebrationImages: []
        };

        const taskGenerator = new DivisionTaskGenerator();
        this.quizInstance = new QuizUIManager<DivisionProblem>(config, taskGenerator);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathPracticeApp();
}); 