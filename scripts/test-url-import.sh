#!/bin/bash

# URL Import Test Runner Script
# This script runs the URL import functionality tests with proper setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Study Planner - URL Import Test Runner${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if we're in the right directory
if [ ! -f "playwright.config.ts" ]; then
    echo -e "${RED}❌ Error: Not in the study-planner-app directory${NC}"
    echo "Please run this script from the study-planner-app directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check if Playwright browsers are installed
if [ ! -d "node_modules/@playwright/test" ]; then
    echo -e "${YELLOW}🌐 Installing Playwright browsers...${NC}"
    npx playwright install
fi

# Create screenshots directory if it doesn't exist
mkdir -p test-results/screenshots

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""

# Function to run a specific test
run_test() {
    local test_name=$1
    local description=$2
    
    echo -e "${BLUE}🚀 Running: ${description}${NC}"
    echo -e "${BLUE}Test file: ${test_name}${NC}"
    echo ""
    
    if npx playwright test "$test_name" --reporter=line; then
        echo -e "${GREEN}✅ ${description} - PASSED${NC}"
    else
        echo -e "${RED}❌ ${description} - FAILED${NC}"
        echo -e "${YELLOW}📸 Check screenshots in test-results/screenshots/${NC}"
        return 1
    fi
    echo ""
}

# Default behavior - run all URL import tests
if [ $# -eq 0 ]; then
    echo -e "${BLUE}Running all URL import tests...${NC}"
    echo ""
    
    run_test "url-import-functionality" "Comprehensive URL Import Test"
    run_test "url-import-simplified" "Simplified URL Import Test"
    
    echo -e "${GREEN}🎉 All URL import tests completed!${NC}"
    echo ""
    echo -e "${BLUE}📊 To view detailed results:${NC}"
    echo "npx playwright show-report"
    echo ""
    echo -e "${BLUE}📸 Screenshots saved to:${NC}"
    echo "test-results/screenshots/"

# Handle command line arguments
elif [ "$1" = "comprehensive" ] || [ "$1" = "full" ]; then
    run_test "url-import-functionality" "Comprehensive URL Import Test"
    
elif [ "$1" = "simplified" ] || [ "$1" = "simple" ]; then
    run_test "url-import-simplified" "Simplified URL Import Test"
    
elif [ "$1" = "debug" ]; then
    echo -e "${YELLOW}🐛 Running in debug mode...${NC}"
    npx playwright test url-import-functionality --debug
    
elif [ "$1" = "ui" ]; then
    echo -e "${YELLOW}🖥️  Running with UI mode...${NC}"
    npx playwright test url-import-functionality --ui
    
elif [ "$1" = "headed" ]; then
    echo -e "${YELLOW}👁️  Running in headed mode...${NC}"
    npx playwright test url-import-functionality --headed
    
elif [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${BLUE}URL Import Test Runner Usage:${NC}"
    echo ""
    echo "  ./scripts/test-url-import.sh                 # Run all URL import tests"
    echo "  ./scripts/test-url-import.sh comprehensive   # Run comprehensive test only"
    echo "  ./scripts/test-url-import.sh simplified      # Run simplified test only"
    echo "  ./scripts/test-url-import.sh debug           # Run in debug mode"
    echo "  ./scripts/test-url-import.sh ui              # Run with UI mode"
    echo "  ./scripts/test-url-import.sh headed          # Run in headed mode (visible browser)"
    echo "  ./scripts/test-url-import.sh help            # Show this help message"
    echo ""
    echo -e "${BLUE}Test Features:${NC}"
    echo "  ✅ Complete URL import workflow testing"
    echo "  ✅ BYJU's ICSE Math syllabus verification"
    echo "  ✅ Console log capture and verification"
    echo "  ✅ Screenshot capture at each step"
    echo "  ✅ Error handling validation"
    echo "  ✅ Cross-browser compatibility"
    echo ""
    echo -e "${BLUE}Expected Results:${NC}"
    echo "  📚 8 Mathematics chapters imported"
    echo "  🔍 Specific chapter names verified"
    echo "  📊 Console debug output captured"
    echo "  📸 Screenshots saved for debugging"
    
else
    echo -e "${RED}❌ Unknown argument: $1${NC}"
    echo "Use './scripts/test-url-import.sh help' for usage information"
    exit 1
fi