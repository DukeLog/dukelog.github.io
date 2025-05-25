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
	rm -f app.js QuizUIManager.js MultiplicationTaskGenerator.js DivisionTaskGenerator.js types.js
	rm -rf node_modules/ 2>/dev/null || true
	rm -f package-lock.json 2>/dev/null || true
	docker rmi math-practice-builder 2>/dev/null || true
	docker rm temp-container 2>/dev/null || true
	@echo "All artifacts and temporary files cleaned."

# Deploy to GitHub Pages root (interactive)
deploy: build
	@if [ -d ".git" ] && git remote get-url origin | grep -q "dukelog.github.io"; then \
		echo "Detected GitHub Pages repository."; \
		read -p "Do you want to deploy to root? (y/n): " response; \
		if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
			$(MAKE) backup-and-deploy; \
		fi; \
	else \
		echo "Not a GitHub Pages repository or no git remote found."; \
	fi

# Backup old files and deploy new ones
backup-and-deploy:
	@echo "Backing up original files..."
	mkdir -p backup_old
	cp index.html backup_old/ 2>/dev/null || true
	cp script.js backup_old/ 2>/dev/null || true
	cp styles.css backup_old/ 2>/dev/null || true
	@echo "Deploying new files..."
	cp dist/* ./
	@echo "Cleaning up temporary files..."
	$(MAKE) clean
	@echo "Files deployed to root directory and temporary files cleaned up."
	@echo "You can now commit and push to GitHub."

# Force deploy without confirmation
deploy-force: build backup-and-deploy

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
	@echo "  deploy        - Build and deploy to GitHub Pages (interactive)"
	@echo "  deploy-force  - Build and deploy without confirmation"
	@echo "  serve         - Build and start development server on port 8080"
	@echo "  help          - Show this help message" 