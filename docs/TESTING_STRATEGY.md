# Study Planner - Comprehensive Testing Strategy

**Version:** 1.0
**Date:** 2025-11-24
**Owner:** Testing Champion
**Status:** Active

---

## Executive Summary

This document defines the comprehensive testing strategy for the Study Planner application, ensuring high quality, reliability, and maintainability across all development phases. The strategy covers unit testing, integration testing, end-to-end testing, visual regression, performance, and accessibility testing.

### Current State
- **E2E Coverage:** 70% (Excellent Playwright infrastructure)
- **Unit Coverage:** 2% (Only 1 component tested)
- **Store Coverage:** 0% (Critical gap)
- **Utility Coverage:** 0% (Algorithms untested)
- **Overall Test Confidence:** 35%

### Target State (6 Weeks)
- **Unit Coverage:** 60%+ with enforced thresholds
- **Store Coverage:** 95%+ (all actions and selectors)
- **Utility Coverage:** 80%+ (critical algorithms fully tested)
- **Integration Coverage:** 50%+ (store + component interactions)
- **E2E Coverage:** 80%+ (all major user flows)
- **Overall Test Confidence:** 85%+

---

## 1. Testing Pyramid

We follow the **Testing Pyramid** approach for optimal ROI and fast feedback:

```
                    /\
                   /  \
                  / E2E \          10-15% of tests (slow, brittle, high value)
                 /--------\
                /          \
               / Integration \     20-25% of tests (medium speed, good value)
              /--------------\
             /                \
            /   Unit Tests     \   60-70% of tests (fast, stable, high ROI)
           /--------------------\
```

### Why This Distribution?

1. **Unit Tests (60-70%):**
   - Fast execution (<1ms per test)
   - Easy to maintain and debug
   - Catch bugs early in development
   - Enable confident refactoring
   - **Target:** 1000+ unit tests

2. **Integration Tests (20-25%):**
   - Test component + store interactions
   - Verify data flow through the app
   - Catch integration bugs
   - **Target:** 200+ integration tests

3. **E2E Tests (10-15%):**
   - Test complete user workflows
   - Validate critical business flows
   - Catch UI/UX regressions
   - **Target:** 30+ E2E test suites

---

## 2. Test Types & Strategies

### 2.1 Unit Tests (Vitest + React Testing Library)

**Scope:** Individual components, utilities, and functions in isolation

**Tools:**
- Vitest (test runner)
- React Testing Library (component testing)
- @testing-library/user-event (user interactions)
- @testing-library/jest-dom (DOM assertions)

**What to Test:**

#### React Components
- Rendering with different props
- User interactions (clicks, typing, form submissions)
- Conditional rendering logic
- Error states and edge cases
- Accessibility (ARIA attributes, keyboard navigation)

**Example:**
```typescript
// tests/unit/components/ChapterCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterCard } from '@/components/ChapterCard';

describe('ChapterCard', () => {
  it('renders chapter information correctly', () => {
    const chapter = {
      id: '1',
      name: 'Algebra',
      studyHours: 5,
      completedStudyHours: 2
    };

    render(<ChapterCard chapter={chapter} />);

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('2 / 5 hours')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    const chapter = { id: '1', name: 'Algebra' };
    const user = userEvent.setup();

    render(<ChapterCard chapter={chapter} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith(chapter.id);
  });
});
```

#### Zustand Store
- Actions (mutations)
- Selectors (getters)
- State persistence (localStorage)
- Multi-user isolation
- Data integrity

**Example:**
```typescript
// tests/unit/store/useStore.test.ts
import { useStore } from '@/store/useStore';
import { renderHook, act } from '@testing-library/react';

describe('useStore - Chapter Actions', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.getState().reset(); // Reset to initial state
  });

  it('adds chapter to current user', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.switchUser('user-1');
      result.current.addChapter({
        name: 'Algebra',
        subject: 'Math',
        studyHours: 5
      });
    });

    const chapters = result.current.userData['user-1'].chapters;
    expect(chapters).toHaveLength(1);
    expect(chapters[0].name).toBe('Algebra');
  });

  it('maintains multi-user isolation', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.switchUser('user-1');
      result.current.addChapter({ name: 'Math Chapter' });

      result.current.switchUser('user-2');
      result.current.addChapter({ name: 'Science Chapter' });
    });

    expect(result.current.userData['user-1'].chapters).toHaveLength(1);
    expect(result.current.userData['user-2'].chapters).toHaveLength(1);
    expect(result.current.userData['user-1'].chapters[0].name).toBe('Math Chapter');
  });
});
```

