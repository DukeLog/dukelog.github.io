// Core interfaces for the quiz system

export interface Problem {
    answer: number;
    userAnswer: number | null;
    isChecked: boolean;
}

export interface QuizConfig {
    totalTasks: number;
    timeLimit: number;
    celebrationImages: string[];
}

export interface QuizTaskGenerator<T extends Problem> {
    generateNewProblem(): T;
    formatProblem(problem: T): string;
    getCelebrationUrls(): string[];
    getCelebrationMessage(): string;
}

export interface MultiplicationProblem extends Problem {
    num1: number;
    num2: number;
}

export interface DivisionProblem extends Problem {
    dividend: number;
    divisor: number;
} 