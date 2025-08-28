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
  
  if (!currentUserId) {
    return <UserSelection />;
  }
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/today" replace />} />
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