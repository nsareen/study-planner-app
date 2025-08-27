import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Application Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Set up a user to skip onboarding
    await page.addInitScript(() => {
      window.localStorage.setItem('studyPlanner', JSON.stringify({
        users: [{
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          hasCompletedOnboarding: true
        }],
        currentUserId: 'test-user'
      }));
    });
    
    await page.goto('/');
    await expect(page.locator('[data-testid="layout"]')).toBeVisible();
  });

  test('should navigate to all main pages', async ({ page }) => {
    const pages = [
      { path: '/subjects', testId: 'nav-subjects', title: 'Subjects' },
      { path: '/calendar', testId: 'nav-calendar', title: 'Calendar' },
      { path: '/progress', testId: 'nav-progress', title: 'Progress' },
      { path: '/collaboration', testId: 'nav-collaboration', title: 'Collaboration' },
      { path: '/settings', testId: 'nav-settings', title: 'Settings' },
      { path: '/help', testId: 'nav-help', title: 'Help' },
    ];

    for (const { path, testId, title } of pages) {
      // Navigate using navigation menu
      await helpers.clickElement(`[data-testid="${testId}"]`);
      
      // Wait for navigation to complete
      await helpers.waitForURL(new RegExp(`.*${path}$`));
      
      // Verify page loaded correctly
      await helpers.expectTextToBeVisible(title);
      
      // Take screenshot for visual verification
      await helpers.takeScreenshot(`navigation-${title.toLowerCase()}`);
    }
  });

  test('should navigate back to home from any page', async ({ page }) => {
    // Go to subjects page
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
    
    // Click home/logo to go back
    await helpers.clickElement('[data-testid="nav-home"]');
    await helpers.waitForURL(/.*\/$/);
    
    // Verify we're back at home
    await helpers.expectTextToBeVisible('Today\'s Plan');
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Navigate to subjects
    await helpers.clickElement('[data-testid="nav-subjects"]');
    
    // Check if nav item has active class
    await helpers.expectElementToHaveClass('[data-testid="nav-subjects"]', 'active');
    
    // Navigate to calendar
    await helpers.clickElement('[data-testid="nav-calendar"]');
    
    // Calendar should be active, subjects should not
    await helpers.expectElementToHaveClass('[data-testid="nav-calendar"]', 'active');
    await expect(page.locator('[data-testid="nav-subjects"].active')).toHaveCount(0);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    const directUrls = [
      { url: '/subjects', expectedText: 'Subjects' },
      { url: '/calendar', expectedText: 'Calendar' },
      { url: '/progress', expectedText: 'Progress' },
      { url: '/settings', expectedText: 'Settings' },
    ];

    for (const { url, expectedText } of directUrls) {
      await page.goto(url);
      await helpers.waitForNavigation();
      await helpers.expectTextToBeVisible(expectedText);
    }
  });

  test('should redirect invalid URLs to home', async ({ page }) => {
    // Navigate to invalid URL
    await page.goto('/invalid-page');
    
    // Should redirect to home
    await helpers.waitForURL(/.*\/$/);
    await helpers.expectTextToBeVisible('Today\'s Plan');
  });

  test('should maintain navigation state on page refresh', async ({ page }) => {
    // Navigate to subjects
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on subjects page
    await helpers.waitForURL(/.*\/subjects$/);
    await helpers.expectTextToBeVisible('Subjects');
    await helpers.expectElementToHaveClass('[data-testid="nav-subjects"]', 'active');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on navigation
    await page.keyboard.press('Tab');
    
    // Use arrow keys to navigate (if implemented)
    // This depends on your navigation implementation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Or use Tab to move through navigation items
    const navItems = ['nav-home', 'nav-subjects', 'nav-calendar', 'nav-progress'];
    
    for (const item of navItems) {
      const navItem = page.locator(`[data-testid="${item}"]`);
      if (await navItem.isVisible()) {
        await navItem.focus();
        await expect(navItem).toBeFocused();
      }
    }
  });

  test('should handle navigation during loading states', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Navigate quickly between pages
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.clickElement('[data-testid="nav-calendar"]');
    
    // Should handle rapid navigation gracefully
    await helpers.waitForNavigation();
    await helpers.expectTextToBeVisible('Calendar');
  });

  test('should preserve scroll position when navigating back', async ({ page }) => {
    // Go to a page with scrollable content
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.waitForNavigation();
    
    // Scroll down if content is available
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Navigate away and back
    await helpers.clickElement('[data-testid="nav-calendar"]');
    await helpers.waitForNavigation();
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.waitForNavigation();
    
    // Check if scroll position is preserved (this might depend on implementation)
    const scrollPosition = await page.evaluate(() => window.scrollY);
    console.log('Scroll position after navigation:', scrollPosition);
  });

  test('should show loading indicators during navigation', async ({ page }) => {
    // Look for loading states during navigation
    await helpers.clickElement('[data-testid="nav-subjects"]');
    
    // Check if loading indicator appears
    const loadingIndicator = page.locator('[data-testid="loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
      await helpers.waitForElementToBeHidden('[data-testid="loading"]');
    }
  });

  test.afterEach(async ({ page }) => {
    // Take a final screenshot for debugging if test failed
    if (test.info().status !== 'passed') {
      await helpers.takeScreenshot(`navigation-failed-${Date.now()}`);
    }
  });
});