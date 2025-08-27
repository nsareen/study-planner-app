# Study Planner - 9th Grade Student Study Management App

A modern, intuitive web application designed to help school students manage their study schedules, track exam preparation, and optimize their learning time with intelligent prioritization.

## Features

### Core Functionality
- **Daily Study Planning**: Automatically generates personalized daily study schedules based on exams, priorities, and available time
- **Smart Prioritization**: Uses an advanced algorithm considering urgency, scarcity, and exam importance
- **Subject & Chapter Management**: Track multiple subjects with chapters, time estimates, and progress
- **Exam Tracking**: Manage upcoming exams with dates, types (weekly, monthly, quarterly, mid-term, final), and subjects
- **Off Days Management**: Account for holidays and breaks in study planning
- **Progress Visualization**: Interactive charts showing study progress, time tracking, and completion rates
- **Time Tracking**: Log actual study time with built-in timer functionality
- **Data Persistence**: All data stored locally in browser for privacy and offline access
- **Import/Export**: Backup and restore your data easily

### Technical Features
- **PWA Support**: Install as a mobile/desktop app for offline use
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Fast Performance**: Built with Vite and React for optimal speed

## Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with localStorage persistence  
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites
- Node.js 18+ and npm installed

### Installation
```bash
# Clone the repository
cd study-planner-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production
```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Usage Guide

### 1. Initial Setup
- Go to **Settings** to configure your daily study hours and session preferences
- Navigate to **Calendar** to add upcoming exams and off days

### 2. Adding Study Content
- Go to **Subjects** to add chapters for each subject
- Specify estimated hours needed for each chapter

### 3. Daily Planning
- Visit **Today** to see your auto-generated study plan
- Use the timer to track actual study time
- Mark tasks as completed, skipped, or in-progress

### 4. Tracking Progress
- Check **Progress** for visual analytics
- Monitor completion rates and time spent per subject
- Review weekly study patterns

## Smart Prioritization Algorithm

The app uses a sophisticated prioritization formula:
```
Priority = RemainingHours × ExamTypeWeight × (2 × Urgency + Scarcity)
```

Where:
- **RemainingHours**: Hours left to complete the chapter
- **ExamTypeWeight**: Final (1.5) > Mid-term (1.3) > Quarterly (1.2) > Monthly (1.1) > Weekly (1.0)
- **Urgency**: How close the exam is (0-1 scale)
- **Scarcity**: How few study days remain (0-1 scale)

## Data Privacy
- All data is stored locally in your browser
- No server or cloud storage involved
- Export your data anytime for backup
- Clear all data instantly from Settings

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## License
MIT

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.