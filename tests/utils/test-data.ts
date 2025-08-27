/**
 * Test data generators and fixtures for the Study Planner application
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export interface TestSubject {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TestStudyPlan {
  id: string;
  title: string;
  date: string;
  subjects: string[];
  duration: number;
}

export class TestDataGenerator {
  /**
   * Generate test users
   */
  static createTestUser(overrides?: Partial<TestUser>): TestUser {
    const defaults: TestUser = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test User',
      email: 'test@example.com',
      hasCompletedOnboarding: false,
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Generate test subjects
   */
  static createTestSubject(overrides?: Partial<TestSubject>): TestSubject {
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];
    const subjects = ['Mathematics', 'Science', 'History', 'English', 'Physics', 'Chemistry'];
    
    const defaults: TestSubject = {
      id: `subject-${Math.random().toString(36).substr(2, 9)}`,
      name: subjects[Math.floor(Math.random() * subjects.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Generate test study plans
   */
  static createTestStudyPlan(overrides?: Partial<TestStudyPlan>): TestStudyPlan {
    const defaults: TestStudyPlan = {
      id: `plan-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Study Session',
      date: new Date().toISOString().split('T')[0],
      subjects: ['subject-1', 'subject-2'],
      duration: 60,
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Generate multiple test items
   */
  static createMultipleUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, i) => 
      this.createTestUser({ 
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@example.com`
      })
    );
  }

  static createMultipleSubjects(count: number): TestSubject[] {
    return Array.from({ length: count }, (_, i) => 
      this.createTestSubject({ 
        name: `Subject ${i + 1}`
      })
    );
  }

  static createMultipleStudyPlans(count: number): TestStudyPlan[] {
    return Array.from({ length: count }, (_, i) => 
      this.createTestStudyPlan({ 
        title: `Study Plan ${i + 1}`
      })
    );
  }
}

/**
 * Common test scenarios and data
 */
export const TestScenarios = {
  // User onboarding flow
  newUser: {
    user: TestDataGenerator.createTestUser({ hasCompletedOnboarding: false }),
    firstSubjects: TestDataGenerator.createMultipleSubjects(3),
  },

  // Existing user with data
  existingUser: {
    user: TestDataGenerator.createTestUser({ hasCompletedOnboarding: true }),
    subjects: TestDataGenerator.createMultipleSubjects(5),
    studyPlans: TestDataGenerator.createMultipleStudyPlans(3),
  },

  // Form validation scenarios
  invalidInputs: {
    emptyStrings: ['', ' ', '  '],
    longStrings: ['a'.repeat(256), 'Very long subject name that exceeds reasonable limits'],
    specialCharacters: ['<script>', '&lt;test&gt;', 'test@#$%'],
  },

  // Date scenarios
  dates: {
    today: new Date().toISOString().split('T')[0],
    tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pastDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    futureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },

  // Common UI states
  loadingStates: {
    initial: 'initial',
    loading: 'loading',
    success: 'success',
    error: 'error',
  },
};

/**
 * Mock API responses
 */
export const MockResponses = {
  users: {
    success: { status: 200, data: TestDataGenerator.createMultipleUsers(3) },
    empty: { status: 200, data: [] },
    error: { status: 500, error: 'Internal Server Error' },
  },

  subjects: {
    success: { status: 200, data: TestDataGenerator.createMultipleSubjects(5) },
    empty: { status: 200, data: [] },
    error: { status: 500, error: 'Internal Server Error' },
  },

  studyPlans: {
    success: { status: 200, data: TestDataGenerator.createMultipleStudyPlans(3) },
    empty: { status: 200, data: [] },
    error: { status: 500, error: 'Internal Server Error' },
  },
};

/**
 * CSS selectors commonly used in tests
 */
export const Selectors = {
  // Navigation
  nav: {
    home: '[data-testid="nav-home"]',
    subjects: '[data-testid="nav-subjects"]',
    calendar: '[data-testid="nav-calendar"]',
    progress: '[data-testid="nav-progress"]',
    settings: '[data-testid="nav-settings"]',
  },

  // Forms
  forms: {
    userSelection: '[data-testid="user-selection-form"]',
    addSubject: '[data-testid="add-subject-form"]',
    createPlan: '[data-testid="create-plan-form"]',
  },

  // Buttons
  buttons: {
    primary: '[data-testid*="btn-primary"]',
    secondary: '[data-testid*="btn-secondary"]',
    save: '[data-testid*="save"]',
    cancel: '[data-testid*="cancel"]',
    delete: '[data-testid*="delete"]',
  },

  // Common UI elements
  ui: {
    modal: '[data-testid="modal"]',
    loading: '[data-testid="loading"]',
    error: '[data-testid="error"]',
    success: '[data-testid="success"]',
    tutorial: '[data-testid="tutorial"]',
  },
};