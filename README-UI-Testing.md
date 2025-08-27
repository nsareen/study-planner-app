# UI Testing Subagent for Study Planner

This document describes how to use the specialized UI Testing Subagent for comprehensive browser-based functional testing of the Study Planner application.

## Overview

The UI Testing Subagent is a comprehensive testing framework that provides:

- **Automated browser testing** with Playwright
- **Intelligent test generation** based on application analysis
- **Cross-browser and cross-device testing**
- **Accessibility and performance testing**
- **Visual regression testing**
- **CI/CD integration**
- **Debugging and maintenance assistance**

## Quick Start

### 1. Installation

Testing dependencies are already installed. If you need to reinstall:

```bash
npm install --save-dev @playwright/test playwright @types/node vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx playwright install
```

### 2. Basic Usage

```typescript
import { createUITestingAgent } from './ui-testing-agent';
import { test } from '@playwright/test';

test('Basic test with UI agent', async ({ page }) => {
  // Create and initialize the agent
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  // Analyze the application
  const analysis = await agent.analyzeApplication('http://localhost:5173');
  
  // Generate and execute tests
  const scenarios = agent.generateTestScenarios(analysis);
  await agent.executeTestScenarios(scenarios);
});
```

### 3. Run Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage

# Interactive test runner
npm run test:e2e:ui

# Debug mode
npm run test:debug
```

## Features

### 1. Intelligent Application Analysis

The agent can analyze your application structure and generate appropriate tests:

```typescript
const agent = createUITestingAgent();
agent.initialize(page);

const analysis = await agent.analyzeApplication('http://localhost:5173');
// Returns: components, user flows, test coverage, recommendations
```

### 2. Automatic Test Generation

Based on the analysis, the agent generates comprehensive test scenarios:

```typescript
const scenarios = agent.generateTestScenarios(analysis);
// Generates tests for: critical paths, components, accessibility, performance
```

### 3. Cross-Browser Testing

Tests run across multiple browsers automatically:

```typescript
const agent = createUITestingAgent({
  browsers: ['chromium', 'firefox', 'webkit'],
  devices: ['Desktop Chrome', 'iPhone 12', 'Pixel 5']
});
```

### 4. Accessibility Testing

Built-in accessibility compliance testing:

```typescript
await agent.runAccessibilityTests();
// Checks: ARIA labels, keyboard navigation, color contrast, etc.
```

### 5. Performance Testing

Automated performance monitoring:

```typescript
await agent.runPerformanceTests();
// Measures: load times, navigation speed, resource usage
```

### 6. Visual Regression Testing

Compare visual changes across releases:

```typescript
await agent.runVisualTests([
  '/', '/subjects', '/calendar', '/progress'
]);
```

## Test Types

### Unit Tests
Located in `tests/unit/`, these test individual components in isolation.

```bash
npm run test:unit
```

### Integration Tests
Test component interactions and data flow.

### End-to-End Tests
Located in `tests/e2e/`, these test complete user workflows.

```bash
npm run test:e2e
```

### Visual Tests
Screenshot comparison tests for UI consistency.

### Accessibility Tests
WCAG compliance and screen reader compatibility.

### Performance Tests
Load time, responsiveness, and resource usage tests.

## Configuration

### Playwright Configuration
See `playwright.config.ts` for browser, device, and test settings.

### Vitest Configuration
See `vitest.config.ts` for unit test settings and coverage.

## Test Data and Helpers

### Test Helpers
`tests/utils/test-helpers.ts` provides utilities for:
- Element waiting and interaction
- Form filling and validation
- Navigation and URL checking
- Screenshot and debugging
- Accessibility checking

### Test Data
`tests/utils/test-data.ts` provides:
- Data generators for users, subjects, study plans
- Mock API responses
- Common test scenarios
- CSS selectors

## Example Test Files

### User Onboarding Test
```typescript
// tests/e2e/user-onboarding.spec.ts
test('should complete full onboarding flow', async ({ page }) => {
  const helpers = new TestHelpers(page);
  
  await page.goto('/');
  await helpers.clickElement('[data-testid="user-card"]:first-child');
  await expect(page.locator('[data-testid="tutorial"]')).toBeVisible();
  await helpers.clickElement('[data-testid="tutorial-complete"]');
  await helpers.expectTextToBeVisible('Today\'s Plan');
});
```

### Component Unit Test
```typescript
// tests/unit/components/UserSelection.test.tsx
test('should render user selection interface', () => {
  render(<UserSelection />);
  expect(screen.getByText(/select.*user/i)).toBeInTheDocument();
});
```

## Advanced Usage

### Custom Scenarios
```typescript
const customScenario = {
  name: 'Custom User Journey',
  description: 'Test specific user workflow',
  steps: [
    { action: 'navigate', target: '/' },
    { action: 'click', target: '[data-testid="add-subject"]' },
    { action: 'fill', target: '[data-testid="subject-name"]', value: 'Math' }
  ],
  expectedOutcome: 'User can create subject',
  priority: 'high',
  tags: ['critical']
};