#### Utility Functions
- Algorithm correctness (prioritization, calculations)
- Edge cases and boundary conditions
- Error handling
- Performance characteristics

**Example:**
```typescript
// tests/unit/utils/prioritization.test.ts
import { calculateChapterPriority } from '@/utils/prioritization';

describe('calculateChapterPriority', () => {
  it('calculates high priority for upcoming final exam', () => {
    const chapter = {
      studyHours: 10,
      completedStudyHours: 0,
      revisionHours: 5
    };

    const exams = [{
      subject: 'Math',
      date: '2025-11-30', // 6 days from today
      type: 'final'
    }];

    const result = calculateChapterPriority(
      chapter,
      exams,
      [],
      '2025-11-24'
    );

    expect(result.priority).toBeGreaterThan(10); // High priority
    expect(result.urgency).toBeGreaterThan(0.8);
    expect(result.scarcity).toBeGreaterThan(0.7);
  });

  it('handles edge case: exam in the past', () => {
    const chapter = { studyHours: 10, completedStudyHours: 0 };
    const exams = [{ date: '2025-11-01', type: 'final' }];

    const result = calculateChapterPriority(
      chapter,
      exams,
      [],
      '2025-11-24'
    );

    expect(result.priority).toBe(0); // No priority for past exam
  });
});
```

**Coverage Goals:**
- Components: 60% minimum
- Store: 95% minimum (critical path)
- Utilities: 80% minimum

---

### 2.2 Integration Tests

**Scope:** Component + Store interactions, multi-component workflows

**Strategy:**
- Test realistic user workflows
- Verify data flows from store → component → store
- Test error propagation
- Validate side effects

**Example:**
```typescript
// tests/integration/TodayPlan.integration.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodayPlan } from '@/pages/TodayPlan';
import { useStore } from '@/store/useStore';
import { BrowserRouter } from 'react-router-dom';

describe('TodayPlan Integration', () => {
  beforeEach(() => {
    useStore.getState().reset();

    // Setup test user with assignments
    useStore.getState().switchUser('test-user');
    useStore.getState().addChapter({
      id: 'ch-1',
      name: 'Algebra',
      studyHours: 5
    });

    useStore.getState().scheduleChapter(
      'ch-1',
      '2025-11-24',
      'study',
      60,
      'plan-1'
    );
  });

  it('starts timer and updates store correctly', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <TodayPlan />
      </BrowserRouter>
    );

    // Find and click start button
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // Verify timer started in store
    const state = useStore.getState();
    const sessions = state.activitySessions;

    expect(sessions).toHaveLength(1);
    expect(sessions[0].isActive).toBe(true);

    // Verify UI updated
    expect(screen.getByText(/00:00/)).toBeInTheDocument(); // Timer display
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
});
```

**Coverage Goals:**
- Critical workflows: 80%
- Page components: 50%

---

### 2.3 End-to-End Tests (Playwright)

**Scope:** Complete user workflows in real browser environment

**Current Status:** EXCELLENT (10 test files, comprehensive coverage)

**Strategy:**
- Keep existing E2E tests
- Add tests for new features (Phase 4/5 backend)
- Focus on critical business flows
- Use Page Object Model for maintainability

**Priority E2E Flows:**
1. ✅ User onboarding (DONE)
2. ✅ Navigation (DONE)
3. ✅ Subject management (DONE)
4. ✅ Timer pause/resume (DONE)
5. ✅ URL import (DONE)
6. ⏳ Backend sync (NEW - Phase 5)
7. ⏳ Study plan creation and execution (PARTIAL)
8. ⏳ Progress tracking and analytics (TODO)
9. ⏳ Settings and data export (TODO)

**New E2E Tests Needed:**

