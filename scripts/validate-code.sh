#!/bin/bash

echo "🚀 Running comprehensive code validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 passed${NC}"
    else
        echo -e "${RED}❌ $2 failed${NC}"
    fi
}

# Initialize error counter
ERRORS=0

# 1. TypeScript type checking
echo -e "${YELLOW}🔍 Running TypeScript type checking...${NC}"
npm run type-check
TYPE_CHECK_EXIT=$?
print_status $TYPE_CHECK_EXIT "TypeScript type checking"
ERRORS=$((ERRORS + TYPE_CHECK_EXIT))

# 2. ESLint checking
echo -e "${YELLOW}🔍 Running ESLint...${NC}"
npm run lint
LINT_EXIT=$?
print_status $LINT_EXIT "ESLint checking"
ERRORS=$((ERRORS + LINT_EXIT))

# 3. Jest tests (if available)
echo -e "${YELLOW}🔍 Running tests...${NC}"
npm test -- --passWithNoTests --watchAll=false
TEST_EXIT=$?
print_status $TEST_EXIT "Jest tests"
ERRORS=$((ERRORS + TEST_EXIT))

# Final result
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed! Code is ready for production.${NC}"
    exit 0
else
    echo -e "${RED}🚫 $ERRORS validation(s) failed. Fix all issues before pushing.${NC}"
    exit 1
fi
