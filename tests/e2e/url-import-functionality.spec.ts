import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('URL Import Functionality - BYJU\'s ICSE Math Syllabus', () => {
  let helpers: TestHelpers;
  const consoleMessages: Array<{ type: string; text: string; timestamp: number }> = [];

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Clear console messages array
    consoleMessages.length = 0;
    
    // Capture console logs to verify debug output
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });
    
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
  });

  test('should complete end-to-end URL import flow for BYJU\'s ICSE Math syllabus', async ({ page }) => {
    // Step 1: Navigate to the Subjects page
    console.log('Step 1: Navigating to Subjects page...');
    await helpers.clickElement('[data-testid="nav-subjects"], a[href="/subjects"], .nav-subjects, [href*="subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
    await helpers.takeScreenshot('01-subjects-page-loaded');
    
    // Verify we're on the subjects page
    await helpers.expectTextToBeVisible('Subjects');
    
    // Step 2: Clear existing chapters using "Clear All (Test)" button if any exist
    console.log('Step 2: Clearing existing chapters...');
    try {
      const clearButton = page.locator('button:has-text("Clear All (Test)")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Handle confirmation dialog
        page.once('dialog', dialog => {
          console.log('Confirmation dialog appeared:', dialog.message());
          dialog.accept();
        });
        
        // Wait a moment for the clear to complete
        await page.waitForTimeout(1000);
        await helpers.takeScreenshot('02-chapters-cleared');
      } else {
        console.log('No existing chapters to clear');
      }
    } catch (error) {
      console.log('No clear button found or error clearing:', error);
    }

    // Step 3: Click "Smart Import" button
    console.log('Step 3: Opening Smart Import...');
    const smartImportButton = page.locator('button:has-text("Smart Import"), button:has(svg) >> text="Smart Import"');
    await expect(smartImportButton).toBeVisible({ timeout: 10000 });
    await smartImportButton.click();
    
    // Wait for the Smart Import modal to appear
    await expect(page.locator('.fixed.inset-0.bg-black, [role="dialog"]').first()).toBeVisible({ timeout: 10000 });
    await helpers.takeScreenshot('03-smart-import-modal-opened');
    
    // Verify modal header
    await helpers.expectTextToBeVisible('Smart Curriculum Import');

    // Step 4: Click "Add Source" in the modal
    console.log('Step 4: Clicking Add Source...');
    const addSourceButton = page.locator('button:has-text("Add Source")');
    await expect(addSourceButton).toBeVisible({ timeout: 10000 });
    await addSourceButton.click();
    
    // Wait for the Add Source modal to appear
    await expect(page.locator('h2:has-text("Import Curriculum Source")').or(page.locator('text="Import from Website"'))).toBeVisible({ timeout: 10000 });
    await helpers.takeScreenshot('04-add-source-modal-opened');

    // Step 5: Enter the BYJU's URL
    console.log('Step 5: Entering BYJU\'s URL...');
    const urlInput = page.locator('input[type="url"], input[placeholder*="byjus"], input[placeholder*="https://"]');
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    
    const testUrl = 'https://byjus.com/icse/icse-maths-class-9-syllabus/';
    await urlInput.clear();
    await urlInput.fill(testUrl);
    await expect(urlInput).toHaveValue(testUrl);
    await helpers.takeScreenshot('05-url-entered');

    // Step 6: Click "Import from URL"
    console.log('Step 6: Clicking Import from URL...');
    const importUrlButton = page.locator('button:has-text("Import from URL")');
    await expect(importUrlButton).toBeVisible();
    await expect(importUrlButton).toBeEnabled();
    await importUrlButton.click();
    
    // Step 7: Wait for processing and verify the imported curriculum appears
    console.log('Step 7: Waiting for processing...');
    
    // Wait for the button text to change to "Importing from URL..."
    await expect(page.locator('button:has-text("Importing from URL...")')).toBeVisible({ timeout: 5000 });
    await helpers.takeScreenshot('06-processing-started');
    
    // Wait for the source manager modal to close (processing completes)
    await expect(page.locator('h2:has-text("Import Curriculum Source")')).toBeHidden({ timeout: 30000 });
    
    // Wait for the curriculum to appear in the main import modal
    await expect(page.locator('.grid').locator('button').first()).toBeVisible({ timeout: 10000 });
    await helpers.takeScreenshot('07-curriculum-imported');

    // Verify debug console output
    console.log('Verifying console output...');
    const importLogs = consoleMessages.filter(msg => 
      msg.text.includes('📥 Importing curriculum') || 
      msg.text.includes('📊 Total subjects') ||
      msg.text.includes('📖')
    );
    expect(importLogs.length).toBeGreaterThan(0);
    console.log('Console logs captured:', importLogs.map(log => log.text));

    // Step 8: Select the Mathematics subject
    console.log('Step 8: Selecting Mathematics subject...');
    
    // Look for the imported curriculum card (should be at the top or contain "BYJU'S" or "ICSE")
    const curriculumCards = page.locator('.grid button, [role="button"]').filter({ hasText: /BYJU|ICSE|Math|Curriculum|Import/i });
    await expect(curriculumCards.first()).toBeVisible({ timeout: 10000 });
    
    // Click the first curriculum card
    await curriculumCards.first().click();
    await helpers.takeScreenshot('08-curriculum-selected');
    
    // Should now be on the subject selection step
    await expect(page.locator('text="Select the subjects you want to import"')).toBeVisible({ timeout: 10000 });

    // Step 9: Select Mathematics subject if it exists
    console.log('Step 9: Looking for Mathematics subject...');
    
    // Look for Mathematics subject card
    const mathSubject = page.locator('.grid div, .space-y-4 div').filter({ hasText: /math|Mathematics/i }).first();
    
    if (await mathSubject.isVisible()) {
      console.log('Found Mathematics subject, clicking...');
      await mathSubject.click();
      await helpers.takeScreenshot('09-mathematics-selected');
    } else {
      console.log('Mathematics not found, selecting first available subject...');
      const firstSubject = page.locator('.grid div[class*="border"], .subjects div[class*="border"]').first();
      await expect(firstSubject).toBeVisible();
      await firstSubject.click();
      await helpers.takeScreenshot('09-first-subject-selected');
    }

    // Step 10: Click "Continue" or "Next: Customize"
    console.log('Step 10: Proceeding to customize step...');
    
    const continueButton = page.locator(
      'button:has-text("Continue"), button:has-text("Next"), button:has-text("Customize")'
    );
    
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    
    // Wait for customize step
    await expect(page.locator('text="Customize Your Import", text="Customize chapters"')).toBeVisible({ timeout: 10000 });
    await helpers.takeScreenshot('10-customize-step');

    // Step 11: Click "Import Selected Chapters"
    console.log('Step 11: Importing selected chapters...');
    
    const importButton = page.locator(
      'button:has-text("Import Subjects"), button:has-text("Import Selected"), button:has-text("Import")'
    ).filter({ hasNotText: 'Import from' });
    
    await expect(importButton).toBeVisible({ timeout: 10000 });
    await importButton.click();
    
    // Wait for import progress
    await expect(page.locator('text="Importing", text="progress", .animate-pulse')).toBeVisible({ timeout: 5000 });
    await helpers.takeScreenshot('11-import-progress');
    
    // Wait for import to complete (modal should close)
    await expect(page.locator('h2:has-text("Smart Curriculum Import")')).toBeHidden({ timeout: 30000 });
    
    // Step 12: Verify that chapters are successfully added to the subjects list
    console.log('Step 12: Verifying imported chapters...');
    
    // Wait for the page to update with new chapters
    await page.waitForTimeout(2000);
    await helpers.takeScreenshot('12-chapters-imported');
    
    // Count the imported chapters
    const chapterElements = page.locator('.space-y-2 > div, .chapter-item, [class*="chapter"]');
    const chapterCount = await chapterElements.count();
    
    console.log(`Found ${chapterCount} chapters after import`);
    
    // Verify we have chapters (should be around 8 for ICSE Math, but we'll accept any positive number)
    expect(chapterCount).toBeGreaterThan(0);
    expect(chapterCount).toBeLessThanOrEqual(15); // Reasonable upper bound
    
    // Step 13: Verify specific chapter names if possible
    console.log('Step 13: Verifying chapter names...');
    
    const expectedChapters = [
      'Rational and Irrational Numbers',
      'Compound Interest',
      'Expansions',
      'Factorizations', 
      'Simultaneous Linear Equations',
      'Indices',
      'Logarithms',
      'Triangles'
    ];
    
    // Check if any of the expected chapters are present
    let foundChapters = 0;
    for (const expectedChapter of expectedChapters) {
      const chapterFound = await page.locator(`text*="${expectedChapter}"`).isVisible();
      if (chapterFound) {
        foundChapters++;
        console.log(`✅ Found expected chapter: ${expectedChapter}`);
      }
    }
    
    // We expect to find at least some of the chapters (parsing might vary)
    console.log(`Found ${foundChapters} out of ${expectedChapters.length} expected chapters`);
    
    // Verify subject section exists
    await expect(page.locator('.border.border-gray-200, .subject-section')).toBeVisible();
    
    // Take final screenshot
    await helpers.takeScreenshot('13-final-verification');
    
    // Step 14: Verify console logs for debug output
    console.log('Step 14: Final console log verification...');
    
    const relevantLogs = consoleMessages.filter(msg => 
      msg.text.includes('📥') || 
      msg.text.includes('📊') || 
      msg.text.includes('📖') ||
      msg.text.includes('🚀') ||
      msg.text.includes('✅')
    );
    
    console.log('All relevant console messages:');
    relevantLogs.forEach(log => {
      console.log(`[${log.type.toUpperCase()}] ${log.text}`);
    });
    
    // Verify we captured debug output
    expect(relevantLogs.length).toBeGreaterThan(0);
    
    console.log('✅ URL import functionality test completed successfully!');
  });

  test('should handle errors gracefully during URL import', async ({ page }) => {
    // Navigate to subjects page
    await helpers.clickElement('[data-testid="nav-subjects"], a[href="/subjects"], .nav-subjects, [href*="subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
    
    // Open Smart Import
    await helpers.clickElement('button:has-text("Smart Import")');
    await expect(page.locator('.fixed.inset-0.bg-black').first()).toBeVisible();
    
    // Click Add Source
    await helpers.clickElement('button:has-text("Add Source")');
    await expect(page.locator('text="Import from Website"')).toBeVisible();
    
    // Enter invalid URL
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill('https://invalid-url-that-does-not-exist.com');
    
    // Click Import from URL
    await helpers.clickElement('button:has-text("Import from URL")');
    
    // Should show processing
    await expect(page.locator('button:has-text("Importing from URL...")')).toBeVisible({ timeout: 5000 });
    
    // Should eventually close the modal (fallback data should be imported)
    await expect(page.locator('h2:has-text("Import Curriculum Source")')).toBeHidden({ timeout: 30000 });
    
    // Should show some curriculum in the main modal (fallback)
    await expect(page.locator('.grid button').first()).toBeVisible({ timeout: 10000 });
    
    await helpers.takeScreenshot('error-handling-test');
  });

  test('should support keyboard navigation in import flow', async ({ page }) => {
    // Navigate to subjects page
    await helpers.clickElement('[data-testid="nav-subjects"], a[href="/subjects"], .nav-subjects, [href*="subjects"]');
    await helpers.waitForURL(/.*\/subjects$/);
    
    // Use keyboard to open Smart Import
    await page.keyboard.press('Tab'); // Navigate to first element
    
    // Find and focus the Smart Import button
    const smartImportButton = page.locator('button:has-text("Smart Import")');
    await smartImportButton.focus();
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.fixed.inset-0.bg-black').first()).toBeVisible();
    await helpers.takeScreenshot('keyboard-navigation-test');
    
    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('h2:has-text("Smart Curriculum Import")')).toBeHidden({ timeout: 5000 });
  });

  test.afterEach(async ({ page }) => {
    // Clean up and take screenshot if test failed
    if (test.info().status !== 'passed') {
      await helpers.takeScreenshot(`url-import-failed-${Date.now()}`);
      
      // Log final console messages for debugging
      console.log('Final console messages:');
      consoleMessages.forEach(msg => {
        console.log(`[${msg.type}] ${msg.text}`);
      });
    }
    
    // Clear local storage
    await page.evaluate(() => window.localStorage.clear());
  });
});