# URL Import Functionality Tests

This directory contains comprehensive Playwright tests for the URL import functionality in the Study Planner application.

## Test Files

### 1. `url-import-functionality.spec.ts`
The main comprehensive test that covers the complete end-to-end flow:
- ✅ Navigate to Subjects page
- ✅ Clear existing chapters
- ✅ Open Smart Import modal
- ✅ Add new curriculum source
- ✅ Import from BYJU's ICSE Math URL
- ✅ Select Mathematics subject
- ✅ Customize import settings  
- ✅ Import selected chapters
- ✅ Verify 8 expected mathematics chapters
- ✅ Capture and verify console debug logs
- ✅ Take screenshots at each step

### 2. `url-import-simplified.spec.ts`
A simplified version using helper methods for better maintainability:
- Uses dedicated URL import helper methods
- Cleaner test structure
- Includes error handling test
- Tests quick import functionality

## Expected Test Results

### BYJU's ICSE Class 9 Mathematics Chapters
The test verifies that these specific chapters are imported:

1. **Rational and Irrational Numbers**
2. **Compound Interest (Using Formula)**
3. **Expansions (Including Substitution)**
4. **Factorizations**
5. **Simultaneous Linear Equations**
6. **Indices (Exponents)**
7. **Logarithms**
8. **Triangles [Congruency in Triangles]**

## Running the Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Only URL Import Tests
```bash
# Run the main comprehensive test
npx playwright test url-import-functionality

# Run the simplified test
npx playwright test url-import-simplified

# Run with UI for debugging
npx playwright test url-import-functionality --ui

# Run in debug mode
npx playwright test url-import-functionality --debug
```

### Run with Specific Browser
```bash
# Chrome only
npx playwright test url-import-functionality --project=chromium

# Firefox only  
npx playwright test url-import-functionality --project=firefox

# Safari only
npx playwright test url-import-functionality --project=webkit
```

## Test Features

### 🔍 Comprehensive Coverage
- **Navigation**: Tests proper page routing and modal interactions
- **URL Processing**: Verifies URL input, validation, and import processing
- **Data Verification**: Checks that curriculum data is correctly parsed and imported
- **UI Interactions**: Tests all modal flows, button clicks, and form submissions
- **Error Handling**: Verifies graceful degradation for invalid URLs

### 📸 Screenshot Capture
Tests automatically capture screenshots at key steps:
- `01-subjects-page-loaded.png`
- `02-chapters-cleared.png`
- `03-smart-import-modal-opened.png`
- `04-add-source-modal-opened.png`
- `05-url-entered.png`
- `06-processing-started.png`
- `07-curriculum-imported.png`
- `08-curriculum-selected.png`
- `09-mathematics-selected.png`
- `10-customize-step.png`
- `11-import-progress.png`
- `12-chapters-imported.png`
- `13-final-verification.png`

### 🐛 Debug Logging
Tests capture and verify console output:
- Import process debug messages
- Chapter parsing logs  
- Subject processing information
- Error handling messages

### ⚡ Performance & Reliability
- **Robust Selectors**: Uses multiple selector strategies for element targeting
- **Smart Waits**: Implements proper waits for async operations and network calls
- **Error Recovery**: Handles modal closures, timeouts, and processing delays
- **Cross-Browser**: Tested on Chrome, Firefox, and Safari

## Troubleshooting

### Common Issues

**Test fails at "Smart Import" button click:**
- Ensure the app is running on `localhost:5173`
- Check that the Subjects page loads correctly
- Verify user authentication is working

**URL import processing timeout:**
- The test allows 30 seconds for processing
- Check network connectivity
- Verify the BYJU's URL is accessible

**Chapter verification fails:**
- Chapter names may vary based on curriculum parsing
- Test accepts partial matches for flexibility
- Check console logs for actual vs expected chapters

**Screenshot comparison fails:**
- Screenshots are for debugging, not comparison by default
- Use `--update-snapshots` to update reference images if needed

### Debug Mode
```bash
# Run in headed mode to see browser interaction
npx playwright test url-import-functionality --headed

# Run with slow motion
npx playwright test url-import-functionality --headed --slow-mo=1000

# Run with debug console
npx playwright test url-import-functionality --debug
```

### View Test Reports
```bash
# Generate and open HTML report
npx playwright show-report
```

## Test Data Sources

The test uses the live BYJU's ICSE Mathematics syllabus:
- **URL**: `https://byjus.com/icse/icse-maths-class-9-syllabus/`
- **Source**: Official BYJU's educational platform
- **Content**: ICSE Class 9 Mathematics curriculum
- **Expected Chapters**: 8 core mathematical topics

## Helper Methods

The `TestHelpers` class provides specialized methods for URL import testing:
- `openSmartImport()`: Opens the Smart Import modal
- `openAddSource()`: Opens the Add Source modal
- `importFromURL(url)`: Handles URL input and import process
- `selectFirstCurriculum()`: Selects imported curriculum
- `selectFirstSubject()`: Selects subject for import
- `proceedToCustomize()`: Navigates to customization step
- `importSelectedChapters()`: Completes the import process
- `verifyChaptersImported()`: Validates import results

## CI/CD Integration

These tests are configured to run in CI environments:
- **Headless Mode**: Tests run without browser UI in CI
- **Retry Logic**: Failed tests retry up to 2 times
- **Parallel Execution**: Tests can run in parallel for faster execution
- **Artifact Collection**: Screenshots and videos saved on failure
- **Multiple Browsers**: Tests run across Chrome, Firefox, and Safari

## Contributing

When adding new URL import tests:
1. Use the existing `TestHelpers` methods
2. Add appropriate screenshots for debugging
3. Verify console log capture
4. Test error handling scenarios
5. Update this README with new test descriptions