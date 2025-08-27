import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { generateDailyPlan } from '../utils/prioritization';
import type { DailyTask } from '../types';
import { Clock, Play, Pause, Check, SkipForward, RefreshCw, Flame, Star, Sparkles, Target, Trophy, Zap, Coffee, BookOpen, Calendar, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

const motivationalMessages = [
  "You're crushing it! 💪",
  "Keep going, champion! 🏆",
  "Every minute counts! ⏰",
  "Focus mode: ON! 🎯",
  "You've got this! 🌟",
  "Learning in progress! 🚀",
  "Brain power activated! 🧠",
  "Success loading... 📈"
];

const TodayPlan: React.FC = () => {
  const {
    chapters,
    exams,
    offDays,
    settings,
    currentDate,
    dailyLogs,
    addDailyLog,
    updateDailyTask,
    updateChapterProgress,
  } = useStore();
  
  const [todaysTasks, setTodaysTasks] = useState<DailyTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState(motivationalMessages[0]);
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  const [customHours, setCustomHours] = useState(settings.dailyStudyHours);
  const [focusSubject, setFocusSubject] = useState<string>('all');
  
  const todaysLog = dailyLogs.find((log) => log.date === currentDate);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationalMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPlanOptions) {
        setShowPlanOptions(false);
        setCustomHours(settings.dailyStudyHours);
        setFocusSubject('all');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPlanOptions, settings.dailyStudyHours]);
  
  useEffect(() => {
    if (!todaysLog) {
      const tasks = generateDailyPlan(
        chapters,
        exams,
        offDays,
        currentDate,
        settings.dailyStudyHours,
        settings.studySessionMinutes
      );
      setTodaysTasks(tasks);
      if (tasks.length > 0) {
        addDailyLog({
          date: currentDate,
          tasks,
          totalAllocatedMinutes: tasks.reduce((acc, task) => acc + task.allocatedMinutes, 0),
          totalActualMinutes: 0,
        });
      }
    } else {
      setTodaysTasks(todaysLog.tasks);
    }
  }, [chapters, exams, offDays, currentDate, settings, dailyLogs]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);
  
  const handleStartTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setTimer(0);
    setIsTimerRunning(true);
    if (todaysLog) {
      updateDailyTask(todaysLog.id, taskId, { status: 'in-progress' });
    }
  };
  
  const handlePauseTask = () => {
    setIsTimerRunning(false);
  };
  
  const handleResumeTask = () => {
    setIsTimerRunning(true);
  };
  
  const handleCompleteTask = (taskId: string) => {
    const actualMinutes = Math.floor(timer / 60);
    if (todaysLog) {
      updateDailyTask(todaysLog.id, taskId, {
        status: 'completed',
        actualMinutes,
      });
      const task = todaysTasks.find((t) => t.id === taskId);
      if (task) {
        updateChapterProgress(task.chapterId, actualMinutes / 60);
      }
    }
    setActiveTaskId(null);
    setTimer(0);
    setIsTimerRunning(false);
  };
  
  const handleSkipTask = (taskId: string) => {
    if (todaysLog) {
      updateDailyTask(todaysLog.id, taskId, { status: 'skipped' });
    }
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
      setTimer(0);
      setIsTimerRunning(false);
    }
  };
  
  const regeneratePlan = () => {
    // Filter chapters based on focus subject if selected
    let filteredChapters = chapters;
    if (focusSubject !== 'all') {
      filteredChapters = chapters.filter(ch => ch.subject === focusSubject);
    }
    
    const tasks = generateDailyPlan(
      filteredChapters,
      exams,
      offDays,
      currentDate,
      customHours,
      settings.studySessionMinutes
    );
    
    // Shuffle tasks if user wants variety
    const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);
    
    setTodaysTasks(shuffledTasks);
    if (shuffledTasks.length > 0) {
      addDailyLog({
        date: currentDate,
        tasks: shuffledTasks,
        totalAllocatedMinutes: shuffledTasks.reduce((acc, task) => acc + task.allocatedMinutes, 0),
        totalActualMinutes: 0,
      });
    }
    setShowPlanOptions(false);
    setCustomHours(settings.dailyStudyHours);
    setFocusSubject('all');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-400 to-emerald-500';
      case 'in-progress':
        return 'from-blue-400 to-indigo-500';
      case 'skipped':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-yellow-400 to-orange-500';
    }
  };
  
  const getSubjectEmoji = (subject: string) => {
    const emojis: { [key: string]: string } = {
      'Mathematics': '🔢',
      'Science': '🔬',
      'English': '📖',
      'History': '🏛️',
      'Geography': '🌍',
      'Computer': '💻',
      'Physics': '⚡',
      'Chemistry': '🧪',
      'Biology': '🌿',
      'Art': '🎨',
    };
    return emojis[subject] || '📚';
  };
  
  const totalAllocated = todaysTasks.reduce((acc, task) => acc + task.allocatedMinutes, 0);
  const totalCompleted = todaysTasks
    .filter((t) => t.status === 'completed')
    .reduce((acc, task) => acc + (task.actualMinutes || 0), 0);
  const completionPercentage = totalAllocated > 0 ? Math.round((totalCompleted / totalAllocated) * 100) : 0;
  
  // Get unique subjects from chapters
  const uniqueSubjects = Array.from(new Set(chapters.map(ch => ch.subject)));
  
  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 card-hover">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black gradient-text flex items-center gap-3">
              Today's Mission 
              <Sparkles className="w-8 h-8 text-accent-yellow animate-pulse" />
            </h2>
            <p className="text-gray-600 mt-2 font-medium text-lg">{format(new Date(currentDate), 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-primary-600 font-bold mt-2 animate-pulse-slow">{motivationalMessage}</p>
          </div>
          <button
            onClick={() => setShowPlanOptions(true)}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl hover:shadow-xl transform transition-all duration-300 hover:scale-105 font-bold"
          >
            <RefreshCw className="w-5 h-5 group-hover:animate-spin" />
            New Plan
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-purple-700">Total Time</p>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-900">{Math.floor(totalAllocated / 60)}h {totalAllocated % 60}m</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-5 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-green-700">Completed</p>
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-black text-green-900">{Math.floor(totalCompleted / 60)}h {totalCompleted % 60}m</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-5 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-blue-700">Timer</p>
              <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-blue-900">{formatTime(timer)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-5 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-orange-700">Progress</p>
              <Flame className="w-5 h-5 text-orange-600 animate-bounce-slow" />
            </div>
            <p className="text-3xl font-black text-orange-900">{completionPercentage}%</p>
          </div>
        </div>
        
        {completionPercentage >= 100 && (
          <div className="mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-6 text-center animate-bounce-slow">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-2xl font-black">MISSION COMPLETE! 🎉</h3>
            <p className="mt-2">You're absolutely amazing! Take a well-deserved break!</p>
          </div>
        )}
        
        {todaysTasks.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="max-w-md mx-auto">
              {chapters.length === 0 ? (
                <>
                  <BookOpen className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-float" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Study Hero! 🎆</h3>
                  <p className="text-gray-600 mb-6">Let's set up your personalized study plan to ace those exams!</p>
                  
                  <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Get Started in 2 Minutes:
                    </h4>
                    <div className="text-left space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary-100 text-primary-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Add your subjects and chapters in <strong>Subjects</strong> tab</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-primary-100 text-primary-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Schedule exam dates in <strong>Calendar</strong> tab</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-primary-100 text-primary-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Get your smart daily study plan right here!</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="/subjects" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Add Subjects
                    </a>
                    <a href="/help" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Watch Tutorial
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-float" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">It's a rest day! 🌈</h3>
                  <p className="text-gray-600 mb-4">No study tasks for today. Enjoy your break or create a custom plan!</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setShowPlanOptions(true)}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      🎯 Create Custom Plan
                    </button>
                    <a href="/calendar" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Check Calendar
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysTasks.map((task, index) => (
              <div
                key={task.id}
                className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
                  activeTaskId === task.id 
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 scale-[1.02] shadow-xl' 
                    : 'bg-white hover:shadow-xl hover:scale-[1.01]'
                } ${task.status === 'completed' ? 'opacity-90' : ''}`}
              >
                {task.status === 'completed' && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getSubjectEmoji(task.subject)}</span>
                      <div>
                        <h3 className="font-black text-xl text-gray-800">{task.subject}</h3>
                        <p className="text-gray-600 font-medium">{task.chapterName}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className={`px-4 py-1.5 rounded-full text-white font-bold text-sm bg-gradient-to-r ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <Clock size={16} />
                        {task.allocatedMinutes} min
                      </span>
                      {task.actualMinutes && (
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <Check size={16} />
                          {task.actualMinutes} min done
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-purple-600 font-bold">
                        <Zap size={16} />
                        Priority: {task.priority.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {task.status === 'pending' && activeTaskId !== task.id && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-110"
                      >
                        <Play size={20} />
                      </button>
                    )}
                    
                    {activeTaskId === task.id && isTimerRunning && (
                      <button
                        onClick={handlePauseTask}
                        className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-110"
                      >
                        <Pause size={20} />
                      </button>
                    )}
                    
                    {activeTaskId === task.id && !isTimerRunning && task.status === 'in-progress' && (
                      <button
                        onClick={handleResumeTask}
                        className="p-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-110"
                      >
                        <Play size={20} />
                      </button>
                    )}
                    
                    {activeTaskId === task.id && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-110"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    
                    {task.status !== 'completed' && task.status !== 'skipped' && (
                      <button
                        onClick={() => handleSkipTask(task.id)}
                        className="p-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-110"
                      >
                        <SkipForward size={20} />
                      </button>
                    )}
                  </div>
                </div>
                
                {activeTaskId === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="text-primary-500 animate-pulse" />
                      <span className="font-bold text-primary-600">Study session in progress...</span>
                      <Sparkles className="text-primary-500 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Plan Options Modal */}
      {showPlanOptions && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPlanOptions(false);
              setCustomHours(settings.dailyStudyHours);
              setFocusSubject('all');
            }
          }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100">
            <h3 className="text-2xl font-black gradient-text mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
              Customize Your Study Plan
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Study Hours for Today 🕐
                </label>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent min-w-[80px] text-center">
                      {customHours}h
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={customHours}
                      onChange={(e) => setCustomHours(parseInt(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    <span>1h</span>
                    <span>5h</span>
                    <span>10h</span>
                    <span>15h</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {customHours <= 3 ? '💤 Light day - perfect for review!' :
                   customHours <= 6 ? '⚡ Balanced - great for steady progress!' :
                   customHours <= 9 ? '🔥 Focused - you\'re on fire!' :
                   customHours <= 12 ? '🚀 Intense mode - champion level!' :
                   '💎 ULTIMATE GRIND - legendary dedication!'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Focus on Specific Subject? 📚
                </label>
                <select
                  value={focusSubject}
                  onChange={(e) => setFocusSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none font-medium"
                >
                  <option value="all">🎯 All Subjects (Balanced)</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>
                      {getSubjectEmoji(subject)} {subject} Only
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose a subject to focus on, or keep it balanced!</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-sm font-medium text-purple-700">
                  💡 <strong>Pro Tip:</strong> Mixing subjects helps prevent boredom and improves retention!
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={regeneratePlan}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold hover:shadow-xl transform transition-all hover:scale-105"
                >
                  Generate Plan 🚀
                </button>
                <button
                  onClick={() => {
                    setShowPlanOptions(false);
                    setCustomHours(settings.dailyStudyHours);
                    setFocusSubject('all');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayPlan;