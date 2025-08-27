import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataGenerator } from '../utils/test-data';

test.describe('User Onboarding Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should complete full onboarding flow for new user', async ({ page }) => {
    // Step 1: User arrives at the user selection screen
    await expect(page.locator('[data-testid="user-selection-form"]')).toBeVisible();
    await helpers.expectTextToBeVisible('Select or create a user');

    // Step 2: Create a new user
    const testUser = TestDataGenerator.createTestUser({
      name: 'Test Student',
      hasCompletedOnboarding: false
    });

    // Check if user creation form is available
    const createUserButton = page.locator('[data-testid="create-user"]');
    if (await createUserButton.isVisible()) {
      await createUserButton.click();
      await helpers.fillField('[data-testid="user-name"]', testUser.name);
      await helpers.fillField('[data-testid="user-email"]', testUser.email);
      await helpers.clickElement('[data-testid="save-user"]');
    } else {
      // Select existing user for testing
      await helpers.clickElement('[data-testid="user-card"]:first-child');
    }

    // Step 3: Tutorial should appear for new users
    await expect(page.locator('[data-testid="tutorial"]')).toBeVisible();
    await helpers.expectTextToBeVisible('Welcome to Study Planner');

    // Step 4: Go through tutorial steps
    await helpers.clickElement('[data-testid="tutorial-next"]');
    await helpers.expectTextToBeVisible('Let\'s start planning');
    
    await helpers.clickElement('[data-testid="tutorial-next"]');
    await helpers.expectTextToBeVisible('Track your progress');
    
    // Step 5: Complete tutorial
    await helpers.clickElement('[data-testid="tutorial-complete"]');
    await helpers.waitForElementToBeHidden('[data-testid="tutorial"]');

    // Step 6: Should be redirected to the main application
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();

    // Step 7: Verify user is on the today plan page
    await helpers.waitForURL(/.*\/$/); // Root URL
    await helpers.expectTextToBeVisible('Today\'s Plan');

    // Take screenshot for visual verification
    await helpers.takeScreenshot('onboarding-complete');
  });

  test('should skip tutorial for existing users', async ({ page }) => {
    // Mock an existing user with completed onboarding
    await page.addInitScript(() => {
      window.localStorage.setItem('studyPlanner', JSON.stringify({
        users: [{
          id: 'existing-user',
          name: 'Existing User',
          email: 'existing@example.com',
          hasCompletedOnboarding: true
        }],
        currentUserId: 'existing-user'
      }));
    });

    await page.reload();

    // Should go directly to main application
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="tutorial"]')).not.toBeVisible();
  });

  test('should handle tutorial dismissal', async ({ page }) => {
    // Start onboarding flow
    await helpers.clickElement('[data-testid="user-card"]:first-child');
    
    // Wait for tutorial to appear
    await expect(page.locator('[data-testid="tutorial"]')).toBeVisible();
    
    // Close tutorial using close button
    await helpers.clickElement('[data-testid="tutorial-close"]');
    
    // Tutorial should be hidden
    await helpers.waitForElementToBeHidden('[data-testid="tutorial"]');
    
    // Should still be in main application
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
  });

  test('should maintain user selection across page reloads', async ({ page }) => {
    // Select a user
    await helpers.clickElement('[data-testid="user-card"]:first-child');
    
    // Wait for main app to load
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Should still be in main app (not user selection)
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-selection-form"]')).not.toBeVisible();
  });

  test('should handle accessibility during onboarding', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="user-card"]:first-child')).toBeFocused();
    
    // Use Enter key to select user
    await page.keyboard.press('Enter');
    
    // Tutorial should be accessible
    await expect(page.locator('[data-testid="tutorial"]')).toBeVisible();
    
    // Test keyboard navigation in tutorial
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="tutorial-next"]')).toBeFocused();
    
    // Use Enter to navigate tutorial
    await page.keyboard.press('Enter');
    
    // Check accessibility compliance
    await helpers.checkAccessibility();
  });

  test.afterEach(async ({ page }) => {
    // Clean up: Clear local storage for next test
    await page.evaluate(() => window.localStorage.clear());
  });
});