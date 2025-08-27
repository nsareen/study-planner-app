/**
 * Usage Examples for the UI Testing Subagent
 * 
 * This file demonstrates how to use the UI Testing Agent for various testing scenarios.
 */

import { createUITestingAgent, TestingScenarios, UITestingAgent } from './ui-testing-agent';
import { test, Page } from '@playwright/test';

// Example 1: Basic usage in a Playwright test
test('Example: Using UI Testing Agent in Playwright', async ({ page }) => {
  // Create and initialize the agent
  const agent = createUITestingAgent({
    scope: 'e2e',
    browsers: ['chromium'],
    coverage: true,
    parallel: false
  });
  
  agent.initialize(page);
  
  // Analyze the application
  const analysis = await agent.analyzeApplication('http://localhost:5173');
  console.log('Application analysis:', analysis);
  
  // Generate test scenarios based on analysis
  const scenarios = agent.generateTestScenarios(analysis);
  console.log(`Generated ${scenarios.length} test scenarios`);
  
  // Execute critical scenarios
  const criticalScenarios = scenarios.filter(s => s.priority === 'high');
  await agent.executeTestScenarios(criticalScenarios);
});

// Example 2: Smoke testing
test('Example: Quick smoke test', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  // Run predefined smoke test
  await TestingScenarios.smokeTest(agent, 'http://localhost:5173');
});

// Example 3: Full regression suite
test('Example: Complete regression testing', async ({ page }) => {
  const agent = createUITestingAgent({
    scope: 'e2e',
    browsers: ['chromium', 'firefox', 'webkit'],
    coverage: true,
    parallel: true
  });
  
  agent.initialize(page);
  
  // Run comprehensive regression test
  await TestingScenarios.regressionTest(agent, 'http://localhost:5173');
});

// Example 4: Performance testing
test('Example: Performance testing', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  await page.goto('http://localhost:5173');
  await agent.runPerformanceTests();
});

// Example 5: Accessibility testing
test('Example: Accessibility compliance', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  await page.goto('http://localhost:5173');
  await agent.runAccessibilityTests();
});

// Example 6: Visual regression testing
test('Example: Visual regression', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  const pagesToTest = [
    '/',
    '/subjects',
    '/calendar',
    '/progress',
    '/settings'
  ];
  
  await agent.runVisualTests(pagesToTest);
});

// Example 7: Generate test files
test('Example: Generate Playwright test files', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  const analysis = await agent.analyzeApplication('http://localhost:5173');
  const scenarios = agent.generateTestScenarios(analysis);
  
  // Generate test files for each scenario
  scenarios.forEach(scenario => {
    const testCode = agent.generatePlaywrightTest(scenario);
    console.log(`Generated test for: ${scenario.name}`);
    console.log(testCode);
  });
});

// Example 8: Custom test scenario
const customScenario = {
  name: 'Custom User Journey',
  description: 'Test complete user onboarding and first study session',
  steps: [
    { action: 'navigate', target: '/' },
    { action: 'click', target: '[data-testid="create-user"]' },
    { action: 'fill', target: '[data-testid="user-name"]', value: 'Test User' },
    { action: 'fill', target: '[data-testid="user-email"]', value: 'test@example.com' },
    { action: 'click', target: '[data-testid="save-user"]' },
    { action: 'click', target: '[data-testid="tutorial-complete"]' },
    { action: 'navigate', target: '/subjects' },
    { action: 'click', target: '[data-testid="add-subject"]' },
    { action: 'fill', target: '[data-testid="subject-name"]', value: 'Mathematics' },
    { action: 'click', target: '[data-testid="save-subject"]' }
  ],
  expectedOutcome: 'User completes onboarding and creates first subject',
  priority: 'high' as const,
  tags: ['onboarding', 'critical-path']
};

test('Example: Execute custom scenario', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  await agent.executeTestScenarios([customScenario]);
});

// Example 9: Debugging failed tests
test('Example: Debug test failures', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  try {
    await agent.executeTestScenarios([customScenario]);
  } catch (error) {
    // Agent automatically provides debugging assistance
    await agent.debugFailedScenario(customScenario, error as Error);
  }
});

// Example 10: Integration with CI/CD
export function generateCIConfiguration() {
  const agent = createUITestingAgent();
  const ciConfig = agent.generateCIConfig();
  
  console.log('GitHub Actions Configuration:');
  console.log(ciConfig);
  
  return ciConfig;
}

