# Contributing to Study Planner

Thank you for contributing to the Study Planner project! This guide will help you get started with our development workflow.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/nsareen/study-planner-app.git
cd study-planner-app/study-planner-app

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:unit
npm run test:e2e
```

## 📋 Development Workflow

### 1. Before Starting Work

**Read the governance process in `CLAUDE.md`** - This is mandatory!

Then:
1. Read `PROGRESS.md` to understand current state
2. Check GitHub issues for the task you're working on
3. If no issue exists, create one using our templates
4. Update issue to `status:in-progress`
5. Update `PROGRESS.md` with your task

### 2. During Development

**Branch Naming:**
```
feature/feature-name    # New features
bugfix/bug-description  # Bug fixes
refactor/description    # Code refactoring
docs/description        # Documentation
test/description        # Testing work
```

**Commit Messages:**
```
type(scope): description (#issue-number)

- Detail 1
- Detail 2

Closes #42
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`

**Example:**
```bash
git commit -m "feat(timer): add multi-task switching (#45)

- Allow pausing current task when starting new one
- Track multiple timers simultaneously
- Update UI to show paused tasks

Closes #45"
```

### 3. Testing

**Before Pushing:**
```bash
npm run lint        # ESLint must pass
npm run test:unit   # Unit tests must pass
npm run test:e2e    # E2E tests must pass
npm run build       # Build must succeed
```

### 4. Creating Pull Requests

**Always create PRs to `develop` branch, never directly to `main`!**

```bash
# Push your branch
git push origin feature/my-feature

# Create PR using GitHub CLI
gh pr create \
  --base develop \
  --title "feat(component): Description (#issue-number)" \
  --body "See PR template"
```

**PR Checklist:**
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No linting errors
- [ ] Documentation updated
- [ ] PROGRESS.md updated
- [ ] GitHub issue updated
- [ ] Tested on Vercel preview

### 5. Code Review

- PRs to `develop` require 1 approval
- PRs to `main` require 2 approvals
- Address all review comments
- Update based on feedback
- Squash commits before merging

## 🏗️ Project Structure

```
study-planner-app/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components (routes)
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main app component
├── tests/
│   ├── unit/           # Vitest unit tests
│   └── e2e/            # Playwright E2E tests
├── docs/               # Documentation
├── PROGRESS.md         # Real-time work tracking
├── CLAUDE.md           # Governance and guidelines
└── package.json
```

## 🎨 Code Style

**TypeScript:**
- Use strict mode
- Explicit return types for functions
- Prefer `interface` over `type` for objects
- Use meaningful variable names

**React:**
- Functional components with hooks
- Use TypeScript for props
- Extract complex logic to custom hooks
- Keep components under 300 lines

**Styling:**
- TailwindCSS utility classes
- Consistent spacing (multiples of 4)
- Follow existing patterns (glassmorphism, gradients)

**File Naming:**
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `ComponentName.test.tsx`

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test:unit         # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

**Guidelines:**
- Test business logic and utilities
- Mock Zustand store
- Use `@testing-library/react` for components
- Aim for 80%+ coverage

### E2E Tests (Playwright)
```bash
npm run test:e2e          # All tests
npm run test:e2e:ui       # With UI
npm run test:debug        # Debug mode
```

**Guidelines:**
- Test user workflows end-to-end
- Use `data-testid` attributes
- Test across browsers (chromium, firefox, webkit)
- Include accessibility tests

## 📚 Documentation

When adding features:
- Update relevant docs in `/docs`
- Add JSDoc comments for public APIs
- Update `CLAUDE.md` if changing architecture
- Document breaking changes

## 🐛 Reporting Bugs

Use the bug issue template:
```bash
gh issue create --template bug.md
```

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Console errors
- Environment details

## 🔧 Debugging Tips

**State Issues:**
- Check localStorage in DevTools
- Use `validateDataIntegrity()` from store
- Export data and inspect JSON

**Timer Issues:**
- Check `resetActiveSessionsAndTimers()` on app load
- Verify ActivitySession state
- Use `cleanupSessions()` for stale data

**Test Failures:**
- Clear localStorage before tests
- Check `tests/setup.ts` for global mocks
- Use Playwright UI mode for debugging

## 🚨 Important Rules

### MUST DO:
✅ Create GitHub issue before starting work
✅ Update PROGRESS.md during work
✅ Include issue number in commits
✅ Write tests for new features
✅ Run all tests before pushing
✅ Create PR to `develop` (not `main`)
✅ Update documentation

### MUST NOT DO:
❌ Commit directly to `main` or `develop`
❌ Push without tests passing
❌ Work without GitHub issue
❌ Skip PROGRESS.md updates
❌ Merge without approval
❌ Introduce breaking changes without discussion

## 🆘 Getting Help

- Read `CLAUDE.md` for detailed governance
- Read `docs/V2_ROADMAP.md` for implementation plan
- Check existing GitHub issues
- Review `docs/AUDIT_REPORT.md` for known issues
- Ask questions in PR comments

## 📞 Contact

- **GitHub Issues:** https://github.com/nsareen/study-planner-app/issues
- **Discussions:** Use GitHub Discussions for questions
- **Code Owner:** @nsareen

## 📜 License

This project is part of the Study Planner application for 9th grade students.

---

**Remember:** Quality over speed. Take time to write tests, document your changes, and follow the governance process. It saves time in the long run!

For detailed governance process, see `CLAUDE.md`.