```typescript
// tests/e2e/backend-sync.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Backend Sync', () => {
  test('syncs data to backend when cloud sync enabled', async ({ page }) => {
    await page.goto('/settings');

    // Enable cloud sync
    await page.click('[data-testid="cloud-sync-toggle"]');
    await expect(page.locator('.sync-status')).toHaveText('Synced');

    // Create chapter
    await page.goto('/subjects');
    await page.click('[data-testid="add-chapter"]');
    await page.fill('[name="chapterName"]', 'Test Chapter');
    await page.click('[data-testid="save-chapter"]');

    // Verify backend received data (check network request)
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/chapters') && resp.status() === 201
    );

    const body = await response.json();
    expect(body.name).toBe('Test Chapter');
  });

  test('handles backend errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/chapters', route => {
      route.abort('failed');
    });

    await page.goto('/subjects');
    await page.click('[data-testid="add-chapter"]');
    await page.fill('[name="chapterName"]', 'Test Chapter');
    await page.click('[data-testid="save-chapter"]');

    // Verify fallback to local storage
    await expect(page.locator('.sync-warning')).toBeVisible();
    await expect(page.locator('.sync-warning')).toContainText('offline');

    // Verify chapter still saved locally
    await expect(page.locator('text=Test Chapter')).toBeVisible();
  });
});
```

**Coverage Goals:**
- Critical flows: 100%
- Major features: 80%
- Edge cases: 50%

---

### 2.4 Visual Regression Tests

**Scope:** Detect unintended UI changes

**Status:** INFRASTRUCTURE EXISTS, NO BASELINES

**Strategy:**
- Use Playwright's screenshot comparison
- Create baseline screenshots for key pages
- Run on every PR
- Review diffs in CI

**Implementation:**
```typescript
// tests/visual/pages.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Dashboard page matches baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]');

    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      threshold: 0.2, // 20% tolerance
    });
  });

  test('TodayPlan page matches baseline', async ({ page }) => {
    await page.goto('/today');
    await page.waitForSelector('[data-testid="today-content"]');

    await expect(page).toHaveScreenshot('today-plan.png');
  });

  test('SmartPlanner page matches baseline', async ({ page }) => {
    await page.goto('/smart-planner');
    await page.waitForSelector('[data-testid="planner-content"]');

    await expect(page).toHaveScreenshot('smart-planner.png');
  });
});
```

**Baseline Creation:**
```bash
# Generate baseline screenshots
npm run test:e2e -- tests/visual --update-snapshots

# Review baselines in tests/visual/*.png
# Commit baselines to git

# Future test runs will compare against baselines
npm run test:e2e -- tests/visual
```

**Coverage Goals:**
- All major pages: 100%
- Critical components: 80%

---

### 2.5 Performance Tests

**Scope:** Ensure app meets performance standards

**Current Status:** Lighthouse configured in CI, no assertions

**Strategy:**
- Use Lighthouse CI for web vitals
- Add performance budgets
- Test critical interactions

**Lighthouse Performance Budgets:**
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/today',
        'http://localhost:5173/smart-planner'
      ],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

**Runtime Performance Tests:**
```typescript
// tests/performance/render-time.spec.ts
import { test, expect } from '@playwright/test';

test('TodayPlan renders within 500ms', async ({ page }) => {
  await page.goto('/today');

  const startTime = Date.now();
  await page.waitForSelector('[data-testid="today-content"]');
  const renderTime = Date.now() - startTime;

  expect(renderTime).toBeLessThan(500);
});

test('Adding 100 chapters performs adequately', async ({ page }) => {
  await page.goto('/subjects');

  const startTime = Date.now();

  // Bulk add 100 chapters via store
  await page.evaluate(() => {
    const store = window.__STORE__; // Expose store for testing
    for (let i = 0; i < 100; i++) {
      store.addChapter({ name: `Chapter ${i}`, studyHours: 5 });
    }
  });

  await page.waitForSelector('[data-testid="chapter-list"]');
  const totalTime = Date.now() - startTime;

  expect(totalTime).toBeLessThan(2000); // 2 seconds max
});
```

**Coverage Goals:**
- All pages: <2s load time
- Critical interactions: <500ms response

---

### 2.6 Accessibility Tests

**Scope:** Ensure WCAG 2.1 AA compliance

