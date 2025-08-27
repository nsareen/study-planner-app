# Study Planner App - Technical Documentation

## 🎯 Project Overview
A comprehensive, intelligent study planning application designed for 9th grade students to manage their exam preparation, track progress, and collaborate with peers. The system provides automated planning with exam groups, multiple study plans, visual tracking through matrix views, and gamification elements to enhance student engagement and academic performance.

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4
- **State Management**: Zustand with localStorage persistence
- **Styling**: TailwindCSS with custom gradient themes
- **UI Icons**: Lucide React
- **Charts**: Recharts
- **Date Management**: date-fns
- **PWA**: vite-plugin-pwa for offline capabilities

### Project Structure
```
study-planner-app/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Main navigation and app layout
│   │   ├── UserSelection.tsx       # User profile selection screen
│   │   ├── MatrixPlannerView.tsx   # Matrix view with calendar integration
│   │   ├── PlannerTutorial.tsx     # Interactive tutorial system
│   │   ├── CurriculumImport.tsx    # Bulk chapter import from URLs
│   │   └── games/
│   │       └── TicTacToe.tsx      # Tic-tac-toe game component
│   ├── pages/
│   │   ├── SmartPlanner.tsx       # Intelligent study planner with multiple views
│   │   ├── TodayPlan.tsx          # Daily study plan with timer
│   │   ├── Subjects.tsx           # Subject and chapter management
│   │   ├── Calendar.tsx           # Exam groups and off-day scheduling
│   │   ├── Progress.tsx           # Analytics and progress charts
│   │   ├── Settings.tsx           # App settings and data management
│   │   └── Collaboration.tsx      # Study rooms and chat features
│   ├── store/
│   │   └── useStore.ts            # Zustand store with exam groups & plans
│   ├── types/
│   │   └── index.ts               # TypeScript types with ExamGroup, StudyPlan
│   ├── utils/
│   │   ├── prioritization.ts      # Smart prioritization algorithm
│   │   └── syllabusParser.ts      # Curriculum parsing from web sources
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles and Tailwind config
├── public/
│   └── icon.svg                   # PWA icon
├── tailwind.config.js             # Tailwind configuration
├── vite.config.ts                 # Vite and PWA configuration
└── package.json                   # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradients (#c91af4 to #aa0dd7)
- **Secondary**: Cyan gradients (#00bde6 to #0099bf)
- **Accent Colors**:
  - Yellow: #FFD93D (achievements)
  - Orange: #FF6B6B (warnings)
  - Green: #4ECDC4 (success)
  - Pink: #FF69B4 (highlights)

### UI Components
- Glass morphism effects with backdrop blur
- Gradient backgrounds and buttons
- Rounded corners (xl, 2xl, 3xl)
- Hover animations and scale effects
- Floating action buttons
- Card-based layouts

## 👥 User System

### Pre-configured Users
The app comes with 4 pre-configured student profiles:
1. **Ananya** - Mathematics enthusiast, Level 3
2. **Saanvi** - Science star, Level 2  
3. **Sara** - Computer Science lover, Level 4
4. **Arshita** - Chemistry champion, Level 3

### User Profile Structure
```typescript
{
  id: string
  name: string
  avatar: string (emoji)
  grade: string
  streak: number
  level: number
  totalStudyMinutes: number
  achievements: string[]
  favoriteSubject?: string
  motivationalQuote?: string
  friends?: string[]
  status?: 'online' | 'studying' | 'break' | 'offline'
}
```

### Data Isolation
Each user has completely separate:
- Study chapters and subjects
- Exams and calendar events
- Daily logs and progress
- Personal settings
- Study room history

## 🆕 Latest Enhancements (v2.0)

### Exam Groups System
- **Hierarchical Exam Structure**: Parent exam groups containing multiple subject exam dates
- **Batch Operations**: Apply entire exam series to calendar with one click
- **Date Range Management**: Define exam periods with automatic off-day generation
- **Subject-Specific Scheduling**: Individual dates and durations per subject

### Multiple Study Plans
- **Plan Management**: Create, duplicate, archive multiple study plans
- **Version Control**: Track plan history and changes over time
- **Status Tracking**: Draft, Active, Completed, Archived states
- **Plan Templates**: Save and reuse successful study patterns

### Enhanced Matrix View
- **"Add to Calendar" Workflow**: Replaced drag-drop with button-based date selection
- **Chapter Management**: Add/remove chapters and subjects dynamically
- **Editable Hours**: Click-to-edit study and revision hours with persistence
- **Exam Day Highlighting**: Visual indicators for exam dates in calendar
- **Bulk Operations**: Select multiple chapters for batch updates

### Smart Planner Improvements
- **Curriculum Import**: Bulk import from BYJU's and other educational sites
- **Auto Subject Detection**: Parse and categorize chapters automatically
- **Visual Tutorial**: 6-step interactive guide for new users
- **Real-time Timer**: Track actual vs planned study time

## 📚 Core Features

### 1. Daily Study Planning
- **Location**: `src/pages/TodayPlan.tsx`
- **Features**:
  - Auto-generated daily study schedule
  - Smart task prioritization
  - Built-in timer with play/pause/complete
  - Task status tracking (pending, in-progress, completed, skipped)
  - Motivational messages that rotate
  - Progress celebration when 100% complete
  - Customizable study hours (1-15 hours)
  - Focus on specific subjects option

### 2. Smart Prioritization Algorithm
- **Location**: `src/utils/prioritization.ts`
- **Formula**: `Priority = RemainingHours × ExamTypeWeight × (2 × Urgency + Scarcity)`
- **Factors**:
  - Exam proximity (urgency)
  - Available study days (scarcity)
  - Exam importance (type weight)
  - Chapter completion status

### 3. Subject Management
- **Location**: `src/pages/Subjects.tsx`
- **Features**:
  - Add/edit/delete chapters
  - Track completion percentage
  - Visual progress bars
  - Subject-wise grouping
  - Time estimation per chapter
  - Status indicators (not started, in progress, completed)

### 4. Calendar & Scheduling
- **Location**: `src/pages/Calendar.tsx`
- **Features**:
  - Exam scheduling with types (weekly, monthly, quarterly, mid-term, final)
  - Off-day management (holidays, breaks)
  - Days-until countdown
  - Subject association with exams
  - Visual date indicators

### 5. Progress Analytics
- **Location**: `src/pages/Progress.tsx`
- **Charts**:
  - Weekly study hours (bar chart)
  - Chapter status distribution (pie chart)
  - Subject progress (horizontal bar chart)
  - Completion percentages
- **Metrics**:
  - Total progress percentage
  - Chapters completed
  - Hours studied
  - Hours remaining

### 6. Collaboration Hub
- **Location**: `src/pages/Collaboration.tsx`
- **Features**:
  - Create/join study rooms
  - Real-time chat messaging
  - Screenshot sharing
  - Online friends list
  - Brain break games (Tic-Tac-Toe)
  - Whiteboard placeholder
  - Video call placeholder

## 🎮 Gamification Elements

### Achievement System
- Streak tracking (consecutive study days)
- Level progression based on study time
- Achievement badges
- Motivational quotes
- Progress celebrations
- Visual rewards (stars, trophies)

### Brain Games
- **Implemented**: Tic-Tac-Toe with score tracking
- **Planned**: Sudoku, Word Puzzle, Math Quiz

## 💾 Data Management

### Storage
- **Method**: Zustand with localStorage persistence
- **Key**: `study-planner-storage`
- **Structure**: User-specific data buckets

### Import/Export
- JSON format for data backup
- Complete state export including all users
- File download/upload functionality

## 🚀 PWA Features

### Offline Capabilities
- Service worker for offline functionality
- Cache-first strategy for fonts
- App manifest for installation
- Responsive design for all devices

### Installation
- Installable as desktop/mobile app
- Custom app icon
- Splash screen support
- Standalone display mode

## 🔧 Configuration

### Daily Study Settings
- **Study Hours**: 1-15 hours per day
- **Session Duration**: 15-120 minutes
- **Break Duration**: 5-30 minutes
- **Theme**: Light/Dark/System

### Customization Options
- Study hour adjustment in "New Plan" modal
- Subject-specific focus mode
- Task shuffling for variety
- Manual plan regeneration

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Collapsible navigation
- Touch-friendly buttons
- Swipeable cards
- Responsive grid layouts

## 🎨 Themes (To Be Implemented)

### Planned Themes
1. **Default** - Purple/Pink gradients (current)
2. **Floral** - Soft pastels with nature motifs
3. **Ocean** - Blue/Aqua with wave patterns
4. **Minimal** - Clean whites and grays
5. **Sunset** - Warm oranges and reds
6. **Forest** - Green earth tones
7. **Space** - Dark with stars

## 🐛 Known Issues & Limitations

1. Navigation spacing needs adjustment
2. Theme system not yet implemented
3. Real-time sync not available (local storage only)
4. Video call and whiteboard are placeholders
5. Some games marked as "Coming Soon"

## 📝 Development Notes

### Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Files to Modify
- **Add new page**: Create in `src/pages/`, add route in `App.tsx`, add nav in `Layout.tsx`
- **Modify store**: Edit `src/store/useStore.ts`
- **Add types**: Update `src/types/index.ts`
- **Change colors**: Edit `tailwind.config.js`
- **Modify prioritization**: Edit `src/utils/prioritization.ts`

## 🚧 Features In Development

### Exam Group Implementation (In Progress)
1. Enhanced exam creation form with date range selector
2. Subject-wise exam date picker
3. Automatic off-day scheduling between exams
4. One-click exam group application to planner
5. Exam series templates for common patterns

### Study Plan Versioning (Upcoming)
1. Multiple concurrent study plans
2. Plan comparison and diff view
3. Historical plan analytics
4. Success rate tracking per plan
5. Plan sharing between users

### Advanced Chapter Management (Upcoming)
1. Bulk import from multiple educational sites
2. AI-powered time estimation
3. Prerequisite tracking
4. Difficulty-based scheduling
5. Chapter dependency mapping

## 🔮 Future Enhancements

### Planned Features
1. Multiple theme support with theme switcher
2. Real-time collaboration with WebRTC
3. Cloud sync with backend API
4. More brain games (Sudoku, Word games)
5. Study group video calls
6. Shared whiteboards with drawing tools
7. AI-powered study recommendations
8. Parent/teacher dashboard
9. Export to calendar apps
10. Mobile app versions (React Native)

### Technical Improvements
1. Add unit tests with Vitest
2. Implement E2E tests with Playwright
3. Add error boundaries
4. Implement lazy loading for routes
5. Add performance monitoring
6. Implement proper WebSocket for real-time features
7. Add internationalization (i18n)

## 🎯 Target Audience
- **Primary**: 9th grade students (14-15 years old)
- **Secondary**: Middle and high school students
- **Use Cases**: Exam preparation, daily study planning, peer collaboration

## 📜 Version History

### v2.0.0 (August 27, 2025) - Smart Planner Enhancement
- **NEW**: Smart Study Planner module with matrix view
- **NEW**: Exam Groups with multiple subject exam dates
- **NEW**: Multiple study plan support with versioning
- **NEW**: Curriculum import from educational websites
- **NEW**: "Add to Calendar" workflow replacing drag-drop
- **IMPROVED**: Chapter hours editing with persistence
- **IMPROVED**: Exam selection integration with calendar
- **IMPROVED**: Visual tutorial system
- **FIXED**: Duplicate chapter import issues
- **FIXED**: Subject detection in curriculum parser

### v1.5.0 (Previous) - Matrix View & Planning
- Initial matrix view implementation
- Drag and drop functionality (later replaced)
- Basic exam management
- Study vs revision hours tracking

### v1.0.0 - Initial Release
- Multi-user support with pre-configured profiles
- Daily study planning with timer
- Basic collaboration features
- Progress tracking and analytics
- PWA capabilities
- Gamification elements

---

*This documentation serves as a comprehensive guide for understanding and maintaining the Study Planner application. It should be updated as new features are added or architectural changes are made.*

*Last Updated: August 27, 2025*  
*Current Version: 2.0.0*  
*Status: Active Development*