import { QuizTaskGenerator, MultiplicationProblem } from './types.js';
export declare class MultiplicationTaskGenerator implements QuizTaskGenerator<MultiplicationProblem> {
    private usedCombinations;
    private readonly minNumber;
    private readonly maxNumber;
    generateNewProblem(): MultiplicationProblem;
    formatProblem(problem: MultiplicationProblem): string;
    getCelebrationUrls(): string[];
    getCelebrationMessage(): string;
}
