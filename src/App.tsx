import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import UserSelection from './components/UserSelection';
import ThemeProvider from './components/ThemeProvider';
import Tutorial from './components/Tutorial';
import Dashboard from './pages/Dashboard';
import TodayPlan from './pages/TodayPlan';
import Subjects from './pages/Subjects';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Collaboration from './pages/Collaboration';
import Help from './pages/Help';
import SmartPlanner from './pages/SmartPlanner';

function App() {
  const { currentUserId, getCurrentUser, markOnboardingComplete } = useStore();
  const [showTutorial, setShowTutorial] = useState(false);
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    // Show tutorial for new users who haven't completed onboarding
    if (currentUser && !currentUser.hasCompletedOnboarding) {
      setShowTutorial(true);
    }
  }, [currentUser]);
  
  const handleTutorialClose = () => {
    setShowTutorial(false);
    markOnboardingComplete();
  };
  
  // CSS Debug Info
  useEffect(() => {
    console.log('CSS Debug Info:');
    console.log('- Stylesheets loaded:', document.styleSheets.length);
    console.log('- Body classes:', document.body.className);
    console.log('- Computed style test:', window.getComputedStyle(document.body).backgroundColor);
    
    // Check if Tailwind is working
    const testDiv = document.createElement('div');
    testDiv.className = 'bg-red-500';
    document.body.appendChild(testDiv);
    const bgColor = window.getComputedStyle(testDiv).backgroundColor;
    console.log('- Tailwind test (bg-red-500):', bgColor);
    document.body.removeChild(testDiv);
  }, []);
  
  if (!currentUserId) {
    return (
      <>
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          padding: '10px', 
          background: 'yellow', 
          color: 'black',
          zIndex: 9999,
          fontSize: '12px'
        }}>
          CSS Test: If you see this yellow box, inline styles work. Check console for CSS debug info.
        </div>
        <UserSelection />
      </>
    );
  }
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="today" element={<TodayPlan />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="progress" element={<Progress />} />
            <Route path="planner" element={<SmartPlanner />} />
            <Route path="collaboration" element={<Collaboration />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Tutorial 
        isOpen={showTutorial} 
        onClose={handleTutorialClose}
      />
    </ThemeProvider>
  );
}

export default App;