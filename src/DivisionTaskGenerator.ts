import { QuizTaskGenerator, DivisionProblem } from './types.js';

export class DivisionTaskGenerator implements QuizTaskGenerator<DivisionProblem> {
    private usedCombinations = new Set<string>();

    generateNewProblem(): DivisionProblem {
        const availableCombinations: [number, number, number][] = [];
        
        // Generate all possible division combinations dynamically
        for (let dividend = 10; dividend <= 100; dividend++) {
            // Find all divisors that divide evenly (no remainder), starting from 2
            for (let divisor = 2; divisor <= dividend; divisor++) {
                if (dividend % divisor === 0 && dividend !== divisor) {
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
        
        return {
            dividend: dividend,
            divisor: divisor,
            answer: quotient,
            userAnswer: null,
            isChecked: false
        };
    }

    formatProblem(problem: DivisionProblem): string {
        return `
            <div>${problem.dividend} ÷ ${problem.divisor} = </div>
            <input type="number" min="0" max="100" autofocus>
        `;
    }

    getCelebrationUrls(): string[] {
        return [
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
            'https://images.unsplash.com/photo-1514373941175-0a141072bbc8?w=400',
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
            'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
            'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400',
            'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400',
            'https://images.unsplash.com/photo-1530041539828-114de669390e?w=400',
            'https://images.unsplash.com/photo-1593134257782-e89567b7718a?w=400',
            'https://st4.depositphotos.com/7863750/38907/i/1600/depositphotos_389076072-stock-photo-pug-dog-unicorn-eating-rainbow.jpg'
        ];
    }

    getCelebrationMessage(): string {
        return "You're a division champion! The pugs are proud! 🐶";
    }
} 