**Current Status:** TestHelpers.checkAccessibility() exists, not used

**Strategy:**
- Use @axe-core/playwright for automated checks
- Manual keyboard navigation testing
- Screen reader compatibility

**Implementation:**
```typescript
// tests/accessibility/pages.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Dashboard has no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Keyboard navigation works on TodayPlan', async ({ page }) => {
    await page.goto('/today');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute(
      'data-testid',
      'start-button'
    );

    // Activate with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="timer"]')).toBeVisible();
  });
});
```

**Coverage Goals:**
- All pages: Zero critical violations
- Major workflows: Full keyboard support

---

## 3. Test Organization

### Directory Structure

```
tests/
├── unit/                           # Unit tests
│   ├── components/                 # Component tests
│   │   ├── UserSelection.test.tsx
│   │   ├── ChapterCard.test.tsx
│   │   ├── QuickScheduler.test.tsx
│   │   └── ...
│   ├── store/                      # Store tests
│   │   ├── useStore.test.ts
│   │   ├── actions/
│   │   │   ├── chapters.test.ts
│   │   │   ├── assignments.test.ts
│   │   │   └── sessions.test.ts
│   │   └── selectors/
│   │       └── getters.test.ts
│   └── utils/                      # Utility tests
│       ├── prioritization.test.ts
│       ├── progressCalculations.test.ts
│       └── syllabusParser.test.ts
├── integration/                    # Integration tests
│   ├── TodayPlan.integration.test.tsx
│   ├── SmartPlanner.integration.test.tsx
│   └── BackendSync.integration.test.tsx
├── e2e/                           # End-to-end tests
│   ├── user-onboarding.spec.ts
│   ├── backend-sync.spec.ts
│   └── ...
├── visual/                        # Visual regression tests
│   ├── pages.spec.ts
│   └── components.spec.ts
├── performance/                   # Performance tests
│   ├── render-time.spec.ts
│   └── lighthouse.spec.ts
├── accessibility/                 # Accessibility tests
│   └── pages.spec.ts
├── utils/                         # Test utilities
│   ├── test-data.ts
│   ├── test-helpers.ts
│   └── mocks/
│       ├── store.mock.ts
│       ├── api.mock.ts
│       └── router.mock.ts
├── setup.ts                       # Vitest setup
└── global-setup.ts                # Playwright global setup
```

---

## 4. Coverage Requirements

### Enforced Thresholds (vitest.config.ts)

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'tests/**',
    '**/*.config.{js,ts}',
    'dist/**',
    'coverage/**',
    'node_modules/**',
  ],
  thresholds: {
    global: {
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60,
    },
    './src/store/': {
      lines: 95,
      functions: 95,
      branches: 90,
      statements: 95,
    },
    './src/utils/prioritization.ts': {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
  },
}
```

### Coverage Reporting

- **Local Development:** `npm run test:coverage` generates HTML report
- **CI/CD:** Coverage uploaded to Codecov on every PR
- **PR Checks:** Fail if coverage drops below thresholds

---

## 5. Testing Workflow

### During Development

1. **Write test first (TDD encouraged):**
   ```bash
   npm run test:watch
   # Write failing test
   # Implement feature until test passes
   ```

2. **Run unit tests frequently:**
   ```bash
   npm run test:unit
   ```

3. **Check coverage before committing:**
   ```bash
   npm run test:coverage
   # Review coverage/index.html
   ```

### Before PR

1. **Run full unit test suite:**
   ```bash
   npm run test:unit
   ```

2. **Run E2E tests for affected features:**
   ```bash
   npm run test:e2e -- tests/e2e/your-feature.spec.ts
   ```

3. **Check visual regressions:**
   ```bash
   npm run test:e2e -- tests/visual
   ```

### CI/CD Pipeline

```
PR Created
    │
    ├─> Unit Tests (required)
    │   ├─ All tests must pass
    │   └─ Coverage must meet thresholds
    │
    ├─> E2E Tests (required)
    │   ├─ Chrome (required)
    │   ├─ Firefox (optional)
    │   └─ Safari (optional)
    │
    ├─> Visual Regression (required)
    │   └─ No unexpected UI changes
    │
    ├─> Performance Tests (warning only)
    │   └─ Lighthouse budgets
    │
    └─> Accessibility Tests (required)
        └─ No critical violations

