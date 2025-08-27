import React from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Star, Trophy, Zap, Plus } from 'lucide-react';

const UserSelection: React.FC = () => {
  const { users, switchUser } = useStore();
  
  const handleSelectUser = (userId: string) => {
    switchUser(userId);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! ☀️";
    if (hour < 17) return "Good Afternoon! 🌤️";
    return "Good Evening! 🌙";
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur-xl opacity-75 animate-pulse-slow"></div>
              <div className="relative bg-white rounded-3xl p-4">
                <Sparkles className="w-12 h-12 text-primary-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-2">Study Hero</h1>
          <p className="text-xl text-gray-600 font-medium">{getGreeting()}</p>
          <p className="text-lg text-gray-500 mt-2">Who's ready to learn today? 🚀</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50 border-2 border-transparent hover:border-primary-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl group-hover:animate-bounce-slow">{user.avatar}</div>
                <div className="flex gap-2">
                  {user.streak > 0 && (
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                      🔥 {user.streak}
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                    <Zap size={12} />
                    Lvl {user.level}
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <h3 className="text-2xl font-black text-gray-800 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Grade {user.grade}</p>
                
                {user.motivationalQuote && (
                  <p className="text-xs text-primary-600 font-medium italic mb-3">
                    "{user.motivationalQuote}"
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {user.favoriteSubject && (
                      <span className="flex items-center gap-1">
                        <Star size={12} />
                        {user.favoriteSubject}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(user.totalStudyMinutes / 60)}h studied
                  </div>
                </div>
                
                {user.achievements.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {user.achievements.slice(0, 3).map((achievement, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-xs font-medium"
                      >
                        <Trophy size={10} />
                        {achievement}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
          
          <button
            className="group bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center"
          >
            <Plus className="w-12 h-12 text-gray-400 group-hover:text-primary-500 mb-3" />
            <h3 className="text-xl font-bold text-gray-600 group-hover:text-primary-600">Add New Student</h3>
            <p className="text-sm text-gray-500 mt-1">Create a new profile</p>
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            💡 Tip: Each student has their own progress, subjects, and study plans!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;