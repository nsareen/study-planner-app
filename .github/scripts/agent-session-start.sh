#!/bin/bash
# Agent Session Start Protocol
# Usage: AGENT_TYPE=dev ./agent-session-start.sh
# Usage: AGENT_TYPE=test ./agent-session-start.sh

set -e

echo "🤖 Agent Session Start Protocol"
echo "================================"
echo "Agent Type: ${AGENT_TYPE:-unknown}"
echo "Date: $(date)"
echo ""

# Check if AGENT_TYPE is set
if [ -z "$AGENT_TYPE" ]; then
  echo "❌ ERROR: AGENT_TYPE environment variable not set"
  echo "Usage: AGENT_TYPE=dev ./agent-session-start.sh"
  echo "   or: AGENT_TYPE=test ./agent-session-start.sh"
  exit 1
fi

# 1. Pull latest changes
echo "📥 Step 1: Pulling latest changes..."
git fetch origin
echo "  - Fetched from origin"

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "  - Current branch: $CURRENT_BRANCH"

# Pull main branch
echo "  - Pulling main branch..."
git pull origin main --no-edit 2>/dev/null || echo "  - Main branch up to date or doesn't exist"

# Pull feature branch
echo "  - Pulling feature/phase6-component-migration..."
git pull origin feature/phase6-component-migration --no-edit 2>/dev/null || echo "  - Feature branch up to date or doesn't exist"

echo "  ✅ Git pull complete"
echo ""

# 2. Read coordination file
echo "📋 Step 2: Reading AGENT_COORDINATION.md..."
if [ -f "AGENT_COORDINATION.md" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  head -100 AGENT_COORDINATION.md
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "  ⚠️  AGENT_COORDINATION.md not found"
fi
echo ""

# 3. Read other agent's status
if [ "$AGENT_TYPE" = "dev" ]; then
  echo "🧪 Step 3: Checking Testing Agent Status..."
  if [ -f ".test-status.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat .test-status.json | python3 -m json.tool 2>/dev/null || cat .test-status.json
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  else
    echo "  ⚠️  .test-status.json not found"
  fi
  echo ""

  echo "🐛 Step 4: Checking for bugs to fix..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  git log --all --grep="\[BUG_FOUND\]" --since="3 days ago" --oneline --no-decorate || echo "  No bugs found in recent commits"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  echo "📝 Step 5: Checking GitHub issue #8 for bug reports..."
  if command -v gh &> /dev/null; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    gh issue view 8 --comments 2>/dev/null | tail -30 || echo "  Could not fetch issue #8 comments"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  else
    echo "  ⚠️  GitHub CLI (gh) not installed - skipping issue check"
  fi
  echo ""

elif [ "$AGENT_TYPE" = "test" ]; then
  echo "🔧 Step 3: Checking Dev Agent Status..."
  if [ -f ".dev-status.json" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat .dev-status.json | python3 -m json.tool 2>/dev/null || cat .dev-status.json
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  else
    echo "  ⚠️  .dev-status.json not found"
  fi
  echo ""

  echo "✅ Step 4: Checking for features ready to test..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  git log --all --grep="\[READY_FOR_TEST\]" --since="3 days ago" --oneline --no-decorate || echo "  No features marked ready for test"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  echo "🔧 Step 5: Checking for bug fixes..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  git log --all --grep="\[BUG_FIXED\]" --since="3 days ago" --oneline --no-decorate || echo "  No bug fixes in recent commits"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  echo "📝 Step 6: Checking GitHub issue #8 for updates..."
  if command -v gh &> /dev/null; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    gh issue view 8 --comments 2>/dev/null | tail -30 || echo "  Could not fetch issue #8 comments"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  else
    echo "  ⚠️  GitHub CLI (gh) not installed - skipping issue check"
  fi
  echo ""
fi

# 4. Check PROGRESS.md
echo "📊 Step 6: Checking Current Progress..."
if [ -f "PROGRESS.md" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  head -50 PROGRESS.md
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "  ⚠️  PROGRESS.md not found"
fi
echo ""

# 5. Check recent commits
echo "📜 Step 7: Recent commits (last 10)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline -10 --no-decorate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "✅ Session Start Protocol Complete!"
echo ""
echo "📋 Next Steps for $AGENT_TYPE agent:"
if [ "$AGENT_TYPE" = "dev" ]; then
  echo "  1. Check if testing agent found any bugs (see above)"
  echo "  2. Fix bugs if any, or continue with planned work"
  echo "  3. Update AGENT_COORDINATION.md with your status"
  echo "  4. Update .dev-status.json before session end"
  echo "  5. Use commit flags: [READY_FOR_TEST], [BUG_FIXED]"
elif [ "$AGENT_TYPE" = "test" ]; then
  echo "  1. Check what dev agent marked [READY_FOR_TEST] (see above)"
  echo "  2. Start with Priority 1: Store tests (useStore.ts)"
  echo "  3. Report bugs via GitHub issue #8 and AGENT_COORDINATION.md"
  echo "  4. Update .test-status.json before session end"
  echo "  5. Use commit flags: [BUG_FOUND], [TESTS_PASSING]"
fi
echo ""
echo "🚀 Ready to start work!"