All Green → PR Approved for Merge
```

---

## 6. Test Data Management

### Fixtures

Use `tests/utils/test-data.ts` for consistent test data:

```typescript
import { TestDataGenerator } from '@/tests/utils/test-data';

const testChapter = TestDataGenerator.createTestChapter({
  name: 'Algebra',
  studyHours: 5,
});

const testUser = TestDataGenerator.createTestUser({
  name: 'Test Student',
  email: 'test@example.com',
});
```

### Factories

Create factories for complex objects:

```typescript
// tests/utils/factories/chapter.factory.ts
export const ChapterFactory = {
  build: (overrides = {}) => ({
    id: `ch-${Math.random()}`,
    name: 'Default Chapter',
    subject: 'Math',
    studyHours: 5,
    completedStudyHours: 0,
    revisionHours: 2,
    completedRevisionHours: 0,
    status: 'not_started',
    ...overrides,
  }),

  buildMany: (count, overrides = {}) => {
    return Array.from({ length: count }, (_, i) =>
      ChapterFactory.build({ name: `Chapter ${i + 1}`, ...overrides })
    );
  },
};
```

### Database Seeding (E2E)

For E2E tests, seed localStorage with realistic data:

```typescript
// tests/e2e/helpers/seed-data.ts
export async function seedUserData(page, userId) {
  await page.evaluate(({ userId }) => {
    const store = {
      currentUserId: userId,
      userData: {
        [userId]: {
          chapters: [
            { id: 'ch-1', name: 'Algebra', studyHours: 5 },
            { id: 'ch-2', name: 'Geometry', studyHours: 4 },
          ],
          assignments: [
            {
              id: 'a-1',
              chapterId: 'ch-1',
              date: '2025-11-24',
              plannedMinutes: 60
            },
          ],
        },
      },
    };

    localStorage.setItem('study-planner-storage', JSON.stringify(store));
  }, { userId });
}
```

---

## 7. Mocking Strategy

### API Mocking (Future - Phase 4/5)

Use MSW (Mock Service Worker) for API mocking:

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/chapters', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Algebra', studyHours: 5 },
        { id: '2', name: 'Geometry', studyHours: 4 },
      ])
    );
  }),

  rest.post('/api/chapters', async (req, res, ctx) => {
    const newChapter = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ ...newChapter, id: 'generated-id' })
    );
  }),
];
```

```typescript
// tests/setup.ts (add to existing setup)
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Store Mocking

Mock Zustand store for component tests:

```typescript
// tests/mocks/store.mock.ts
import { vi } from 'vitest';

export const mockStore = {
  currentUserId: 'test-user',
  userData: {
    'test-user': {
      chapters: [],
      assignments: [],
    },
  },
  addChapter: vi.fn(),
  updateChapter: vi.fn(),
  deleteChapter: vi.fn(),
  scheduleChapter: vi.fn(),
};

vi.mock('@/store/useStore', () => ({
  useStore: (selector) => selector ? selector(mockStore) : mockStore,
}));
```

---

## 8. Phase 4/5 Backend Testing Requirements

### Backend API Testing

**New test files needed:**

1. **API Client Tests:**
```typescript
// tests/unit/services/apiClient.test.ts
import { apiClient } from '@/services/apiClient';