// Example 11: Testing different user roles
test('Example: Multi-user testing', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  const userTypes = [
    { name: 'Student', permissions: ['read', 'create'] },
    { name: 'Teacher', permissions: ['read', 'create', 'edit'] },
    { name: 'Admin', permissions: ['read', 'create', 'edit', 'delete'] }
  ];
  
  for (const userType of userTypes) {
    console.log(`Testing as ${userType.name}...`);
    
    // Set up user context (would typically involve authentication)
    await page.addInitScript((user) => {
      (window as any).__testUser = user;
    }, userType);
    
    await page.goto('http://localhost:5173');
    
    // Test based on user permissions
    if (userType.permissions.includes('create')) {
      await agent.executeTestScenarios([{
        name: `${userType.name} can create content`,
        description: `Verify ${userType.name} can create new content`,
        steps: [
          { action: 'click', target: '[data-testid="add-subject"]' },
          { action: 'fill', target: '[data-testid="subject-name"]', value: `${userType.name} Subject` },
          { action: 'click', target: '[data-testid="save-subject"]' }
        ],
        expectedOutcome: 'Content creation succeeds',
        priority: 'high' as const,
        tags: ['permissions', userType.name.toLowerCase()]
      }]);
    }
  }
});

// Example 12: Mobile testing
test('Example: Mobile responsive testing', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 390, height: 844, name: 'iPhone 12' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:5173');
    
    console.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    // Test responsive navigation
    const navElement = page.locator('[data-testid="navigation"]');
    if (await navElement.isVisible()) {
      // Test navigation works on this viewport
      await agent.executeTestScenarios([{
        name: `Navigation on ${viewport.name}`,
        description: `Test navigation functionality on ${viewport.name}`,
        steps: [
          { action: 'click', target: '[data-testid="nav-subjects"]' },
          { action: 'navigate', target: '/subjects' }
        ],
        expectedOutcome: 'Navigation works correctly',
        priority: 'medium' as const,
        tags: ['responsive', viewport.name.toLowerCase()]
      }]);
    }
  }
});

// Example 13: API integration testing
test('Example: Test with API mocking', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  // Mock API responses
  await page.route('**/api/subjects', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Mathematics', color: 'blue' },
        { id: '2', name: 'Science', color: 'green' }
      ])
    });
  });
  
  await page.route('**/api/subjects', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: '3', name: 'New Subject', color: 'red' })
      });
    }
  });
  
  await page.goto('http://localhost:5173');
  
  // Test with mocked data
  await agent.executeTestScenarios([{
    name: 'Test with mocked API',
    description: 'Test application behavior with controlled API responses',
    steps: [
      { action: 'navigate', target: '/subjects' },
      { action: 'click', target: '[data-testid="add-subject"]' },
      { action: 'fill', target: '[data-testid="subject-name"]', value: 'New Subject' },
      { action: 'click', target: '[data-testid="save-subject"]' }
    ],
    expectedOutcome: 'Subject is created and appears in list',
    priority: 'high' as const,
    tags: ['api', 'integration']
  }]);
});

// Example 14: Load testing simulation
test('Example: Load testing simulation', async ({ page }) => {
  const agent = createUITestingAgent();
  agent.initialize(page);
  
  await page.goto('http://localhost:5173');
  
  // Simulate multiple rapid interactions
  const rapidActions = Array.from({ length: 10 }, (_, i) => ({
    name: `Rapid Action ${i + 1}`,
    description: `Perform rapid user interaction ${i + 1}`,
    steps: [
      { action: 'click', target: '[data-testid="nav-subjects"]' },
      { action: 'click', target: '[data-testid="nav-calendar"]' },
      { action: 'click', target: '[data-testid="nav-progress"]' }
    ],
    expectedOutcome: 'Application handles rapid navigation gracefully',
    priority: 'medium' as const,
    tags: ['performance', 'load']
  }));
  
  // Execute all actions concurrently to simulate load
  await Promise.all(rapidActions.map(async (action) => {
    try {
      await agent.executeTestScenarios([action]);
    } catch (error) {
      console.warn(`Load test action failed: ${action.name}`, error);
    }
  }));
});

// Export utility functions
export {
  UITestingAgent,
  createUITestingAgent,
  TestingScenarios
};