import { test, expect, Page } from '@playwright/test';

test.describe('URL Import - Debug Test', () => {
  
  test('should debug what elements are actually visible', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    
    await page.goto('http://localhost:5173');
    
    // Wait a moment for the page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'debug-initial-load.png', fullPage: true });
    
    // Log the page title and URL
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Check if we're on user selection or main app
    const hasUserSelection = await page.locator('text=Study Hero').isVisible();
    console.log('Has Study Hero heading:', hasUserSelection);
    
    if (hasUserSelection) {
      console.log('=== USER SELECTION SCREEN ===');
      
      // Check for user buttons
      const userButtons = await page.locator('button').all();
      console.log(`Found ${userButtons.length} buttons`);
      
      // Check for specific text
      const ananyaButton = page.locator('text=Ananya');
      console.log('Ananya button visible:', await ananyaButton.isVisible());
      
      if (await ananyaButton.isVisible()) {
        console.log('Clicking Ananya user...');
        await ananyaButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'debug-after-user-select.png', fullPage: true });
      }
    }
    
    // Check if we're now on the main app
    const subjectsLink = page.locator('a[href="/subjects"]');
    console.log('Subjects link visible:', await subjectsLink.isVisible());
    
    if (await subjectsLink.isVisible()) {
      console.log('=== MAIN APP ===');
      await subjectsLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-subjects-page.png', fullPage: true });
      
      // Check for Smart Import button
      const smartImportBtn = page.locator('button:has-text("Smart Import")');
      console.log('Smart Import button visible:', await smartImportBtn.isVisible());
      
      if (await smartImportBtn.isVisible()) {
        console.log('Found Smart Import button - URL import should work!');
        
        // Try clicking it
        await smartImportBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'debug-smart-import-modal.png', fullPage: true });
        
        // Check for Add Source button
        const addSourceBtn = page.locator('button:has-text("Add Source")');
        console.log('Add Source button visible:', await addSourceBtn.isVisible());
      }
    }
    
    console.log('Debug test completed - check the screenshots!');
  });
});