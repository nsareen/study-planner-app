import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, TrendingUp, Settings, Sparkles, Target, Trophy, Zap, LogOut, Users, HelpCircle, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getTheme } from '../utils/themes';
import Tutorial from './Tutorial';
import SyncIndicator from './SyncIndicator';

const Layout: React.FC = () => {
  const { getCurrentUser, logoutUser, settings } = useStore();
  const currentUser = getCurrentUser();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(getTheme(settings.colorTheme || 'default'));
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    setCurrentTheme(getTheme(settings.colorTheme || 'default'));
  }, [settings.colorTheme]);
  
  const navItems = [
    { to: '/today', icon: Target, label: 'Today', emoji: '🎯', highlight: true },
    { to: '/subjects', icon: BookOpen, label: 'Chapters', emoji: '📚' },
    { to: '/calendar', icon: Calendar, label: 'Exams', emoji: '📅' },
    { to: '/planner', icon: Brain, label: 'Plan', emoji: '📝' },
    { to: '/progress', icon: Trophy, label: 'Progress', emoji: '🏆' },
    { to: '/collaboration', icon: Users, label: 'Friends', emoji: '👥' },
    { to: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradients.background}`}>
      <div className="backdrop-blur-sm bg-white/10 min-h-screen">
        <header className="glass-effect shadow-xl border-b border-white/20">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between gap-2 h-20">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="relative hidden sm:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-lg opacity-75 animate-pulse-slow"></div>
                  <div className="relative bg-white rounded-xl p-2">
                    <Sparkles className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black gradient-text whitespace-nowrap">Study Hero</h1>
                  <p className="text-xs text-purple-700 font-medium hidden sm:block truncate">
                    {currentUser ? `Welcome back, ${currentUser.name}! 🚀` : 'Level up your learning! 🚀'}
                  </p>
                </div>
              </div>
              
              <nav className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center px-2 overflow-x-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap ${
                        item.highlight && !isActive
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300 hover:shadow-lg animate-pulse-slow'
                          : isActive
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:shadow-md'
                      }`
                    }
                  >
                    <span className="text-sm sm:text-base">{item.emoji}</span>
                    <span className="hidden md:inline text-xs">{item.label}</span>
                    {item.highlight && !location.pathname.includes('planner') && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </NavLink>
                ))}
              </nav>
              
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                {currentUser && (
                  <>
                    <div className="flex items-center bg-white/90 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-md min-w-0">
                      <span className="text-lg sm:text-xl mr-1 sm:mr-2">{currentUser.avatar}</span>
                      <div className="hidden sm:block min-w-0">
                        <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-600">Grade {currentUser.grade}</p>
                      </div>
                    </div>
                    <div className="hidden xl:flex items-center bg-white/90 rounded-xl px-2 py-1.5 shadow-md">
                      <Trophy className="w-3 h-3 text-accent-yellow mr-1" />
                      <span className="font-semibold text-gray-800 text-xs">🔥 {currentUser.streak}</span>
                    </div>
                    <div className="hidden lg:flex items-center bg-gradient-to-r from-accent-green to-secondary-500 text-white rounded-xl px-2 py-1.5 shadow-md">
                      <Zap className="w-3 h-3 mr-1" />
                      <span className="font-semibold text-xs">Lvl {currentUser.level}</span>
                    </div>
                    <button
                      onClick={logoutUser}
                      className="p-1.5 sm:p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Switch User"
                    >
                      <LogOut size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
        
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 animate-float">
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform"
            title="Show Tutorial"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full p-4 shadow-2xl cursor-pointer hover:scale-110 transition-transform">
            <Target className="w-6 h-6" />
          </div>
        </div>
        
        <Tutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)}
        />
        
        {/* Data Sync Indicator */}
        <SyncIndicator />
      </div>
    </div>
  );
};

export default Layout;