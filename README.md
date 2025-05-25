# Math Practice TypeScript

A refactored math practice application with clean separation of concerns, built with TypeScript.

## Architecture

The project has been restructured with the following components:

### Core Architecture

1. **QuizUIManager** (`src/QuizUIManager.ts`)
   - Manages the quiz UI flow and mechanics
   - Handles timer, navigation, scoring, and user interactions
   - Generic class that works with any quiz type
   - Configurable via `QuizConfig` interface

2. **Task Generators** (`src/*TaskGenerator.ts`)
   - Separate classes for different quiz types (Multiplication, Division)
   - Implement `QuizTaskGenerator` interface
   - Handle problem generation and answer validation
   - Manage celebration images and messages

3. **Types** (`src/types.ts`)
   - TypeScript interfaces defining the contract between components
   - Ensures type safety and clear API definitions

### Files Structure

```
src/
├── app.ts                      # Main application entry point
├── QuizUIManager.ts            # UI and quiz flow management
├── MultiplicationTaskGenerator.ts # Multiplication problems
├── DivisionTaskGenerator.ts    # Division problems
├── types.ts                    # TypeScript interfaces
├── index.html                  # HTML template
└── styles.css                  # Styles (copied from original)
```

## Building

### Using Docker (Recommended)

No local Node.js installation required:

```bash
make build
```

Available Make targets:
- `make build` - Build the project using Docker
- `make clean` - Clean build artifacts and Docker images
- `make deploy` - Build and deploy to GitHub Pages (interactive)
- `make deploy-force` - Build and deploy without confirmation
- `make dev` - Start development mode with file watching
- `make help` - Show all available targets

This will:
1. Build a Docker container with Node.js and TypeScript
2. Compile TypeScript to JavaScript
3. Copy assets (HTML, CSS, images)
4. Output everything to `dist/` directory

### Manual Build (if Node.js is installed)

```bash
npm install
npm run build
```

## Deployment

After building, the `dist/` directory contains:
- `app.js` - Compiled JavaScript (ES modules)
- `index.html` - Updated HTML with module imports
- `styles.css` - Original styles
- `table.png` - Multiplication table image

Deploy these files to your web server or GitHub Pages.

## Benefits of New Architecture

1. **Separation of Concerns**
   - UI logic separated from business logic
   - Easy to add new quiz types
   - Configurable quiz parameters

2. **Type Safety**
   - TypeScript ensures compile-time error checking
   - Better IDE support and autocompletion
   - Clear interfaces define component contracts

3. **Extensibility**
   - Adding new quiz types only requires implementing `QuizTaskGenerator`
   - UI manager works with any quiz type
   - Easy to modify timing, scoring, or celebration logic

4. **Maintainability**
   - Smaller, focused classes
   - Clear dependency injection
   - Better testability

## Adding New Quiz Types

To add a new quiz type (e.g., Addition):

1. Define a new problem interface in `types.ts`:
```typescript
export interface AdditionProblem extends Problem {
    num1: number;
    num2: number;
}
```

2. Create a task generator:
```typescript
export class AdditionTaskGenerator implements QuizTaskGenerator<AdditionProblem> {
    // Implement required methods
}
```

3. Add to main app:
```typescript
const taskGenerator = new AdditionTaskGenerator();
const quizInstance = new QuizUIManager<AdditionProblem>(config, taskGenerator);
```

## Docker-based Development

The project uses Docker to eliminate the need for local Node.js installation. The build process is completely containerized, making it easy to build and deploy from any system with Docker installed. 