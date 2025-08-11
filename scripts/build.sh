#!/bin/bash

# Build script for POV-CLI Terminal Docker image
set -e

# Configuration
IMAGE_NAME="pov-cli-terminal"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"
BUILD_CONTEXT="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo_info "Build context: ${BUILD_CONTEXT}"

# Build with build arguments if needed
docker build \
    --build-arg NODE_ENV=production \
    --build-arg NEXT_TELEMETRY_DISABLED=1 \
    -t "${IMAGE_NAME}:${IMAGE_TAG}" \
    "${BUILD_CONTEXT}"

if [ $? -eq 0 ]; then
    echo_info "Successfully built ${IMAGE_NAME}:${IMAGE_TAG}"
else
    echo_error "Failed to build Docker image"
    exit 1
fi

# Tag for registry if specified
if [ -n "${REGISTRY}" ]; then
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    echo_info "Tagging image for registry: ${FULL_IMAGE}"
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${FULL_IMAGE}"
    
    # Ask if user wants to push
    read -p "Push to registry ${REGISTRY}? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo_info "Pushing to registry..."
        docker push "${FULL_IMAGE}"
        echo_info "Successfully pushed ${FULL_IMAGE}"
    fi
fi

# Show image information
echo_info "Image details:"
docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}"

# Test the image (optional)
read -p "Run a test container? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo_info "Starting test container on port 8080..."
    docker run -d --name "${IMAGE_NAME}-test" -p 8080:80 "${IMAGE_NAME}:${IMAGE_TAG}"
    echo_info "Test container started. Access at http://localhost:8080"
    echo_info "Health check: curl http://localhost:8080/health"
    echo_warn "Remember to stop the test container: docker stop ${IMAGE_NAME}-test && docker rm ${IMAGE_NAME}-test"
fi

echo_info "Build completed successfully!"
