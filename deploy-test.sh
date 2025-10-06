#!/bin/bash

# Cortex DC Portal - Firebase Deployment & Testing Script
# This script tests, builds, and optionally deploys all Firebase services

set -e  # Exit on error

echo "🚀 Cortex DC Portal - Firebase Deployment & Testing"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the project root directory."
    exit 1
fi

print_success "Firebase CLI found and project structure validated"

# Check current Firebase project
current_project=$(firebase use)
print_status "Current Firebase project: $current_project"

# Function to test build for a specific function codebase
test_build() {
    local codebase=$1
    local directory=$2
    
    print_status "Testing build for $codebase functions..."
    
    if [ -d "$directory" ]; then
        cd "$directory"
        
        # Check if package.json exists
        if [ -f "package.json" ]; then
            print_status "Installing dependencies for $codebase..."
            npm install
            
            print_status "Building $codebase functions..."
            npm run build
            
            print_success "$codebase functions built successfully"
        else
            print_warning "No package.json found in $directory"
        fi
        
        cd - > /dev/null
    else
        print_warning "$directory directory not found"
    fi
}

# Test Functions builds
echo ""
print_status "Testing Cloud Functions builds..."
test_build "default" "functions"
test_build "henryreedai (Genkit)" "henryreedai"

# Validate Firebase configuration
echo ""
print_status "Validating Firebase configuration..."

# Check hosting configuration
if [ -d "hosting" ]; then
    if [ -d "hosting/out" ]; then
        print_success "Hosting build directory exists"
    else
        print_warning "Hosting build directory (hosting/out) not found. Run 'cd hosting && npm run build' first."
    fi
else
    print_error "Hosting directory not found"
fi

# Check Firestore rules
if [ -f "hosting/firestore.rules" ]; then
    print_success "Firestore rules file found"
else
    print_error "Firestore rules file not found"
fi

# Check Storage rules
if [ -f "hosting/storage.rules" ]; then
    print_success "Storage rules file found"
else
    print_error "Storage rules file not found"
fi

# Check Data Connect configuration
if [ -f "dataconnect/dataconnect.yaml" ]; then
    print_success "Data Connect configuration found"
    if [ -f "dataconnect/schema/schema.gql" ]; then
        print_success "Data Connect schema found"
    else
        print_warning "Data Connect schema not found"
    fi
else
    print_warning "Data Connect configuration not found"
fi

# Check Remote Config template
if [ -f "hosting/remoteconfig.template.json" ]; then
    print_success "Remote Config template found"
else
    print_warning "Remote Config template not found"
fi

# Function to start emulators
start_emulators() {
    print_status "Starting Firebase emulators..."
    
    # Kill any existing emulator processes
    pkill -f "firebase.*emulators" || true
    
    # Start emulators in background
    firebase emulators:start --only auth,firestore,functions,hosting,storage &
    EMULATOR_PID=$!
    
    # Wait a bit for emulators to start
    sleep 10
    
    # Check if emulators are running
    if kill -0 $EMULATOR_PID 2>/dev/null; then
        print_success "Firebase emulators started successfully (PID: $EMULATOR_PID)"
        return 0
    else
        print_error "Failed to start Firebase emulators"
        return 1
    fi
}

# Function to test emulator endpoints
test_emulators() {
    print_status "Testing emulator endpoints..."
    
    # Test Auth emulator
    if curl -s http://localhost:9099/ > /dev/null; then
        print_success "Auth emulator responding"
    else
        print_error "Auth emulator not responding"
    fi
    
    # Test Firestore emulator
    if curl -s http://localhost:8080/ > /dev/null; then
        print_success "Firestore emulator responding"
    else
        print_error "Firestore emulator not responding"
    fi
    
    # Test Functions emulator
    if curl -s http://localhost:5001/ > /dev/null; then
        print_success "Functions emulator responding"
    else
        print_error "Functions emulator not responding"
    fi
    
    # Test Hosting emulator
    if curl -s http://localhost:5000/ > /dev/null; then
        print_success "Hosting emulator responding"
    else
        print_error "Hosting emulator not responding"
    fi
    
    # Test Storage emulator
    if curl -s http://localhost:9199/ > /dev/null; then
        print_success "Storage emulator responding"
    else
        print_error "Storage emulator not responding"
    fi
}

# Function to stop emulators
stop_emulators() {
    print_status "Stopping Firebase emulators..."
    pkill -f "firebase.*emulators" || true
    print_success "Firebase emulators stopped"
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_status "Deploying to Firebase..."
    
    read -p "Are you sure you want to deploy to production? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        # Build hosting if needed
        if [ -d "hosting" ]; then
            print_status "Building hosting application..."
            cd hosting
            npm run build
            cd - > /dev/null
        fi
        
        # Deploy all services
        firebase deploy
        print_success "Deployment completed successfully!"
    else
        print_status "Deployment cancelled"
    fi
}

# Parse command line arguments
case "${1:-test}" in
    "test")
        echo ""
        print_status "Running test mode..."
        ;;
    
    "emulators")
        echo ""
        if start_emulators; then
            test_emulators
            echo ""
            print_status "Emulators are running. Press Ctrl+C to stop."
            trap stop_emulators INT
            wait $EMULATOR_PID
        fi
        ;;
    
    "deploy")
        echo ""
        deploy_to_firebase
        ;;
    
    "functions")
        echo ""
        print_status "Deploying functions only..."
        firebase deploy --only functions
        ;;
    
    "hosting")
        echo ""
        print_status "Building and deploying hosting only..."
        cd hosting
        npm run build
        cd - > /dev/null
        firebase deploy --only hosting
        ;;
    
    "rules")
        echo ""
        print_status "Deploying rules only..."
        firebase deploy --only firestore:rules,storage:rules
        ;;
    
    "genkit")
        echo ""
        print_status "Testing Genkit functions specifically..."
        cd henryreedai
        npm run build
        print_status "Starting Genkit development server..."
        npm run genkit:start
        ;;
    
    "help"|"-h"|"--help")
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  test        - Run build tests and validation (default)"
        echo "  emulators   - Start Firebase emulators for local testing"
        echo "  deploy      - Deploy to Firebase production"
        echo "  functions   - Deploy functions only"
        echo "  hosting     - Deploy hosting only"
        echo "  rules       - Deploy security rules only"
        echo "  genkit      - Start Genkit development server"
        echo "  help        - Show this help message"
        echo ""
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
print_success "Script completed successfully!"
echo ""
print_status "Next steps:"
echo "  - Run '$0 emulators' to test locally"
echo "  - Run '$0 deploy' to deploy to production"
echo "  - Run '$0 genkit' to test Genkit AI functions"
echo "  - Check https://console.firebase.google.com for project status"
echo ""