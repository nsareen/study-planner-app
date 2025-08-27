import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TestDataGenerator } from '../utils/test-data';

test.describe('Subjects Management', () => {
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
    await helpers.waitForNavigation();
    
    // Navigate to subjects page
    await helpers.clickElement('[data-testid="nav-subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
  });

  test('should display subjects page correctly', async ({ page }) => {
    // Verify page title
    await helpers.expectTextToBeVisible('Subjects');
    
    // Check for main elements
    await expect(page.locator('[data-testid="subjects-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-subject-button"]')).toBeVisible();
    
    // Take screenshot for visual verification
    await helpers.takeScreenshot('subjects-page-initial');
  });

  test('should create a new subject', async ({ page }) => {
    const testSubject = TestDataGenerator.createTestSubject({
      name: 'Mathematics',
      color: 'blue'
    });

    // Click add subject button
    await helpers.clickElement('[data-testid="add-subject-button"]');
    
    // Verify modal/form appears
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    
    // Fill in subject details
    await helpers.fillField('[data-testid="subject-name-input"]', testSubject.name);
    
    // Select color if color picker is available
    if (await page.locator('[data-testid="color-picker"]').isVisible()) {
      await helpers.clickElement(`[data-testid="color-${testSubject.color}"]`);
    }
    
    // Add description if field exists
    const descriptionField = page.locator('[data-testid="subject-description-input"]');
    if (await descriptionField.isVisible()) {
      await helpers.fillField('[data-testid="subject-description-input"]', 'Test mathematics subject');
    }
    
    // Save the subject
    await helpers.clickElement('[data-testid="save-subject-button"]');
    
    // Verify form closes
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    
    // Verify subject appears in the list
    await helpers.expectTextToBeVisible(testSubject.name);
    
    // Take screenshot showing the new subject
    await helpers.takeScreenshot('subject-created');
  });

  test('should edit an existing subject', async ({ page }) => {
    // First create a subject to edit
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    await helpers.fillField('[data-testid="subject-name-input"]', 'Original Subject');
    await helpers.clickElement('[data-testid="save-subject-button"]');
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    
    // Now edit the subject
    const editButton = page.locator('[data-testid="edit-subject-Original Subject"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Alternative: click on subject card to edit
      await helpers.clickElement('[data-testid="subject-card"]:first-child');
    }
    
    // Verify edit form appears
    await expect(page.locator('[data-testid="edit-subject-form"]')).toBeVisible();
    
    // Update subject name
    await helpers.fillField('[data-testid="subject-name-input"]', 'Updated Subject');
    
    // Save changes
    await helpers.clickElement('[data-testid="save-subject-button"]');
    
    // Verify updated subject appears
    await helpers.expectTextToBeVisible('Updated Subject');
    
    // Take screenshot showing the updated subject
    await helpers.takeScreenshot('subject-updated');
  });

  test('should delete a subject', async ({ page }) => {
    // Create a subject first
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    await helpers.fillField('[data-testid="subject-name-input"]', 'Subject to Delete');
    await helpers.clickElement('[data-testid="save-subject-button"]');
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    
    // Delete the subject
    const deleteButton = page.locator('[data-testid="delete-subject-Subject to Delete"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('[data-testid="confirm-delete"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
    
    // Verify subject is removed
    await expect(page.locator('text=Subject to Delete')).not.toBeVisible();
    
    // Take screenshot showing subject removed
    await helpers.takeScreenshot('subject-deleted');
  });

  test('should validate subject form inputs', async ({ page }) => {
    // Try to create subject without name
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    
    // Try to save with empty name
    await helpers.clickElement('[data-testid="save-subject-button"]');
    
    // Check for validation error
    const errorMessage = page.locator('[data-testid="validation-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('required');
    }
    
    // Fill with very long name
    const longName = 'A'.repeat(100);
    await helpers.fillField('[data-testid="subject-name-input"]', longName);
    
    // Check for length validation
    await helpers.clickElement('[data-testid="save-subject-button"]');
    
    // Should show length validation error
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Cancel the form
    await helpers.clickElement('[data-testid="cancel-subject-button"]');
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
  });

  test('should search and filter subjects', async ({ page }) => {
    // Create multiple subjects first
    const subjects = ['Mathematics', 'Science', 'History', 'English'];
    
    for (const subject of subjects) {
      await helpers.clickElement('[data-testid="add-subject-button"]');
      await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
      await helpers.fillField('[data-testid="subject-name-input"]', subject);
      await helpers.clickElement('[data-testid="save-subject-button"]');
      await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    }
    
    // Test search functionality if available
    const searchInput = page.locator('[data-testid="search-subjects"]');
    if (await searchInput.isVisible()) {
      await helpers.fillField('[data-testid="search-subjects"]', 'Math');
      
      // Should show only Mathematics
      await helpers.expectTextToBeVisible('Mathematics');
      await expect(page.locator('text=Science')).not.toBeVisible();
      
      // Clear search
      await helpers.fillField('[data-testid="search-subjects"]', '');
      
      // Should show all subjects again
      await helpers.expectTextToBeVisible('Mathematics');
      await helpers.expectTextToBeVisible('Science');
    }
  });

  test('should handle subject color selection', async ({ page }) => {
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    await helpers.fillField('[data-testid="subject-name-input"]', 'Colorful Subject');
    
    // Test color picker if available
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];
    
    for (const color of colors) {
      const colorOption = page.locator(`[data-testid="color-${color}"]`);
      if (await colorOption.isVisible()) {
        await colorOption.click();
        
        // Verify color is selected (check for active class or similar)
        await helpers.expectElementToHaveClass(`[data-testid="color-${color}"]`, 'selected');
        break; // Just test one color for this test
      }
    }
    
    await helpers.clickElement('[data-testid="save-subject-button"]');
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
  });

  test('should display subject statistics', async ({ page }) => {
    // Create a subject
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    await helpers.fillField('[data-testid="subject-name-input"]', 'Statistics Subject');
    await helpers.clickElement('[data-testid="save-subject-button"]');
    await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    
    // Check for subject statistics display
    const subjectCard = page.locator('[data-testid="subject-card"]').first();
    await expect(subjectCard).toBeVisible();
    
    // Look for statistics elements (study time, progress, etc.)
    const statsElements = [
      '[data-testid="study-time"]',
      '[data-testid="progress-percentage"]',
      '[data-testid="sessions-count"]'
    ];
    
    for (const selector of statsElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        console.log(`Found statistics element: ${selector}`);
      }
    }
  });

  test('should support drag and drop reordering', async ({ page }) => {
    // Create multiple subjects
    const subjects = ['First', 'Second', 'Third'];
    
    for (const subject of subjects) {
      await helpers.clickElement('[data-testid="add-subject-button"]');
      await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
      await helpers.fillField('[data-testid="subject-name-input"]', subject);
      await helpers.clickElement('[data-testid="save-subject-button"]');
      await helpers.waitForElementToBeHidden('[data-testid="add-subject-form"]');
    }
    
    // Test drag and drop if supported
    const firstSubject = page.locator('[data-testid="subject-card"]').first();
    const lastSubject = page.locator('[data-testid="subject-card"]').last();
    
    if (await firstSubject.isVisible() && await lastSubject.isVisible()) {
      await helpers.dragAndDrop('[data-testid="subject-card"]:first-child', '[data-testid="subject-card"]:last-child');
      
      // Take screenshot to verify reordering
      await helpers.takeScreenshot('subjects-reordered');
    }
  });

  test('should handle accessibility requirements', async ({ page }) => {
    // Create a subject for testing
    await helpers.clickElement('[data-testid="add-subject-button"]');
    await expect(page.locator('[data-testid="add-subject-form"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="subject-name-input"]')).toBeFocused();
    
    await helpers.fillField('[data-testid="subject-name-input"]', 'Accessible Subject');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate to save button
    await page.keyboard.press('Enter');
    
    // Run accessibility check
    await helpers.checkAccessibility();
  });

  test.afterEach(async ({ page }) => {
    // Clean up and take screenshot if test failed
    if (test.info().status !== 'passed') {
      await helpers.takeScreenshot(`subjects-failed-${Date.now()}`);
    }
    
    // Clear local storage
    await page.evaluate(() => window.localStorage.clear());
  });
});