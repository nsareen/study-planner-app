import { test, expect, Page } from '@playwright/test';

test.describe('URL Import - Working Test', () => {
  
  test('should successfully import BYJU\'s ICSE Math curriculum', async ({ page }) => {
    // Enable console logging to track the import process
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log('Browser:', text);
    });
    
    // Step 1: Navigate to app
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Step 2: Select user (Ananya) 
    await expect(page.locator('text=Study Hero')).toBeVisible({ timeout: 10000 });
    await page.locator('text=Ananya').click();
    await page.waitForTimeout(1000);
    
    // Step 3: Navigate to Subjects page (use first subjects link - navigation)
    const navSubjectsLink = page.locator('a[href="/subjects"]').first();
    await expect(navSubjectsLink).toBeVisible();
    await navSubjectsLink.click();
    await page.waitForTimeout(1000);
    
    // Step 4: Clear existing chapters if any
    try {
      const clearButton = page.locator('button:has-text("Clear All (Test)")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        // Handle confirmation dialog
        page.once('dialog', dialog => {
          dialog.accept();
        });
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('No existing chapters to clear');
    }
    
    // Step 5: Open Smart Import modal
    await expect(page.locator('button:has-text("Smart Import")')).toBeVisible();
    await page.locator('button:has-text("Smart Import")').click();
    
    // Step 6: Wait for modal and click Add Source
    await expect(page.locator('h2:has-text("Smart Curriculum Import")')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/1-smart-import-modal.png' });
    
    await page.locator('button:has-text("Add Source")').click();
    await page.waitForTimeout(500);
    
    // Step 7: Fill URL and import
    await page.screenshot({ path: 'test-results/2-add-source-modal.png' });
    
    const urlInput = page.locator('input[type="url"], input[placeholder*="https://"]').first();
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill('https://byjus.com/icse/icse-maths-class-9-syllabus/');
    
    await page.locator('button:has-text("Import from URL")').click();
    
    // Step 8: Wait for processing to complete 
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/3-after-url-import.png' });
    
    // Step 9: Select the imported BYJU's curriculum
    const curriculumCards = page.locator('.grid div, .curriculum-card').filter({ hasText: /BYJU|Mathematics|ICSE/ });
    await expect(curriculumCards.first()).toBeVisible({ timeout: 10000 });
    await curriculumCards.first().click();
    await page.waitForTimeout(1000);
    
    // Step 10: Select Mathematics subject
    await page.screenshot({ path: 'test-results/4-subject-selection.png' });
    
    // Look for Mathematics subject and select it
    const mathSubject = page.locator('div, input').filter({ hasText: 'Mathematics' }).first();
    await expect(mathSubject).toBeVisible({ timeout: 5000 });
    
    // If it's a checkbox, check it; if it's a clickable div, click it
    if (await page.locator('input[type="checkbox"]').filter({ hasText: 'Mathematics' }).count() > 0) {
      await page.locator('input[type="checkbox"]').filter({ hasText: 'Mathematics' }).check();
    } else {
      await mathSubject.click();
    }
    
    // Step 11: Proceed to customize
    const nextButton = page.locator('button').filter({ hasText: /Next|Continue|Customize/ });
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 12: Import selected chapters
    await page.screenshot({ path: 'test-results/5-customize-screen.png' });
    
    const importButton = page.locator('button').filter({ hasText: /Import.*Chapters|Import Selected|Import/ });
    await expect(importButton).toBeVisible();
    await importButton.click();
    
    // Step 13: Wait for import process to complete
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/6-after-import.png' });
    
    // Step 14: Verify chapters were imported
    // Look for chapter elements containing math topic names
    const mathChapters = [
      'Rational and Irrational Numbers',
      'Logarithms', 
      'Triangles',
      'Factorizations'
    ];
    
    let foundChapters = 0;
    for (const chapter of mathChapters) {
      if (await page.locator(`text=${chapter}`).isVisible()) {
        foundChapters++;
        console.log(`✅ Found chapter: ${chapter}`);
      }
    }
    
    // Verify we found at least some of the expected chapters
    expect(foundChapters).toBeGreaterThan(0);
    console.log(`Successfully imported ${foundChapters} out of ${mathChapters.length} expected chapters`);
    
    // Check console messages for import process logs
    const importLogs = consoleMessages.filter(msg => 
      msg.includes('Parsing educational site') ||
      msg.includes('Found known syllabus') ||
      msg.includes('Adding chapter') ||
      msg.includes('Starting chapter import')
    );
    
    console.log(`Found ${importLogs.length} import-related console messages`);
    expect(importLogs.length).toBeGreaterThan(0);
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/7-final-subjects-page.png' });
    
    console.log('✅ URL Import test completed successfully!');
  });
});