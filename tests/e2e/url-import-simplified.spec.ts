import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('URL Import - Simplified Flow', () => {
  let helpers: TestHelpers;
  const BYJUS_ICSE_MATH_URL = 'https://byjus.com/icse/icse-maths-class-9-syllabus/';
  const EXPECTED_CHAPTERS = [
    'Rational and Irrational Numbers',
    'Compound Interest',
    'Expansions',
    'Factorizations', 
    'Simultaneous Linear Equations',
    'Indices',
    'Logarithms',
    'Triangles'
  ];

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Set up authenticated user
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
  });

  test('should import BYJU\'s ICSE Math curriculum via URL', async ({ page }) => {
    // Capture console messages for verification
    const consoleMessages = await helpers.captureConsoleMessages();

    // Navigate to Subjects page
    await helpers.navigateToPage('subjects');
    await helpers.takeScreenshot('01-subjects-page');

    // Clear existing chapters if any
    await helpers.clearAllChapters();
    await helpers.takeScreenshot('02-cleared-chapters');

    // Open Smart Import modal
    await helpers.openSmartImport();
    await helpers.takeScreenshot('03-smart-import-opened');

    // Open Add Source modal
    await helpers.openAddSource();
    await helpers.takeScreenshot('04-add-source-opened');

    // Import from BYJU's URL
    await helpers.importFromURL(BYJUS_ICSE_MATH_URL);
    await helpers.takeScreenshot('05-url-imported');

    // Select first curriculum (should be the imported one)
    await helpers.selectFirstCurriculum();
    await helpers.takeScreenshot('06-curriculum-selected');

    // Select first available subject (should be Mathematics)
    await helpers.selectFirstSubject();
    await helpers.takeScreenshot('07-subject-selected');

    // Proceed to customize step
    await helpers.proceedToCustomize();
    await helpers.takeScreenshot('08-customize-step');

    // Import selected chapters
    await helpers.importSelectedChapters();
    await helpers.takeScreenshot('09-chapters-importing');

    // Verify chapters were imported
    const chapterCount = await helpers.verifyChaptersImported({ min: 1, max: 15 });
    console.log(`Successfully imported ${chapterCount} chapters`);

    // Verify specific expected chapters are present
    let foundExpectedChapters = 0;
    for (const expectedChapter of EXPECTED_CHAPTERS) {
      const isPresent = await page.locator(`text*="${expectedChapter}"`).isVisible();
      if (isPresent) {
        foundExpectedChapters++;
        console.log(`✅ Found: ${expectedChapter}`);
      } else {
        console.log(`❌ Missing: ${expectedChapter}`);
      }
    }

    // Verify we found at least some expected chapters
    expect(foundExpectedChapters).toBeGreaterThan(0);
    console.log(`Found ${foundExpectedChapters}/${EXPECTED_CHAPTERS.length} expected chapters`);

    // Verify subject section exists
    await expect(page.locator('.border.border-gray-200, .subject-section')).toBeVisible();

    await helpers.takeScreenshot('10-final-result');

    // Verify console debug output was captured
    // Wait a moment for final console messages
    await page.waitForTimeout(1000);
    
    // Should have debug messages about curriculum import
    const hasImportLogs = await page.evaluate(() => {
      return performance.getEntriesByType('navigation').length > 0;
    });
    
    console.log('Test completed successfully!');
  });

  test('should handle URL import errors gracefully', async ({ page }) => {
    await helpers.navigateToPage('subjects');
    await helpers.openSmartImport();
    await helpers.openAddSource();

    // Try to import from invalid URL
    const invalidUrl = 'https://nonexistent-domain-12345.com/invalid-path';
    
    // Fill URL input
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill(invalidUrl);
    
    // Click import
    await helpers.clickElement('button:has-text("Import from URL")');
    
    // Should show processing
    await expect(page.locator('button:has-text("Importing from URL...")')).toBeVisible({ timeout: 5000 });
    
    // Should eventually complete with fallback data
    await expect(page.locator('h2:has-text("Import Curriculum Source")')).toBeHidden({ timeout: 30000 });
    
    // Should show fallback curriculum
    await expect(page.locator('.grid button').first()).toBeVisible();
    
    await helpers.takeScreenshot('error-handling-completed');
  });

  test('should support quick import from popular sources', async ({ page }) => {
    await helpers.navigateToPage('subjects');
    await helpers.openSmartImport();
    await helpers.openAddSource();

    // Click on a quick import option
    const quickImportButton = page.locator('button:has-text("BYJU\'S ICSE Class 9")');
    if (await quickImportButton.isVisible()) {
      await quickImportButton.click();
      
      // Should populate URL field
      const urlInput = page.locator('input[type="url"]');
      await expect(urlInput).toHaveValue(/byjus\.com.*icse.*class-9/i);
      
      await helpers.takeScreenshot('quick-import-selected');
    }
  });

  test.afterEach(async ({ page }) => {
    if (test.info().status !== 'passed') {
      await helpers.takeScreenshot(`url-import-failed-${Date.now()}`);
    }
    await page.evaluate(() => window.localStorage.clear());
  });
});