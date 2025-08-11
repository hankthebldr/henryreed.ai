#!/bin/bash

# Cleanup script for POV-CLI Terminal Kubernetes resources
set -e

# Configuration
NAMESPACE="pov-cli"
APP_NAME="pov-cli-terminal"
FORCE="${FORCE:-false}"

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
    
    if ! command -v kubectl &> /dev/null; then
        echo_error "kubectl not found. Please install kubectl and try again."
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        echo_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    echo_info "Prerequisites check passed"
}

# Show current resources
show_resources() {
    echo_step "Current resources in namespace ${NAMESPACE}:"
    
    if kubectl get namespace ${NAMESPACE} &> /dev/null; then
        echo_info "Namespace exists. Listing resources:"
        kubectl get all -n ${NAMESPACE} 2>/dev/null || echo "No resources found"
        kubectl get ingress -n ${NAMESPACE} 2>/dev/null || echo "No ingress found"
        kubectl get hpa -n ${NAMESPACE} 2>/dev/null || echo "No HPA found"
        kubectl get pdb -n ${NAMESPACE} 2>/dev/null || echo "No PDB found"
        kubectl get configmaps -n ${NAMESPACE} 2>/dev/null || echo "No ConfigMaps found"
        kubectl get secrets -n ${NAMESPACE} 2>/dev/null || echo "No secrets found"
    else
        echo_info "Namespace ${NAMESPACE} does not exist"
        return 0
    fi
}

# Confirm cleanup
confirm_cleanup() {
    if [[ "${FORCE}" == "true" ]]; then
        echo_warn "Force mode enabled. Skipping confirmation."
        return 0
    fi
    
    echo_warn "This will DELETE all resources in the ${NAMESPACE} namespace!"
    echo_warn "This action cannot be undone."
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
    
    if [[ $REPLY != "yes" ]]; then
        echo_info "Cleanup cancelled by user"
        exit 0
    fi
}

# Cleanup resources
cleanup_resources() {
    echo_step "Cleaning up Kubernetes resources..."
    
    # Check if namespace exists
    if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
        echo_info "Namespace ${NAMESPACE} does not exist. Nothing to clean up."
        return 0
    fi
    
    # Scale down deployment first for graceful shutdown
    echo_info "Scaling down deployment..."
    kubectl scale deployment ${APP_NAME} --replicas=0 -n ${NAMESPACE} 2>/dev/null || true
    
    # Wait a bit for graceful shutdown
    sleep 5
    
    # Delete individual resources (gives more control than deleting namespace)
    echo_info "Deleting ingress..."
    kubectl delete ingress --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    echo_info "Deleting services..."
    kubectl delete services --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    echo_info "Deleting HPA..."
    kubectl delete hpa --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    echo_info "Deleting PDB..."
    kubectl delete pdb --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    echo_info "Deleting deployment..."
    kubectl delete deployment --all -n ${NAMESPACE} --timeout=120s 2>/dev/null || true
    
    echo_info "Deleting configmaps..."
    kubectl delete configmaps --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    echo_info "Deleting secrets..."
    kubectl delete secrets --all -n ${NAMESPACE} --timeout=60s 2>/dev/null || true
    
    # Finally delete the namespace
    echo_info "Deleting namespace..."
    kubectl delete namespace ${NAMESPACE} --timeout=120s 2>/dev/null || true
    
    echo_info "Cleanup completed"
}

# Verify cleanup
verify_cleanup() {
    echo_step "Verifying cleanup..."
    
    if kubectl get namespace ${NAMESPACE} &> /dev/null; then
        echo_warn "Namespace ${NAMESPACE} still exists. It may be in 'Terminating' state."
        echo_info "You can check with: kubectl get namespace ${NAMESPACE}"
        
        # Show any remaining resources
        local remaining=$(kubectl get all -n ${NAMESPACE} 2>/dev/null | grep -v "No resources found" | wc -l)
        if [ "$remaining" -gt 1 ]; then
            echo_warn "Some resources may still be terminating:"
            kubectl get all -n ${NAMESPACE}
        fi
    else
        echo_info "Namespace ${NAMESPACE} successfully deleted"
    fi
}

# Main execution
main() {
    echo_info "Starting cleanup for ${APP_NAME} in namespace ${NAMESPACE}"
    echo_info "Force mode: ${FORCE}"
    echo ""
    
    check_prerequisites
    show_resources
    confirm_cleanup
    cleanup_resources
    verify_cleanup
    
    echo_info "Cleanup process completed!"
    echo_info "If resources are still terminating, wait a few minutes and check again."
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE="true"
            shift
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force             Skip confirmation prompt"
            echo "  --namespace NAME    Specify namespace to clean (default: pov-cli)"
            echo "  --help              Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  FORCE               Set to 'true' to skip confirmation"
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
