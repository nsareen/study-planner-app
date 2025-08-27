import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, TrendingUp, Settings, Sparkles, Target, Trophy, Zap, LogOut, Users, HelpCircle, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getTheme } from '../utils/themes';
import Tutorial from './Tutorial';

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
    { to: '/', icon: Home, label: 'Dashboard', emoji: '🏠' },
    { to: '/planner', icon: Brain, label: 'Smart Plan', emoji: '🧠', highlight: true },
    { to: '/calendar', icon: Calendar, label: 'Exams', emoji: '📅' },
    { to: '/subjects', icon: BookOpen, label: 'Chapters', emoji: '📚' },
    { to: '/progress', icon: TrendingUp, label: 'Progress', emoji: '📈' },
    { to: '/collaboration', icon: Users, label: 'Collab', emoji: '👥' },
    { to: '/today', icon: Target, label: 'Today', emoji: '🎯' },
    { to: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradients.background}`}>
      <div className="backdrop-blur-sm bg-white/10 min-h-screen">
        <header className="glass-effect shadow-xl border-b border-white/20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 h-20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-75 animate-pulse-slow"></div>
                  <div className="relative bg-white rounded-2xl p-3">
                    <Sparkles className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black gradient-text">Study Hero</h1>
                  <p className="text-xs text-purple-700 font-medium">
                    {currentUser ? `Welcome back, ${currentUser.name}! 🚀` : 'Level up your learning! 🚀'}
                  </p>
                </div>
              </div>
              
              <nav className="flex items-center gap-1 flex-1 justify-center max-w-3xl">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        item.highlight && !isActive
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-300 hover:shadow-lg animate-pulse-slow'
                          : isActive
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:shadow-md'
                      }`
                    }
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="hidden lg:inline text-xs">{item.label}</span>
                    {item.highlight && !location.pathname.includes('planner') && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </NavLink>
                ))}
              </nav>
              
              <div className="flex items-center gap-2">
                {currentUser && (
                  <>
                    <div className="flex items-center bg-white/90 rounded-xl px-3 py-1.5 shadow-md">
                      <span className="text-xl mr-2">{currentUser.avatar}</span>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{currentUser.name}</p>
                        <p className="text-xs text-gray-600">Grade {currentUser.grade}</p>
                      </div>
                    </div>
                    <div className="hidden xl:flex items-center bg-white/90 rounded-xl px-3 py-2 shadow-md">
                      <Trophy className="w-4 h-4 text-accent-yellow mr-1.5" />
                      <span className="font-semibold text-gray-800 text-sm">🔥 {currentUser.streak}</span>
                    </div>
                    <div className="hidden lg:flex items-center bg-gradient-to-r from-accent-green to-secondary-500 text-white rounded-xl px-3 py-2 shadow-md">
                      <Zap className="w-4 h-4 mr-1" />
                      <span className="font-semibold text-sm">Lvl {currentUser.level}</span>
                    </div>
                    <button
                      onClick={logoutUser}
                      className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Switch User"
                    >
                      <LogOut size={16} />
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
      </div>
    </div>
  );
};

export default Layout;