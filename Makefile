# Makefile for Math Practice TypeScript project
# Uses Docker to avoid local Node.js installation

.PHONY: build clean deploy help docker-build extract-files

# Default target
all: build

# Build the project using Docker
build: docker-build extract-files
	@echo "Build complete! Files are in the 'dist' directory."
	@echo "You can now deploy the contents of the 'dist' directory to your website."

# Build Docker image
docker-build:
	@echo "Building Math Practice TypeScript project with Docker..."
	docker build -t math-practice-builder .

# Extract built files from Docker container
extract-files:
	@echo "Extracting built files..."
	docker create --name temp-container math-practice-builder || true
	docker cp temp-container:/app/dist ./
	docker rm temp-container || true

# Clean all build artifacts and temporary files
clean:
	@echo "Cleaning build artifacts and temporary files..."
	rm -rf dist/
	rm -f *.d.ts *.js.map
	rm -f *.js index.html styles.css
	rm -rf node_modules/ 2>/dev/null || true
	rm -f package-lock.json 2>/dev/null || true
	docker rmi math-practice-builder 2>/dev/null || true
	docker rm temp-container 2>/dev/null || true
	@echo "All artifacts and temporary files cleaned."

# Complete deployment workflow: build -> deploy -> commit -> clean
deploy:
	@echo "=== Starting deployment workflow ==="
	@echo "Step 1: Building project..."
	$(MAKE) build
	@echo ""
	@echo "Step 2: Deploying to root directory..."
	@if [ -d ".git" ] && git remote get-url origin | grep -q "dukelog.github.io"; then \
		echo "Detected GitHub Pages repository."; \
		echo "Copying built files to root..."; \
		cp dist/* ./; \
		echo ""; \
		echo "Step 3: Git commit and push..."; \
		read -p "Commit and push changes to GitHub? (y/n): " git_response; \
		if [ "$$git_response" = "y" ] || [ "$$git_response" = "Y" ]; then \
			git add .; \
			git commit -m "Deploy TypeScript version - $$(date '+%Y-%m-%d %H:%M')"; \
			git push origin main; \
			echo "Successfully pushed to GitHub!"; \
		else \
			echo "Skipped git commit/push. You can manually commit later."; \
		fi; \
	else \
		echo "Not a GitHub Pages repository or no git remote found."; \
	fi
	@echo ""
	@echo "Step 4: Cleaning up temporary files..."
	$(MAKE) clean
	@echo "=== Deployment workflow complete ==="



# Serve built files on port 8080
serve: build
	@echo "Starting development server on http://localhost:8080..."
	@echo "Press Ctrl+C to stop the server"
	docker run --rm -v $$(pwd)/dist:/usr/share/nginx/html:ro -p 8080:80 nginx:alpine

# Help target
help:
	@echo "Available targets:"
	@echo "  build         - Build the project using Docker"
	@echo "  clean         - Clean all build artifacts and temporary files"
	@echo "  deploy        - Complete deployment: build -> deploy -> commit -> clean"
	@echo "  serve         - Build and start development server on port 8080"
	@echo "  help          - Show this help message" 