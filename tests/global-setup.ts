import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Pre-warm the application and perform any global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the app to be ready
    console.log(`Warming up application at ${baseURL}`);
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');
    
    // You can add more global setup here, such as:
    // - Setting up test data
    // - Authentication
    // - Database seeding
    
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await page.close();
    await browser.close();
  }
}

export default globalSetup;