await agent.executeTestScenarios([customScenario]);
```

### Multi-User Testing
```typescript
const userTypes = [
  { name: 'Student', permissions: ['read', 'create'] },
  { name: 'Teacher', permissions: ['read', 'create', 'edit'] }
];

for (const userType of userTypes) {
  // Set up user context and test permissions
  await testUserPermissions(userType);
}
```

### API Mocking
```typescript
await page.route('**/api/subjects', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify(mockSubjects)
  });
});
```

## CI/CD Integration

The agent automatically generates GitHub Actions workflows. See `.github/workflows/ui-tests.yml` for:

- **Unit Tests**: Component testing with coverage
- **E2E Tests**: Cross-browser functional testing  
- **Visual Tests**: Screenshot comparison
- **Accessibility Tests**: WCAG compliance
- **Performance Tests**: Load time monitoring
- **Lighthouse**: SEO and performance audits

### Running in CI
```bash
# In GitHub Actions
npm ci
npx playwright install --with-deps
npm run test:e2e
```

## Debugging

### Failed Test Debugging
The agent provides automatic debugging assistance:

```typescript
try {
  await agent.executeTestScenarios(scenarios);
} catch (error) {
  // Automatic debugging with screenshots, logs, and suggestions
  await agent.debugFailedScenario(scenario, error);
}
```

### Debug Mode
```bash
# Run tests in debug mode with browser UI
npm run test:debug

# Run tests with Playwright UI
npm run test:e2e:ui
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots at point of failure
- Video recordings of test execution
- Network logs and console errors

## Best Practices

### 1. Test Data Attributes
Add `data-testid` attributes to elements:

```tsx
<button data-testid="add-subject-button">Add Subject</button>
```

### 2. Page Object Models
Use helpers for reusable page interactions:

```typescript
class SubjectsPage {
  constructor(private helpers: TestHelpers) {}
  
  async addSubject(name: string) {
    await this.helpers.clickElement('[data-testid="add-subject"]');
    await this.helpers.fillField('[data-testid="subject-name"]', name);
    await this.helpers.clickElement('[data-testid="save-subject"]');
  }
}
```

### 3. Wait Strategies
Use proper waiting instead of fixed delays:

```typescript
// Good
await helpers.waitForElement('[data-testid="success-message"]');

// Bad
await page.waitForTimeout(5000);
```

### 4. Error Handling
Handle errors gracefully and provide context:

```typescript
try {
  await helpers.clickElement('[data-testid="save-button"]');
} catch (error) {
  await helpers.takeScreenshot('save-failed');
  throw new Error(`Save operation failed: ${error.message}`);
}
```

## Maintenance

### Updating Tests
When UI changes, the agent helps identify and update affected tests:

1. Run tests to identify failures
2. Use debug mode to analyze changes
3. Update selectors or expectations
4. Regenerate tests if needed

### Test Coverage
Monitor test coverage and identify gaps:

```bash
npm run test:coverage
```

### Performance Monitoring
Regular performance testing helps identify regressions:

```bash
# Run performance tests on each release
npm run test:e2e -- --grep="performance"
```

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout values in `playwright.config.ts`
- Use proper wait strategies instead of fixed delays
- Check for network issues or slow loading

**Flaky tests**
- Add explicit waits for dynamic content
- Use stable selectors (data-testid)
- Handle race conditions with proper synchronization

**Visual test failures**
- Update screenshots after legitimate UI changes
- Use threshold settings for minor pixel differences
- Consider responsive design variations

### Getting Help

1. Check test output and screenshots in `test-results/`
2. Use debug mode for interactive troubleshooting
3. Review the agent's debugging suggestions
4. Consult Playwright and Vitest documentation

## Contributing

When adding new features:

1. Add corresponding test coverage
2. Include `data-testid` attributes for testability
3. Update test scenarios if user flows change
4. Run full test suite before committing

---

For more detailed examples and advanced usage patterns, see `ui-testing-usage-examples.ts`.