#!/bin/bash

# Kubernetes deployment script for POV-CLI Terminal
set -e

# Configuration
NAMESPACE="pov-cli"
APP_NAME="pov-cli-terminal"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"
DRY_RUN="${DRY_RUN:-false}"
USE_KUSTOMIZE="${USE_KUSTOMIZE:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo_step "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo_error "kubectl not found. Please install kubectl and try again."
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        echo_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    # Check kustomize if needed
    if [[ "${USE_KUSTOMIZE}" == "true" ]] && ! command -v kubectl kustomize &> /dev/null; then
        echo_warn "Kustomize not available. Falling back to direct kubectl apply."
        USE_KUSTOMIZE="false"
    fi
    
    echo_info "Prerequisites check passed"
}

# Update image in deployment
update_image() {
    if [ -n "${REGISTRY}" ]; then
        local image="${REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
        echo_info "Updating deployment to use image: ${image}"
        
        # Update kustomization.yaml if using kustomize
        if [[ "${USE_KUSTOMIZE}" == "true" ]]; then
            sed -i.bak "s|newTag:.*|newTag: ${IMAGE_TAG}|g" k8s/kustomization.yaml
            sed -i.bak "s|name: pov-cli-terminal:latest|name: ${image}|g" k8s/kustomization.yaml
        else
            # Update deployment.yaml directly
            sed -i.bak "s|image: pov-cli-terminal:latest.*|image: ${image}|g" k8s/deployment.yaml
        fi
    fi
}

# Deploy to Kubernetes
deploy() {
    echo_step "Deploying ${APP_NAME} to Kubernetes..."
    
    local dry_run_flag=""
    if [[ "${DRY_RUN}" == "true" ]]; then
        dry_run_flag="--dry-run=client"
        echo_warn "Running in dry-run mode"
    fi
    
    if [[ "${USE_KUSTOMIZE}" == "true" ]]; then
        echo_info "Using Kustomize for deployment"
        kubectl apply -k k8s/ ${dry_run_flag}
    else
        echo_info "Using direct kubectl apply"
        kubectl apply -f k8s/ ${dry_run_flag}
    fi
    
    if [[ "${DRY_RUN}" != "true" ]]; then
        echo_info "Deployment initiated successfully"
    fi
}

# Wait for deployment to complete
wait_for_deployment() {
    if [[ "${DRY_RUN}" == "true" ]]; then
        return 0
    fi
    
    echo_step "Waiting for deployment to complete..."
    
    # Wait for namespace to be active
    kubectl wait --for=condition=Active namespace/${NAMESPACE} --timeout=30s
    
    # Wait for deployment to be available
    kubectl wait --for=condition=Available deployment/${APP_NAME} -n ${NAMESPACE} --timeout=300s
    
    if [ $? -eq 0 ]; then
        echo_info "Deployment completed successfully"
    else
        echo_error "Deployment failed or timed out"
        return 1
    fi
}

# Verify deployment
verify_deployment() {
    if [[ "${DRY_RUN}" == "true" ]]; then
        return 0
    fi
    
    echo_step "Verifying deployment..."
    
    # Check deployment status
    kubectl get deployment ${APP_NAME} -n ${NAMESPACE}
    
    # Check pod status
    kubectl get pods -l app=${APP_NAME} -n ${NAMESPACE}
    
    # Check service status
    kubectl get services -n ${NAMESPACE}
    
    # Check ingress status
    kubectl get ingress -n ${NAMESPACE}
    
    # Check HPA status
    kubectl get hpa -n ${NAMESPACE}
    
    echo_info "Deployment verification completed"
}

# Show access information
show_access_info() {
    if [[ "${DRY_RUN}" == "true" ]]; then
        return 0
    fi
    
    echo_step "Access Information"
    
    # Get ingress information
    local ingress_ip=$(kubectl get ingress ${APP_NAME}-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    local ingress_hostname=$(kubectl get ingress ${APP_NAME}-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [ -n "${ingress_ip}" ]; then
        echo_info "Ingress IP: ${ingress_ip}"
    elif [ -n "${ingress_hostname}" ]; then
        echo_info "Ingress Hostname: ${ingress_hostname}"
    fi
    
    # Get NodePort information
    local nodeport=$(kubectl get service ${APP_NAME}-nodeport -n ${NAMESPACE} -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "")
    if [ -n "${nodeport}" ]; then
        echo_info "NodePort: ${nodeport}"
        echo_info "Access via NodePort: http://<node-ip>:${nodeport}"
    fi
    
    # Port forwarding option
    echo_info "Alternative access via port forwarding:"
    echo_info "kubectl port-forward service/${APP_NAME}-service 8080:80 -n ${NAMESPACE}"
    echo_info "Then access at: http://localhost:8080"
}

# Cleanup backup files
cleanup() {
    rm -f k8s/*.bak
}

# Main execution
main() {
    echo_info "Starting Kubernetes deployment for ${APP_NAME}"
    echo_info "Namespace: ${NAMESPACE}"
    echo_info "Image tag: ${IMAGE_TAG}"
    echo_info "Registry: ${REGISTRY:-none}"
    echo_info "Dry run: ${DRY_RUN}"
    echo ""
    
    check_prerequisites
    update_image
    deploy
    wait_for_deployment
    verify_deployment
    show_access_info
    cleanup
    
    echo_info "Deployment process completed!"
    echo_info "Monitor your deployment with: kubectl get all -n ${NAMESPACE}"
    echo_info "View logs with: kubectl logs -f deployment/${APP_NAME} -n ${NAMESPACE}"
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --no-kustomize)
            USE_KUSTOMIZE="false"
            shift
            ;;
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run           Run in dry-run mode"
            echo "  --no-kustomize      Use direct kubectl apply instead of kustomize"
            echo "  --image-tag TAG     Specify image tag (default: latest)"
            echo "  --registry URL      Specify container registry"
            echo "  --help              Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  IMAGE_TAG           Image tag to deploy"
            echo "  REGISTRY            Container registry URL"
            echo "  DRY_RUN             Set to 'true' for dry-run mode"
            echo "  USE_KUSTOMIZE       Set to 'false' to disable kustomize"
            exit 0
            ;;
        *)
            echo_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main
