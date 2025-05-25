export class MultiplicationTaskGenerator {
    constructor() {
        this.usedCombinations = new Set();
        this.minNumber = 2;
        this.maxNumber = 10;
    }
    generateNewProblem() {
        let availableCombinations = [];
        // Generate all possible unique combinations (2 to 10)
        for (let i = this.minNumber; i <= this.maxNumber; i++) {
            for (let j = i; j <= this.maxNumber; j++) {
                const combinationKey = `${i}x${j}`;
                if (!this.usedCombinations.has(combinationKey)) {
                    availableCombinations.push([i, j]);
                }
            }
        }
        // If we've used all combinations, reset and regenerate
        if (availableCombinations.length === 0) {
            this.usedCombinations.clear();
            for (let i = this.minNumber; i <= this.maxNumber; i++) {
                for (let j = i; j <= this.maxNumber; j++) {
                    availableCombinations.push([i, j]);
                }
            }
        }
        // Safety check to ensure we have valid combinations
        if (availableCombinations.length === 0) {
            console.error('No available combinations found! Using fallback.');
            return {
                num1: 2,
                num2: 3,
                answer: 6,
                userAnswer: null,
                isChecked: false
            };
        }
        // Pick a random combination
        const randomIndex = Math.floor(Math.random() * availableCombinations.length);
        const selectedCombination = availableCombinations[randomIndex];
        // Safety check for valid selection
        if (!selectedCombination || !Array.isArray(selectedCombination) || selectedCombination.length < 2) {
            console.error('Invalid combination selected:', selectedCombination);
            return {
                num1: 2,
                num2: 3,
                answer: 6,
                userAnswer: null,
                isChecked: false
            };
        }
        const [num1, num2] = selectedCombination;
        // Mark this combination as used
        const combinationKey = `${num1}x${num2}`;
        this.usedCombinations.add(combinationKey);
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
    getCelebrationUrls() {
        return [
            'https://i.imgur.com/6yHmlwT.jpeg',
            'https://i.imgur.com/AO6wMYS.jpeg',
            'https://i.imgur.com/ZmcYXQK.jpeg',
            'https://i.imgur.com/0LINzxs.jpeg',
            'https://i.imgur.com/lVlPvCB.gif',
        ];
    }
    getCelebrationMessage() {
        return "You're a math master!";
    }
}
//# sourceMappingURL=MultiplicationTaskGenerator.js.map