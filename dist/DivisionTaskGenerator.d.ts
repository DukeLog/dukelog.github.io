import { QuizTaskGenerator, DivisionProblem } from './types.js';
export declare class DivisionTaskGenerator implements QuizTaskGenerator<DivisionProblem> {
    private usedCombinations;
    generateNewProblem(): DivisionProblem;
    formatProblem(problem: DivisionProblem): string;
    getCelebrationUrls(): string[];
    getCelebrationMessage(): string;
}