describe('apiClient', () => {
  it('makes authenticated requests with token', async () => {
    const response = await apiClient.get('/chapters');

    expect(response.headers.authorization).toMatch(/^Bearer /);
  });

  it('retries on network failure', async () => {
    // Mock 3 failures, then success
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => ({}) });

    await apiClient.get('/chapters');

    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
```

2. **Backend Store Wrapper Tests:**
```typescript
// tests/unit/store/backendStore.test.ts
import { backendStore } from '@/store/backendStore';

describe('backendStore', () => {
  it('optimistically updates local state before backend', async () => {
    const chapter = { name: 'Algebra', studyHours: 5 };

    const promise = backendStore.addChapter(chapter);

    // Check local state updated immediately
    expect(backendStore.getChapters()).toContainEqual(
      expect.objectContaining({ name: 'Algebra' })
    );

    await promise;

    // Verify backend call succeeded
    expect(backendStore.isSynced).toBe(true);
  });

  it('rolls back on backend failure', async () => {
    // Mock backend failure
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Server error'));

    const chapter = { name: 'Algebra' };

    await expect(backendStore.addChapter(chapter)).rejects.toThrow();

    // Verify rollback
    expect(backendStore.getChapters()).not.toContainEqual(
      expect.objectContaining({ name: 'Algebra' })
    );
  });
});
```

3. **Sync Hook Tests:**
```typescript
// tests/unit/hooks/useBackendSync.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useBackendSync } from '@/hooks/useBackendSync';

describe('useBackendSync', () => {
  it('syncs data when online', async () => {
    const { result } = renderHook(() => useBackendSync());

    await waitFor(() => {
      expect(result.current.isSynced).toBe(true);
    });
  });

  it('queues changes when offline', async () => {
    // Simulate offline
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    const { result } = renderHook(() => useBackendSync());

    await result.current.syncChapter({ name: 'Algebra' });

    expect(result.current.syncQueue).toHaveLength(1);
    expect(result.current.isSynced).toBe(false);
  });
});
```

### E2E Backend Tests

```typescript
// tests/e2e/backend-integration.spec.ts
test('syncs chapter creation to backend', async ({ page }) => {
  await page.goto('/settings');
  await page.click('[data-testid="enable-cloud-sync"]');

  await page.goto('/subjects');
  await page.click('[data-testid="add-chapter"]');
  await page.fill('[name="name"]', 'New Chapter');
  await page.click('[data-testid="save"]');

  // Wait for sync indicator
  await page.waitForSelector('[data-testid="sync-success"]');

  // Verify backend received data
  const response = await page.request.get('http://localhost:3001/api/chapters');
  const chapters = await response.json();

  expect(chapters).toContainEqual(
    expect.objectContaining({ name: 'New Chapter' })
  );
});
```

---

## 9. Continuous Improvement

### Test Metrics to Track

1. **Coverage Trends:**
   - Overall coverage percentage
   - Per-module coverage
   - Coverage delta per PR

2. **Test Execution:**
   - Total test count
   - Average test duration
   - Flaky test count

3. **Quality Indicators:**
   - Bugs found by tests (vs. production)
   - Test-to-code ratio
   - Mutation test score (future)

### Monthly Reviews

- Review test coverage reports
- Identify untested code paths
- Update test strategy based on bug patterns
- Refactor slow/flaky tests

---

## 10. Success Criteria

### Week 1 ✅
- [ ] Testing strategy document complete
- [ ] Coverage thresholds enforced in CI
- [ ] Store unit tests implemented (95% coverage)
- [ ] Critical utility tests (prioritization, parsers)

### Week 2 ✅
- [ ] Testing guidelines published
- [ ] Test templates created
- [ ] Top 5 component tests implemented
- [ ] Integration test framework established

### Week 3 ✅
- [ ] Visual regression baselines created
- [ ] Performance budgets enforced
- [ ] Accessibility tests running
- [ ] Backend API tests complete

### Week 4 ✅
- [ ] Overall coverage >60%
- [ ] Zero flaky tests
- [ ] Documentation complete
- [ ] Team trained on testing practices

---

## Appendix A: Quick Reference

### Common Test Commands

```bash
# Unit tests
npm run test                    # Watch mode
npm run test:unit              # Run once
npm run test:coverage          # With coverage

# E2E tests
npm run test:e2e               # All E2E tests
npm run test:e2e:ui            # Playwright UI mode
npm run test:debug             # Debug mode

# Specific test files
npm run test -- ChapterCard.test.tsx
npm run test:e2e -- backend-sync.spec.ts

# Update snapshots
npm run test:e2e -- --update-snapshots

# Coverage report
npm run test:coverage
# Then open: coverage/index.html
```

### Test File Templates

See `docs/TESTING_GUIDELINES.md` for templates:
- Component test template
- Store test template
- Utility test template
- E2E test template
- Integration test template

---

**Document Version:** 1.0
**Last Updated:** 2025-11-24
**Next Review:** 2025-12-24
**Owner:** Testing Champion
