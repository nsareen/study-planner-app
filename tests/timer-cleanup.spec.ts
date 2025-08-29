import { test, expect, Page } from '@playwright/test';

test.describe('Timer and Session Cleanup', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('https://examvault.co.in/');
    
    // Wait for app to load
    await page.waitForSelector('text=Study Hero', { timeout: 10000 });
  });

  test('Timer should stop when Fix Stuck Timers is clicked', async () => {
    // Navigate to Today page
    await page.click('text=Today');
    await page.waitForURL('**/today');
    
    // Check if timer is running (look for timer display)
    const timerElement = await page.locator('.text-blue-600').first();
    const initialTimerText = await timerElement.textContent();
    console.log('Initial timer text:', initialTimerText);
    
    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForURL('**/settings');
    
    // Click Fix Stuck Timers button
    const fixTimersButton = await page.locator('text=Fix Stuck Timers');
    if (await fixTimersButton.isVisible()) {
      await fixTimersButton.click();
      
      // Handle the confirmation dialog
      page.on('dialog', async dialog => {
        console.log('Dialog message:', dialog.message());
        await dialog.accept();
      });
      
      // Wait for alert to appear
      await page.waitForTimeout(1000);
    }
    
    // Navigate back to Today page
    await page.click('text=Today');
    await page.waitForURL('**/today');
    
    // Check if timer has stopped
    await page.waitForTimeout(2000);
    const timerAfterCleanup = await page.locator('.text-blue-600').first();
    const timerTextAfterCleanup = await timerAfterCleanup.textContent();
    console.log('Timer after cleanup:', timerTextAfterCleanup);
    
    // Timer should either be reset or stopped
    expect(timerTextAfterCleanup).not.toBe(initialTimerText);
  });

  test('Session Management buttons should work correctly', async () => {
    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForURL('**/settings');
    
    // Check for Session Management section
    const sessionSection = await page.locator('text=Session Management');
    if (await sessionSection.isVisible()) {
      console.log('Session Management section found');
      
      // Test Validate & Fix Sessions button
      const validateButton = await page.locator('button:has-text("Validate & Fix Sessions")');
      if (await validateButton.isVisible()) {
        await validateButton.click();
        await page.waitForTimeout(500);
        console.log('Clicked Validate & Fix Sessions');
      }
      
      // Test Reset All Timers button
      const resetButton = await page.locator('button:has-text("Reset All Timers")');
      if (await resetButton.isVisible()) {
        await resetButton.click();
        
        // Handle confirmation dialog
        page.on('dialog', async dialog => {
          console.log('Reset dialog:', dialog.message());
          await dialog.accept();
        });
        
        await page.waitForTimeout(500);
        console.log('Clicked Reset All Timers');
      }
      
      // Navigate back to Today page to verify timer is stopped
      await page.click('text=Today');
      await page.waitForURL('**/today');
      
      // Timer should show 00:00:00 or similar
      const timerElement = await page.locator('.text-blue-600').first();
      const timerText = await timerElement.textContent();
      console.log('Timer after reset:', timerText);
      
      // Check that timer is not incrementing
      await page.waitForTimeout(3000);
      const timerTextAfter3s = await timerElement.textContent();
      console.log('Timer after 3 seconds:', timerTextAfter3s);
      
      expect(timerText).toBe(timerTextAfter3s);
    } else {
      console.log('Session Management section not found - old version deployed');
    }
  });

  test('Verify localStorage state after cleanup', async () => {
    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForURL('**/settings');
    
    // Get localStorage before cleanup
    const storageBefore = await page.evaluate(() => {
      const storage = localStorage.getItem('study-planner-storage');
      return storage ? JSON.parse(storage) : null;
    });
    console.log('Active sessions before:', storageBefore?.state?.activitySessions?.filter((s: any) => s.isActive));
    console.log('Timer state before:', storageBefore?.state?.activeTimer);
    
    // Click Fix Stuck Timers
    const fixTimersButton = await page.locator('text=Fix Stuck Timers');
    if (await fixTimersButton.isVisible()) {
      await fixTimersButton.click();
      
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.waitForTimeout(1000);
    }
    
    // Get localStorage after cleanup
    const storageAfter = await page.evaluate(() => {
      const storage = localStorage.getItem('study-planner-storage');
      return storage ? JSON.parse(storage) : null;
    });
    console.log('Active sessions after:', storageAfter?.state?.activitySessions?.filter((s: any) => s.isActive));
    console.log('Timer state after:', storageAfter?.state?.activeTimer);
    
    // Verify no active sessions remain
    const activeSessions = storageAfter?.state?.activitySessions?.filter((s: any) => s.isActive) || [];
    expect(activeSessions.length).toBe(0);
    
    // Verify timer is cleared or stopped
    const timerState = storageAfter?.state?.activeTimer;
    expect(timerState?.isRunning).toBeFalsy();
  });

  test.afterEach(async () => {
    await page.close();
  });
});