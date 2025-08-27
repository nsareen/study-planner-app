import { Page, Locator, expect } from '@playwright/test';

/**
 * Enhanced Playwright test utilities for the Study Planner application
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Waits for an element to be visible with enhanced error messaging
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    return element;
  }

  /**
   * Waits for an element to be hidden
   */
  async waitForElementToBeHidden(selector: string, timeout = 5000): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toBeHidden({ timeout });
  }

  /**
   * Fills a form field with proper waiting and validation
   */
  async fillField(selector: string, value: string): Promise<void> {
    const field = await this.waitForElement(selector);
    await field.clear();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Clicks an element with proper waiting
   */
  async clickElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  /**
   * Selects an option from a dropdown
   */
  async selectOption(selectSelector: string, value: string): Promise<void> {
    const select = await this.waitForElement(selectSelector);
    await select.selectOption(value);
  }

  /**
   * Checks if text is visible on the page
   */
  async expectTextToBeVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Waits for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Takes a screenshot with a custom name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Scrolls to an element
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Waits for a specific URL pattern
   */
  async waitForURL(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Checks if an element has a specific class
   */
  async expectElementToHaveClass(selector: string, className: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await expect(element).toHaveClass(new RegExp(className));
  }

  /**
   * Waits for an API call to complete
   */
  async waitForAPICall(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern);
  }

  /**
   * Simulates keyboard shortcuts
   */
  async pressKeyboardShortcut(shortcut: string): Promise<void> {
    await this.page.keyboard.press(shortcut);
  }

  /**
   * Hovers over an element
   */
  async hoverElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.hover();
  }

  /**
   * Drag and drop functionality
   */
  async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    const source = await this.waitForElement(sourceSelector);
    const target = await this.waitForElement(targetSelector);
    await source.dragTo(target);
  }

  /**
   * Handles file uploads
   */
  async uploadFile(inputSelector: string, filePath: string): Promise<void> {
    const input = await this.waitForElement(inputSelector);
    await input.setInputFiles(filePath);
  }

  /**
   * Checks for console errors
   */
  async expectNoConsoleErrors(): Promise<void> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors to appear
    await this.page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      throw new Error(`Console errors found: ${errors.join(', ')}`);
    }
  }

  /**
   * Study Planner specific helpers
   */
  async selectUser(userName: string): Promise<void> {
    await this.clickElement(`[data-testid="user-${userName}"]`);
  }

  async navigateToPage(pageName: string): Promise<void> {
    // Use actual NavLink paths instead of test IDs
    const pathMap: Record<string, string> = {
      'subjects': '/subjects',
      'calendar': '/calendar',
      'progress': '/progress',
      'settings': '/settings',
      'today': '/',
      'collaboration': '/collaboration'
    };
    
    const path = pathMap[pageName.toLowerCase()] || `/${pageName}`;
    await this.clickElement(`a[href="${path}"]`);
    await this.waitForNavigation();
  }

  async addSubject(subjectName: string, color?: string): Promise<void> {
    await this.clickElement('[data-testid="add-subject"]');
    await this.fillField('[data-testid="subject-name"]', subjectName);
    
    if (color) {
      await this.clickElement(`[data-testid="color-${color}"]`);
    }
    
    await this.clickElement('[data-testid="save-subject"]');
  }

  async createStudyPlan(title: string, date: string): Promise<void> {
    await this.clickElement('[data-testid="create-plan"]');
    await this.fillField('[data-testid="plan-title"]', title);
    await this.fillField('[data-testid="plan-date"]', date);
    await this.clickElement('[data-testid="save-plan"]');
  }

  /**
   * Accessibility testing helpers
   */
  async checkAccessibility(): Promise<void> {
    // Check for basic accessibility issues
    const buttons = await this.page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      if (!ariaLabel && !text?.trim()) {
        throw new Error('Button without accessible name found');
      }
    }

    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt === null) {
        throw new Error('Image without alt attribute found');
      }
    }
  }

  /**
   * Performance testing helpers
   */
  async measureLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  /**
   * Visual regression testing
   */
  async compareScreenshot(name: string, options?: { threshold?: number; maxDiffPixels?: number }): Promise<void> {
    await expect(this.page).toHaveScreenshot(`${name}.png`, options);
  }

  /**
   * URL Import specific helpers
   */
  async openSmartImport(): Promise<void> {
    const smartImportButton = this.page.locator('button:has-text("Smart Import"), button:has(svg) >> text="Smart Import"');
    await expect(smartImportButton).toBeVisible({ timeout: 10000 });
    await smartImportButton.click();
    await expect(this.page.locator('.fixed.inset-0.bg-black, [role="dialog"]').first()).toBeVisible({ timeout: 10000 });
  }

  async openAddSource(): Promise<void> {
    const addSourceButton = this.page.locator('button:has-text("Add Source")');
    await expect(addSourceButton).toBeVisible({ timeout: 10000 });
    await addSourceButton.click();
    await expect(this.page.locator('h2:has-text("Import Curriculum Source")').or(this.page.locator('text="Import from Website"'))).toBeVisible({ timeout: 10000 });
  }

  async importFromURL(url: string): Promise<void> {
    const urlInput = this.page.locator('input[type="url"], input[placeholder*="byjus"], input[placeholder*="https://"]');
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.clear();
    await urlInput.fill(url);
    await expect(urlInput).toHaveValue(url);

    const importUrlButton = this.page.locator('button:has-text("Import from URL")');
    await expect(importUrlButton).toBeVisible();
    await expect(importUrlButton).toBeEnabled();
    await importUrlButton.click();

    // Wait for processing to start
    await expect(this.page.locator('button:has-text("Importing from URL...")')).toBeVisible({ timeout: 5000 });
    
    // Wait for source manager modal to close (processing completes)
    await expect(this.page.locator('h2:has-text("Import Curriculum Source")')).toBeHidden({ timeout: 30000 });
  }

  async selectFirstCurriculum(): Promise<void> {
    await expect(this.page.locator('.grid').locator('button').first()).toBeVisible({ timeout: 10000 });
    await this.page.locator('.grid button, [role="button"]').first().click();
    await expect(this.page.locator('text="Select the subjects you want to import"')).toBeVisible({ timeout: 10000 });
  }

  async selectFirstSubject(): Promise<void> {
    const firstSubject = this.page.locator('.grid div[class*="border"], .subjects div[class*="border"]').first();
    await expect(firstSubject).toBeVisible();
    await firstSubject.click();
  }

  async proceedToCustomize(): Promise<void> {
    const continueButton = this.page.locator(
      'button:has-text("Continue"), button:has-text("Next"), button:has-text("Customize")'
    );
    await expect(continueButton).toBeVisible({ timeout: 10000 });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await expect(this.page.locator('text="Customize Your Import", text="Customize chapters"')).toBeVisible({ timeout: 10000 });
  }

  async importSelectedChapters(): Promise<void> {
    const importButton = this.page.locator(
      'button:has-text("Import Subjects"), button:has-text("Import Selected"), button:has-text("Import")'
    ).filter({ hasNotText: 'Import from' });
    
    await expect(importButton).toBeVisible({ timeout: 10000 });
    await importButton.click();
    
    // Wait for import progress
    await expect(this.page.locator('text="Importing", text="progress", .animate-pulse')).toBeVisible({ timeout: 5000 });
    
    // Wait for import to complete (modal should close)
    await expect(this.page.locator('h2:has-text("Smart Curriculum Import")')).toBeHidden({ timeout: 30000 });
  }

  async clearAllChapters(): Promise<void> {
    try {
      const clearButton = this.page.locator('button:has-text("Clear All (Test)")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Handle confirmation dialog
        this.page.once('dialog', dialog => {
          dialog.accept();
        });
        
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('No clear button found or error clearing:', error);
    }
  }

  async verifyChaptersImported(expectedCount?: { min?: number; max?: number }): Promise<number> {
    await this.page.waitForTimeout(2000);
    const chapterElements = this.page.locator('.space-y-2 > div, .chapter-item, [class*="chapter"]');
    const chapterCount = await chapterElements.count();
    
    if (expectedCount?.min) {
      expect(chapterCount).toBeGreaterThanOrEqual(expectedCount.min);
    }
    if (expectedCount?.max) {
      expect(chapterCount).toBeLessThanOrEqual(expectedCount.max);
    }
    
    return chapterCount;
  }

  async captureConsoleMessages(): Promise<Array<{ type: string; text: string; timestamp: number }>> {
    const messages: Array<{ type: string; text: string; timestamp: number }> = [];
    
    this.page.on('console', msg => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });
    
    return messages;
  }
}