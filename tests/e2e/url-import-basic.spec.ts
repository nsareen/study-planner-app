import { test, expect, Page } from '@playwright/test';

test.describe('URL Import - Basic Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    
    await page.goto('http://localhost:5173');
  });

  test('should complete full URL import flow for BYJU\'s ICSE Math', async () => {
    // Step 1: Select a user (app requires user selection first)
    await expect(page.locator('h2:has-text("Choose Your Profile")')).toBeVisible({ timeout: 10000 });
    
    // Click on the first user (Ananya)
    await page.locator('button').filter({ hasText: 'Ananya' }).click();
    
    // Step 2: Navigate to Subjects page
    await expect(page.locator('a[href="/subjects"]')).toBeVisible({ timeout: 5000 });
    await page.locator('a[href="/subjects"]').click();
    
    // Step 3: Clear existing chapters if any
    const clearButton = page.locator('button:has-text("Clear All (Test)")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      // Handle confirmation dialog
      page.once('dialog', dialog => dialog.accept());
      await page.waitForTimeout(1000);
    }
    
    // Step 4: Open Smart Import
    await expect(page.locator('button:has-text("Smart Import")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Smart Import")').click();
    
    // Step 5: Wait for modal and click Add Source
    await expect(page.locator('h2:has-text("Smart Curriculum Import")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Add Source")').click();
    
    // Step 6: Import from URL
    const urlInput = page.locator('input[type="url"], input[placeholder*="https://"]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    await urlInput.fill('https://byjus.com/icse/icse-maths-class-9-syllabus/');
    
    await page.locator('button:has-text("Import from URL")').click();
    
    // Step 7: Wait for processing to complete (look for new curriculum card)
    await page.waitForTimeout(3000);
    
    // Step 8: Select the imported curriculum
    const curriculumCard = page.locator('.grid').locator('div').filter({ hasText: 'BYJU' }).first();
    await expect(curriculumCard).toBeVisible({ timeout: 10000 });
    await curriculumCard.click();
    
    // Step 9: Select Mathematics subject
    await expect(page.locator('h3:has-text("Select the subjects")')).toBeVisible({ timeout: 5000 });
    const mathSubject = page.locator('div').filter({ hasText: 'Mathematics' });
    await expect(mathSubject).toBeVisible({ timeout: 5000 });
    await mathSubject.click();
    
    // Step 10: Proceed to customize
    await page.locator('button:has-text("Next")').click();
    
    // Step 11: Import chapters
    await expect(page.locator('h3:has-text("Customize")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Import Selected Chapters")').click();
    
    // Step 12: Wait for import to complete
    await page.waitForTimeout(5000);
    
    // Step 13: Verify chapters were imported
    // Look for chapter elements in the subjects page
    const chapters = page.locator('div').filter({ hasText: /hours|Rational|Logarithms|Triangles/ });
    const chapterCount = await chapters.count();
    
    console.log(`Found ${chapterCount} chapters after import`);
    expect(chapterCount).toBeGreaterThan(0);
    
    // Verify specific ICSE Math chapters
    await expect(page.locator('text=Rational and Irrational Numbers')).toBeVisible();
    await expect(page.locator('text=Logarithms')).toBeVisible();
    await expect(page.locator('text=Mathematics')).toBeVisible();
    
    console.log('✅ URL import test completed successfully!');
  });

  test.afterEach(async () => {
    await page.close();
  });
});