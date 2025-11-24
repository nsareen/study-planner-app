# Study Planner - Testing Guidelines

**Version:** 1.0
**Date:** 2025-11-24
**Audience:** Developers, Contributors, Testing Champion
**Prerequisites:** Read TESTING_STRATEGY.md first

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Writing Unit Tests](#writing-unit-tests)
3. [Writing Integration Tests](#writing-integration-tests)
4. [Writing E2E Tests](#writing-e2e-tests)
5. [Test Templates](#test-templates)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Running Tests

```bash
# Unit tests (watch mode - use during development)
npm run test

# Unit tests (run once - use before commit)
npm run test:unit

# Unit tests with coverage
npm run test:coverage

# E2E tests (all)
npm run test:e2e

# E2E tests (specific file)
npm run test:e2e -- tests/e2e/backend-sync.spec.ts

# E2E tests (UI mode - great for debugging)
npm run test:e2e:ui

# E2E tests (debug mode - step through tests)
npm run test:debug
```

### Test Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write test first (TDD):**
   ```bash
   npm run test -- YourComponent.test.tsx
   # Write failing test
   # Implement component until test passes
   ```

3. **Check coverage:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

4. **Run E2E tests for your feature:**
   ```bash
   npm run test:e2e -- tests/e2e/your-feature.spec.ts
   ```

5. **Commit with test:**
   ```bash
   git add .
   git commit -m "feat: add YourComponent with tests"
   ```

---

## Writing Unit Tests

### Component Test Template

```typescript
// tests/unit/components/YourComponent.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { YourComponent } from '@/components/YourComponent';

// Mock dependencies
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn(),
}));

describe('YourComponent', () => {
  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    expect(screen.getByTestId('your-component')).toBeInTheDocument();
  });

  it('displays correct text', () => {
    render(
      <BrowserRouter>
        <YourComponent title="Test Title" />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  // Interaction tests
  it('handles button click correctly', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <YourComponent onClick={handleClick} />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // State tests
  it('updates state when input changes', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  // Conditional rendering tests
  it('shows loading state when data is loading', () => {
    render(
      <BrowserRouter>
        <YourComponent isLoading={true} />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    render(
      <BrowserRouter>
        <YourComponent error="Something went wrong" />
      </BrowserRouter>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  // Accessibility tests
  it('is keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <YourComponent />
      </BrowserRouter>
    );

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await user.keyboard('{Enter}');
    // Verify action occurred
  });
});
```

### Store Test Template

```typescript
// tests/unit/store/useStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '@/store/useStore';

describe('useStore - Chapter Actions', () => {
  beforeEach(() => {
    // Reset store to initial state
    localStorage.clear();
    act(() => {
      useStore.setState(useStore.getInitialState());
    });
  });

  describe('addChapter', () => {
    it('adds chapter to current user', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.switchUser('user-1');
        result.current.addChapter({
          name: 'Algebra',
          subject: 'Math',
          studyHours: 5,
        });
      });

      const chapters = result.current.userData['user-1'].chapters;
      expect(chapters).toHaveLength(1);
      expect(chapters[0]).toMatchObject({
        name: 'Algebra',
        subject: 'Math',
        studyHours: 5,
      });
    });

    it('generates unique ID for new chapter', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.switchUser('user-1');
        result.current.addChapter({ name: 'Chapter 1' });
        result.current.addChapter({ name: 'Chapter 2' });
      });

      const chapters = result.current.userData['user-1'].chapters;
      expect(chapters[0].id).not.toBe(chapters[1].id);
    });

    it('validates chapter data with Zod schema', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.switchUser('user-1');
      });

      expect(() => {
        act(() => {
          result.current.addChapter({
            name: '', // Invalid: empty name
            studyHours: -5, // Invalid: negative hours
          });
        });
      }).toThrow();
    });

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.switchUser('user-1');
        result.current.addChapter({ name: 'Algebra' });
      });

      const stored = JSON.parse(
        localStorage.getItem('study-planner-storage') || '{}'
      );

      expect(stored.state.userData['user-1'].chapters).toHaveLength(1);
    });
  });

  describe('multi-user isolation', () => {
    it('keeps chapters separate between users', () => {
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
});
```

### Utility Function Test Template

```typescript
// tests/unit/utils/prioritization.test.ts
import { describe, it, expect } from 'vitest';
import { calculateChapterPriority } from '@/utils/prioritization';
import { Chapter, SubjectExam } from '@/types';

describe('calculateChapterPriority', () => {
  const baseChapter: Chapter = {
    id: 'ch-1',
    name: 'Algebra',
    subject: 'Math',
    studyHours: 10,
    completedStudyHours: 0,
    revisionHours: 5,
    completedRevisionHours: 0,
    status: 'not_started',
  };

  const today = '2025-11-24';

  describe('urgency calculation', () => {
    it('calculates high urgency for exam in 3 days', () => {
      const exams: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-27', // 3 days away
        type: 'final',
      }];

      const result = calculateChapterPriority(baseChapter, exams, [], today);

      expect(result.urgency).toBeGreaterThan(0.8);
      expect(result.daysUntilExam).toBe(3);
    });

    it('calculates low urgency for exam in 30 days', () => {
      const exams: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-12-24', // 30 days away
        type: 'final',
      }];

      const result = calculateChapterPriority(baseChapter, exams, [], today);

      expect(result.urgency).toBeLessThan(0.3);
    });
  });

  describe('exam type weighting', () => {
    it('prioritizes final exam over monthly test', () => {
      const finalExam: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-30',
        type: 'final',
      }];

      const monthlyTest: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-30',
        type: 'monthly',
      }];

      const finalPriority = calculateChapterPriority(
        baseChapter,
        finalExam,
        [],
        today
      );

      const monthlyPriority = calculateChapterPriority(
        baseChapter,
        monthlyTest,
        [],
        today
      );

      expect(finalPriority.priority).toBeGreaterThan(monthlyPriority.priority);
    });
  });

  describe('edge cases', () => {
    it('handles exam in the past', () => {
      const exams: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-01', // Past date
        type: 'final',
      }];

      const result = calculateChapterPriority(baseChapter, exams, [], today);

      expect(result.priority).toBe(0);
      expect(result.urgency).toBe(0);
    });

    it('handles chapter with no matching exam', () => {
      const exams: SubjectExam[] = [{
        subject: 'Science', // Different subject
        date: '2025-11-30',
        type: 'final',
      }];

      const result = calculateChapterPriority(baseChapter, exams, [], today);

      expect(result.priority).toBe(0);
    });

    it('handles completed chapter', () => {
      const completedChapter: Chapter = {
        ...baseChapter,
        completedStudyHours: 10,
        completedRevisionHours: 5,
      };

      const exams: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-30',
        type: 'final',
      }];

      const result = calculateChapterPriority(completedChapter, exams, [], today);

      // Should have low priority if already complete
      expect(result.priority).toBeLessThan(1);
    });

    it('accounts for off days reducing available study time', () => {
      const offDays = [
        '2025-11-25',
        '2025-11-26',
        '2025-11-27',
      ];

      const exams: SubjectExam[] = [{
        subject: 'Math',
        date: '2025-11-30',
        type: 'final',
      }];

      const withoutOffDays = calculateChapterPriority(
        baseChapter,
        exams,
        [],
        today
      );

      const withOffDays = calculateChapterPriority(
        baseChapter,
        exams,
        offDays,
        today
      );

      // With fewer available days, priority should be higher
      expect(withOffDays.scarcity).toBeGreaterThan(withoutOffDays.scarcity);
      expect(withOffDays.priority).toBeGreaterThan(withoutOffDays.priority);
    });
  });
});
```

---

## Writing Integration Tests

### Integration Test Template

```typescript
// tests/integration/TodayPlan.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TodayPlan } from '@/pages/TodayPlan';
import { useStore } from '@/store/useStore';

describe('TodayPlan Integration', () => {
  beforeEach(() => {
    // Reset store
    localStorage.clear();
    useStore.setState(useStore.getInitialState());

    // Setup test user with realistic data
    const store = useStore.getState();
    store.switchUser('test-user');

    store.addChapter({
      id: 'ch-1',
      name: 'Algebra',
      subject: 'Math',
      studyHours: 5,
    });

    store.scheduleChapter(
      'ch-1',
      '2025-11-24',
      'study',
      60,
      'plan-1'
    );
  });

  it('full timer workflow: start → pause → resume → complete', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <TodayPlan />
      </BrowserRouter>
    );

    // Step 1: Start timer
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    // Verify store state
    let state = useStore.getState();
    expect(state.activitySessions).toHaveLength(1);
    expect(state.activitySessions[0].isActive).toBe(true);

    // Step 2: Pause timer
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    });

    state = useStore.getState();
    expect(state.activitySessions[0].isActive).toBe(false);

    // Step 3: Resume timer
    const resumeButton = screen.getByRole('button', { name: /resume/i });
    await user.click(resumeButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    state = useStore.getState();
    expect(state.activitySessions[0].isActive).toBe(true);

    // Step 4: Complete activity
    const completeButton = screen.getByRole('button', { name: /complete/i });
    await user.click(completeButton);

    // Confirm completion
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      state = useStore.getState();
      expect(state.activitySessions[0].isActive).toBe(false);
      expect(state.activitySessions[0].endTime).toBeDefined();
    });

    // Verify chapter progress updated
    const chapter = state.userData['test-user'].chapters.find(ch => ch.id === 'ch-1');
    expect(chapter?.completedStudyHours).toBeGreaterThan(0);
  });

  it('handles multi-task switching with auto-pause', async () => {
    const user = userEvent.setup();

    // Add second chapter
    const store = useStore.getState();
    store.addChapter({
      id: 'ch-2',
      name: 'Geometry',
      subject: 'Math',
      studyHours: 4,
    });
    store.scheduleChapter('ch-2', '2025-11-24', 'study', 45, 'plan-1');

    render(
      <BrowserRouter>
        <TodayPlan />
      </BrowserRouter>
    );

    // Start first task
    const algebraStart = screen.getAllByRole('button', { name: /start/i })[0];
    await user.click(algebraStart);

    await waitFor(() => {
      expect(screen.getByText(/algebra/i)).toBeInTheDocument();
    });

    // Start second task (should auto-pause first)
    const geometryStart = screen.getAllByRole('button', { name: /start/i })[1];
    await user.click(geometryStart);

    await waitFor(() => {
      expect(screen.getByText(/geometry/i)).toBeInTheDocument();
    });

    // Verify store state
    const state = useStore.getState();
    const sessions = state.activitySessions;

    // Both sessions should exist
    expect(sessions).toHaveLength(2);

    // Only one should be active
    const activeSessions = sessions.filter(s => s.isActive);
    expect(activeSessions).toHaveLength(1);
    expect(activeSessions[0].chapterId).toBe('ch-2'); // Geometry

    // First should be paused
    const pausedSession = sessions.find(s => s.chapterId === 'ch-1');
    expect(pausedSession?.isActive).toBe(false);
  });
});
```

---

## Writing E2E Tests

### E2E Test Template

```typescript
// tests/e2e/your-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Your Feature', () => {
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Setup test user
    await page.evaluate(() => {
      const testData = {
        currentUserId: 'test-user',
        userData: {
          'test-user': {
            chapters: [],
            assignments: [],
            activitySessions: [],
          },
        },
      };

      localStorage.setItem('study-planner-storage', JSON.stringify(testData));
    });

    await page.goto('/your-feature');
  });

  test('completes main user flow', async ({ page }) => {
    // Step 1: Navigate to feature
    await page.click('[data-testid="feature-nav-link"]');
    await expect(page).toHaveURL('/your-feature');

    // Step 2: Interact with UI
    await page.fill('[data-testid="input-field"]', 'test value');
    await page.click('[data-testid="submit-button"]');

    // Step 3: Verify outcome
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Successfully created'
    );

    // Step 4: Verify data persisted
    const stored = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('study-planner-storage') || '{}');
    });

    expect(stored.userData['test-user'].yourFeature).toBeDefined();
  });

  test('handles error gracefully', async ({ page }) => {
    // Trigger error condition
    await page.fill('[data-testid="input-field"]', ''); // Empty input
    await page.click('[data-testid="submit-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'required'
    );
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="first-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="second-input"]')).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="submit-button"]')).toBeFocused();
  });
});
```

### E2E Test with Backend (Phase 4/5)

```typescript
// tests/e2e/backend-sync.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Backend Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('syncs chapter creation to backend', async ({ page }) => {
    // Enable cloud sync
    await page.goto('/settings');
    await page.click('[data-testid="enable-cloud-sync"]');

    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Enabled');

    // Create chapter
    await page.goto('/subjects');
    await page.click('[data-testid="add-chapter"]');
    await page.fill('[name="name"]', 'Test Chapter');
    await page.fill('[name="studyHours"]', '5');
    await page.click('[data-testid="save-chapter"]');

    // Wait for backend request
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/chapters') && resp.request().method() === 'POST'
    );

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe('Test Chapter');
    expect(body.studyHours).toBe(5);

    // Verify sync indicator
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });

  test('handles offline gracefully', async ({ page, context }) => {
    // Enable cloud sync
    await page.goto('/settings');
    await page.click('[data-testid="enable-cloud-sync"]');

    // Go offline
    await context.setOffline(true);

    // Create chapter
    await page.goto('/subjects');
    await page.click('[data-testid="add-chapter"]');
    await page.fill('[name="name"]', 'Offline Chapter');
    await page.click('[data-testid="save-chapter"]');

    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-banner"]')).toContainText(
      'Changes will sync when online'
    );

    // Verify chapter saved locally
    await expect(page.locator('text=Offline Chapter')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Trigger sync
    await page.click('[data-testid="sync-now"]');

    // Verify synced
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });
});
```

---

## Test Templates

### Component with Store Template

```typescript
import { render, screen } from '@testing-library/react';
import { useStore } from '@/store/useStore';
import { YourComponent } from '@/components/YourComponent';

// Mock the store
vi.mock('@/store/useStore');

describe('YourComponent', () => {
  beforeEach(() => {
    // Setup store mock
    useStore.mockImplementation((selector) => {
      const mockState = {
        currentUserId: 'test-user',
        userData: {
          'test-user': {
            chapters: [
              { id: '1', name: 'Algebra', studyHours: 5 },
            ],
          },
        },
        addChapter: vi.fn(),
      };

      return selector ? selector(mockState) : mockState;
    });
  });

  it('renders with store data', () => {
    render(<YourComponent />);

    expect(screen.getByText('Algebra')).toBeInTheDocument();
  });
});
```

### Async Component Test Template

```typescript
it('loads data asynchronously', async () => {
  // Mock async function
  const mockFetch = vi.fn().mockResolvedValue({
    chapters: [{ id: '1', name: 'Algebra' }],
  });

  render(<YourComponent fetchData={mockFetch} />);

  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Algebra')).toBeInTheDocument();
  });

  // Verify loading gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

---

## Best Practices

### 1. Test Naming

**Good:**
```typescript
it('renders chapter name when chapter prop provided')
it('calls onEdit when edit button clicked')
it('shows error message when validation fails')
it('updates store when form submitted successfully')
```

**Bad:**
```typescript
it('works')
it('test 1')
it('should render')
it('handles click')
```

### 2. Arrange-Act-Assert (AAA) Pattern

```typescript
it('completes timer and updates chapter progress', async () => {
  // Arrange: Setup test data and initial state
  const user = userEvent.setup();
  const store = useStore.getState();
  store.addChapter({ id: 'ch-1', name: 'Algebra', studyHours: 5 });
  store.scheduleChapter('ch-1', '2025-11-24', 'study', 60);

  render(<TodayPlan />);

  // Act: Perform the action being tested
  await user.click(screen.getByRole('button', { name: /start/i }));
  await user.click(screen.getByRole('button', { name: /complete/i }));

  // Assert: Verify the outcome
  const chapter = store.userData['test-user'].chapters.find(ch => ch.id === 'ch-1');
  expect(chapter.completedStudyHours).toBeGreaterThan(0);
});
```

### 3. Use data-testid for E2E-only

**Component:**
```tsx
// Good: Semantic queries preferred
<button type="submit">Save Chapter</button>

// Acceptable: data-testid when semantic query not possible
<div data-testid="chapter-list">...</div>

// Bad: Overusing data-testid
<button data-testid="save-button" type="submit">Save</button>
```

**Tests:**
```typescript
// Good: Query by role/label
screen.getByRole('button', { name: /save chapter/i })

// Good: Query by text
screen.getByText('Algebra')

// Acceptable: data-testid when needed
screen.getByTestId('chapter-list')

// Bad: Avoid class/id selectors
screen.getByClassName('btn-primary')
```

### 4. Test User Behavior, Not Implementation

**Good:**
```typescript
it('displays updated chapter name after editing', async () => {
  const user = userEvent.setup();
  render(<ChapterList />);

  // User perspective: click edit, type name, save
  await user.click(screen.getByRole('button', { name: /edit/i }));
  await user.clear(screen.getByRole('textbox', { name: /name/i }));
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Updated');
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Verify outcome user sees
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

**Bad:**
```typescript
it('calls setChapterName on input change', async () => {
  const setChapterName = vi.fn();
  render(<ChapterForm setChapterName={setChapterName} />);

  // Testing internal implementation detail
  await user.type(screen.getByRole('textbox'), 'Test');

  expect(setChapterName).toHaveBeenCalled(); // Who cares? User doesn't see this
});
```

### 5. Avoid Test Duplication

**Good:**
```typescript
describe.each([
  { examType: 'final', expectedWeight: 1.5 },
  { examType: 'mid-term', expectedWeight: 1.3 },
  { examType: 'quarterly', expectedWeight: 1.2 },
])('exam type weighting', ({ examType, expectedWeight }) => {
  it(`applies ${expectedWeight} weight for ${examType} exam`, () => {
    const result = calculatePriority({ examType });
    expect(result.weight).toBe(expectedWeight);
  });
});
```

**Bad:**
```typescript
it('applies 1.5 weight for final exam', () => {
  expect(calculatePriority({ examType: 'final' }).weight).toBe(1.5);
});

it('applies 1.3 weight for mid-term exam', () => {
  expect(calculatePriority({ examType: 'mid-term' }).weight).toBe(1.3);
});
// ... repeated for each exam type
```

---

## Common Patterns

### 1. Testing with localStorage

```typescript
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('study-planner-storage', JSON.stringify({
    currentUserId: 'test-user',
    userData: {
      'test-user': { chapters: [] },
    },
  }));
});

afterEach(() => {
  localStorage.clear();
});
```

### 2. Testing Timers

```typescript
it('updates elapsed time every second', async () => {
  vi.useFakeTimers();

  render(<Timer />);

  await user.click(screen.getByRole('button', { name: /start/i }));

  // Fast-forward 5 seconds
  vi.advanceTimersByTime(5000);

  expect(screen.getByText('00:05')).toBeInTheDocument();

  vi.useRealTimers();
});
```

### 3. Testing Forms

```typescript
it('validates and submits form data', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  render(<ChapterForm onSubmit={handleSubmit} />);

  // Fill form
  await user.type(screen.getByLabelText(/name/i), 'Algebra');
  await user.type(screen.getByLabelText(/study hours/i), '5');
  await user.selectOptions(screen.getByLabelText(/subject/i), 'Math');

  // Submit
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Verify
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'Algebra',
    studyHours: 5,
    subject: 'Math',
  });
});
```

### 4. Testing Error States

```typescript
it('displays validation error for invalid input', async () => {
  const user = userEvent.setup();

  render(<ChapterForm />);

  // Trigger validation error
  await user.type(screen.getByLabelText(/study hours/i), '-5');
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Verify error message
  expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/...'"

**Solution:** Check `vite.config.ts` has alias configured:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

#### 2. "localStorage is not defined"

**Solution:** Vitest uses jsdom which includes localStorage. If still failing:
```typescript
// tests/setup.ts
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
```

#### 3. "Element not found" in tests

**Solution:** Use `waitFor` for async elements:
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

#### 4. Playwright timeout

**Solution:** Increase timeout for slow operations:
```typescript
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds

  await page.waitForSelector('[data-testid="element"]', {
    timeout: 30000,
  });
});
```

#### 5. Flaky tests

**Solutions:**
- Use `waitFor` instead of fixed delays
- Mock unpredictable dependencies (dates, random)
- Ensure proper cleanup in `beforeEach`/`afterEach`
- Use `test.describe.serial` for dependent tests

```typescript
// Bad: Flaky due to fixed delay
await new Promise(resolve => setTimeout(resolve, 1000));
expect(screen.getByText('Loaded')).toBeInTheDocument();

// Good: Wait for actual condition
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

---

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# View in terminal
npm run test:coverage -- --reporter=text
```

### Understanding Coverage Metrics

- **Lines:** % of code lines executed
- **Functions:** % of functions called
- **Branches:** % of if/else paths taken
- **Statements:** % of statements executed

**Target:** 60% overall, 95% for store, 80% for utilities

---

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request to `main`

**Required for merge:**
- ✅ All unit tests pass
- ✅ All E2E tests pass (Chrome)
- ✅ Coverage meets thresholds
- ✅ No accessibility violations

**Optional (warnings):**
- Firefox/Safari E2E tests
- Performance budgets
- Visual regression changes

---

## Getting Help

- **Documentation:** See `TESTING_STRATEGY.md` for overall strategy
- **Examples:** Review existing tests in `tests/unit/components/UserSelection.test.tsx`
- **Debugging:** Use `npm run test:e2e:ui` for visual debugging
- **Questions:** Ask Testing Champion or open GitHub Discussion

---

**Document Version:** 1.0
**Last Updated:** 2025-11-24
**Maintained By:** Testing Champion
