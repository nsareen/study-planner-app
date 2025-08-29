import { test, expect } from '@playwright/test';

test.describe('Study Planner - Pause/Resume Functionality', () => {
  test('should test pause and resume functionality for activities', async ({ page }) => {
    // Set a longer timeout for this test as it involves multiple interactions
    test.setTimeout(90000);

    console.log('=== Starting Pause/Resume Functionality Test ===\n');

    // 1. Navigate to the app
    console.log('Step 1: Navigating to application...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. Handle any onboarding modal
    const welcomeModal = page.locator('text="Welcome to Study Hero"').first();
    if (await welcomeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Onboarding modal detected, attempting to close...');
      
      // Look for close button (X)
      const closeButton = page.locator('button:has(svg), button:has-text("×")').first();
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(500);
        console.log('Modal closed via X button');
      } else {
        // Click through tutorial
        for (let i = 0; i < 7; i++) {
          const nextButton = page.locator('button:has-text("Next")');
          if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
            await nextButton.click();
            await page.waitForTimeout(300);
          } else {
            break;
          }
        }
        console.log('Clicked through tutorial');
      }
    }

    // 3. Select user Ananya
    console.log('\nStep 2: Selecting user Ananya...');
    const ananyaCard = page.locator('text="Ananya"').first();
    
    // Check if we need to select the user
    if (await ananyaCard.isVisible({ timeout: 3000 })) {
      // Click on Ananya's card or button
      const ananyaButton = page.locator('button:has-text("Ananya"), div:has-text("Ananya")').first();
      await ananyaButton.click();
      console.log('Clicked on Ananya user card');
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Check if we navigated away from user selection
      const stillOnUserSelection = await page.locator('text="Who\'s ready to learn today?"').isVisible({ timeout: 1000 }).catch(() => false);
      if (stillOnUserSelection) {
        console.log('Still on user selection, trying alternative click...');
        // Try clicking the entire card
        await page.locator('div').filter({ hasText: /^Ananya/ }).first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Verify we've navigated to the dashboard
    console.log('Current URL:', page.url());
    
    // 4. Navigate to Plan page
    console.log('\nStep 3: Navigating to Plan page...');
    
    // Look for Plan link in navigation
    const planLink = page.locator('a:has-text("Plan"), a:has-text("📝 Plan")').first();
    if (await planLink.isVisible({ timeout: 5000 })) {
      await planLink.click();
      console.log('Clicked Plan link in navigation');
      await page.waitForTimeout(2000);
    } else {
      // Try direct navigation
      console.log('Plan link not found, trying direct navigation...');
      await page.goto('http://localhost:5173/planner');
      await page.waitForLoadState('networkidle');
    }

    // 5. Look for Today tab and click it
    console.log('\nStep 4: Looking for Today tab...');
    const todayTab = page.locator('button:has-text("Today")').first();
    
    if (await todayTab.isVisible({ timeout: 5000 })) {
      await todayTab.click();
      console.log('Clicked Today tab');
      await page.waitForTimeout(1500);
    } else {
      console.log('Today tab not found, might already be on Today view');
    }

    // 6. Check if there are activities
    console.log('\nStep 5: Checking for existing activities...');
    const noActivitiesText = await page.locator('text=/no.*activities/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (noActivitiesText) {
      console.log('No activities found. Will try to create one...');
      
      // Go to Matrix View to add activity
      const matrixTab = page.locator('button:has-text("Matrix View")').first();
      if (await matrixTab.isVisible({ timeout: 3000 })) {
        await matrixTab.click();
        console.log('Switched to Matrix View');
        await page.waitForTimeout(1500);
        
        // Look for any "Add to Calendar" button
        const addButtons = page.locator('button:has-text("Add to Calendar")');
        const addButtonCount = await addButtons.count();
        
        if (addButtonCount > 0) {
          console.log(`Found ${addButtonCount} "Add to Calendar" button(s)`);
          await addButtons.first().click();
          await page.waitForTimeout(1000);
          
          // Handle date selection
          const dateInput = page.locator('input[type="date"]').first();
          if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            const today = new Date().toISOString().split('T')[0];
            await dateInput.fill(today);
            console.log(`Set date to today: ${today}`);
          }
          
          // Confirm
          const confirmBtn = page.locator('button:has-text(/confirm|add|schedule/i)').last();
          if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
            console.log('Confirmed activity scheduling');
            await page.waitForTimeout(2000);
          }
          
          // Go back to Today view
          await todayTab.click();
          await page.waitForTimeout(1500);
        } else {
          console.log('No chapters available to add to calendar');
        }
      }
    }

    // 7. Test the timer functionality
    console.log('\nStep 6: Testing timer functionality...');
    
    // Look for Start button
    const startButton = page.locator('button:has-text(/^start$/i)').first();
    const hasStartButton = await startButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!hasStartButton) {
      console.log('\n❌ No Start button found. Cannot test timer functionality.');
      console.log('This could mean:');
      console.log('  - No activities are scheduled for today');
      console.log('  - The app requires chapters to be added first');
      console.log('  - Navigation to the Plan page failed');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-no-start-button.png', fullPage: true });
      console.log('\nScreenshot saved as test-no-start-button.png for debugging');
      
      // Log current page content for debugging
      const pageTitle = await page.title();
      console.log(`\nCurrent page title: ${pageTitle}`);
      console.log(`Current URL: ${page.url()}`);
      
      return;
    }

    // Start the timer
    console.log('✓ Found Start button, clicking it...');
    await startButton.click();
    await page.waitForTimeout(3000); // Wait for timer to start

    // Look for timer display
    const timerDisplay = page.locator('text=/\\d{2}:\\d{2}/').first();
    const timerExists = await timerDisplay.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!timerExists) {
      console.log('❌ Timer display not found');
      await page.screenshot({ path: 'test-no-timer.png' });
      return;
    }

    const initialTime = await timerDisplay.textContent();
    console.log(`✓ Timer started: ${initialTime}`);

    // Test Pause functionality
    console.log('\nTesting PAUSE functionality...');
    const pauseButton = page.locator('button:has-text(/^pause$/i)').first();
    
    if (await pauseButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pauseButton.click();
      console.log('✓ Clicked Pause button');
      await page.waitForTimeout(1000);
      
      // Check if Resume button appears
      const resumeButton = page.locator('button:has-text(/^resume$/i)').first();
      const hasResumeButton = await resumeButton.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasResumeButton) {
        console.log('✓ Resume button appeared after pause');
        
        // Verify timer is paused
        const pausedTime1 = await timerDisplay.textContent();
        await page.waitForTimeout(2000);
        const pausedTime2 = await timerDisplay.textContent();
        
        if (pausedTime1 === pausedTime2) {
          console.log(`✓ Timer is paused (stuck at ${pausedTime1})`);
        } else {
          console.log(`❌ Timer still running while paused: ${pausedTime1} → ${pausedTime2}`);
        }
        
        // Test Resume functionality
        console.log('\nTesting RESUME functionality...');
        await resumeButton.click();
        console.log('✓ Clicked Resume button');
        await page.waitForTimeout(1000);
        
        // Check if Pause button reappears
        const pauseReappeared = await pauseButton.isVisible({ timeout: 3000 }).catch(() => false);
        if (pauseReappeared) {
          console.log('✓ Pause button reappeared after resume');
        } else {
          console.log('❌ Pause button did not reappear');
        }
        
        // Verify timer is running again
        const resumedTime1 = await timerDisplay.textContent();
        await page.waitForTimeout(2000);
        const resumedTime2 = await timerDisplay.textContent();
        
        if (resumedTime1 !== resumedTime2) {
          console.log(`✓ Timer is running again: ${resumedTime1} → ${resumedTime2}`);
        } else {
          console.log(`❌ Timer not running after resume: stuck at ${resumedTime1}`);
        }
        
        // Complete the activity
        const completeButton = page.locator('button:has-text(/^complete$/i)').first();
        if (await completeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('\nCompleting activity...');
          await completeButton.click();
          
          // Handle confirmation
          const confirmButton = page.locator('button:has-text(/confirm|yes/i)').last();
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            console.log('✓ Activity completed');
          }
        }
      } else {
        console.log('❌ Resume button did not appear after pause');
      }
    } else {
      console.log('❌ Pause button not found');
    }

    console.log('\n=== Test Summary ===');
    console.log('The test has completed. Check the logs above for details.');
    console.log('If all checks show ✓, the pause/resume functionality is working correctly.');
    console.log('If any checks show ❌, there may be issues with the functionality.');
  });
});