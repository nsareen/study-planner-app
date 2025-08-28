import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Play, Pause, Check, Calendar, Target, Trophy, Zap, BookOpen } from 'lucide-react';
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
    chapterAssignments,
    activitySessions,
    startActivity,
    pauseActivity,
    resumeActivity,
    completeActivity,
    getActiveSession
  } = useStore();
  
  const [timer, setTimer] = useState<{ [key: string]: number }>({});
  const [motivationalMessage, setMotivationalMessage] = useState(motivationalMessages[0]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Get only today's scheduled assignments
  const todaysAssignments = chapterAssignments.filter(a => a.date === todayStr);
  const activeSession = getActiveSession();
  
  // Calculate overall progress
  const totalTasks = todaysAssignments.length;
  const completedTasks = todaysAssignments.filter(a => a.status === 'completed').length;
  const inProgressTasks = todaysAssignments.filter(a => a.status === 'in-progress').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalPlannedMinutes = todaysAssignments.reduce((sum, a) => sum + a.plannedMinutes, 0);
  const totalActualMinutes = todaysAssignments.reduce((sum, a) => sum + (a.actualMinutes || 0), 0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationalMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Timer effect for active sessions
  useEffect(() => {
    if (!activeSession) return;
    
    // Calculate total paused time
    const calculateElapsedTime = () => {
      // Calculate total time from completed pause intervals
      const completedPausedMs = activeSession.pausedIntervals
        .filter(interval => interval.resumedAt)
        .reduce((total, interval) => {
          return total + (new Date(interval.resumedAt!).getTime() - new Date(interval.pausedAt).getTime());
        }, 0);
      
      let activeTime;
      if (activeSession.isActive) {
        // Currently running - calculate time up to now minus pauses
        activeTime = Date.now() - new Date(activeSession.startTime).getTime() - completedPausedMs;
      } else {
        // Currently paused - calculate time up to when it was paused
        const currentPause = activeSession.pausedIntervals[activeSession.pausedIntervals.length - 1];
        if (currentPause && !currentPause.resumedAt) {
          // Use the pause time as the end point
          activeTime = new Date(currentPause.pausedAt).getTime() - new Date(activeSession.startTime).getTime() - completedPausedMs;
        } else {
          // Fallback - shouldn't happen
          activeTime = 0;
        }
      }
      
      return Math.floor(Math.max(0, activeTime) / 1000);
    };
    
    // Set initial time immediately
    const elapsed = calculateElapsedTime();
    setTimer(prev => ({ ...prev, [activeSession.assignmentId]: elapsed }));
    
    // Only update timer if running
    if (activeSession.isActive) {
      const interval = setInterval(() => {
        const elapsed = calculateElapsedTime();
        setTimer(prev => ({ ...prev, [activeSession.assignmentId]: elapsed }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeSession]);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };
  
  const handleStartActivity = (assignmentId: string) => {
    // Don't start if there's already an active session
    if (activeSession) {
      alert('Please complete or pause the current activity before starting a new one.');
      return;
    }
    startActivity(assignmentId);
    setTimer(prev => ({ ...prev, [assignmentId]: 0 }));
  };
  
  const handleCompleteActivity = (assignmentId: string) => {
    if (!activeSession || activeSession.assignmentId !== assignmentId) return;
    
    const elapsedMinutes = Math.floor((timer[assignmentId] || 0) / 60);
    const confirmMessage = `Are you sure you want to complete this task?\n\nTime spent: ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
    
    if (window.confirm(confirmMessage)) {
      completeActivity(activeSession.sessionId, elapsedMinutes);
      setTimer(prev => {
        const newTimer = { ...prev };
        delete newTimer[assignmentId];
        return newTimer;
      });
    }
  };
  
  const getChapterForAssignment = (assignment: typeof todaysAssignments[0]) => {
    return chapters.find(c => c.id === assignment.chapterId);
  };
  
  const getPriorityLabel = (priority: number) => {
    if (priority >= 0.8) return { text: 'High', color: 'text-red-600 bg-red-100' };
    if (priority >= 0.5) return { text: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Low', color: 'text-green-600 bg-green-100' };
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                Today's Mission <Target className="w-8 h-8 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-purple-600 font-medium animate-fade-in mt-1">{motivationalMessage}</p>
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 font-semibold">Total Time</span>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-800">
                {Math.floor(totalPlannedMinutes / 60)}h {totalPlannedMinutes % 60}m
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 font-semibold">Completed</span>
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-800">
                {Math.floor(totalActualMinutes / 60)}h {totalActualMinutes % 60}m
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-semibold">Timer</span>
                <Clock className="w-5 h-5 text-blue-500 animate-spin-slow" />
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {activeSession ? formatTime(timer[activeSession.assignmentId] || 0) : '00:00'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-600 font-semibold">Progress</span>
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-800">{progressPercentage}%</div>
            </div>
          </div>
        </div>
        
        {/* Tasks List */}
        <div className="space-y-4">
          {todaysAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Activities Scheduled for Today</h2>
              <p className="text-gray-600 mb-4">
                You haven't scheduled any chapters for today yet.
              </p>
              <p className="text-sm text-gray-500">
                Go to the <span className="font-semibold">Plan</span> page to schedule chapters for today.
              </p>
            </div>
          ) : (
            <>
              {/* Active Task Highlight */}
              {activeSession && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Currently Working On</p>
                      <h3 className="text-2xl font-bold">
                        {(() => {
                          const assignment = todaysAssignments.find(a => a.id === activeSession.assignmentId);
                          return assignment ? getChapterForAssignment(assignment)?.name : 'Activity';
                        })() || 'Activity'}
                      </h3>
                    </div>
                    <div className="text-4xl font-mono font-bold">
                      {formatTime(timer[activeSession.assignmentId] || 0)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Task Cards */}
              {todaysAssignments.map((assignment) => {
                const chapter = getChapterForAssignment(assignment);
                const priorityInfo = getPriorityLabel(0.5); // Default medium priority
                const isActive = activeSession?.assignmentId === assignment.id && activeSession?.isActive;
                const isPaused = activeSession?.assignmentId === assignment.id && !activeSession?.isActive;
                const taskTimer = timer[assignment.id] || 0;
                
                if (!chapter) return null;
                
                return (
                  <div
                    key={assignment.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                      isActive ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                    } ${assignment.status === 'completed' ? 'opacity-75' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            <h3 className="text-xl font-bold text-gray-800">{chapter.subject}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              assignment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              isActive ? 'bg-blue-100 text-blue-700' :
                              isPaused ? 'bg-yellow-100 text-yellow-700' :
                              assignment.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {assignment.status === 'completed' ? 'COMPLETED' :
                               isActive ? 'IN PROGRESS' :
                               isPaused ? 'PAUSED' :
                               assignment.status === 'in-progress' ? 'IN PROGRESS' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{chapter.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 font-medium">
                              {Math.floor(assignment.plannedMinutes / 60) > 0 && `${Math.floor(assignment.plannedMinutes / 60)}h `}
                              {assignment.plannedMinutes % 60}min
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityInfo.color}`}>
                            Priority: {priorityInfo.text}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {!isActive && !isPaused && assignment.status !== 'completed' && assignment.status !== 'in-progress' && (
                            <button
                              onClick={() => handleStartActivity(assignment.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Play size={16} />
                              Start
                            </button>
                          )}
                          
                          {isActive && activeSession?.isActive && (
                            <button
                              onClick={() => pauseActivity(activeSession.sessionId)}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              <Pause size={16} />
                              Pause
                            </button>
                          )}
                          
                          {isPaused && activeSession && (
                            <button
                              onClick={() => resumeActivity(activeSession.sessionId)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Play size={16} />
                              Resume
                            </button>
                          ))
                          
                          {isActive && (
                            <button
                              onClick={() => handleCompleteActivity(assignment.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              <Check size={16} />
                              Complete
                            </button>
                          )}
                        </div>
                        
                        {isActive && (
                          <div className="text-2xl font-mono font-bold text-purple-600">
                            {formatTime(taskTimer)}
                          </div>
                        )}
                        
                        {assignment.status === 'completed' && assignment.actualMinutes && (
                          <div className="text-sm text-gray-600">
                            Completed in {Math.floor(assignment.actualMinutes / 60)}h {assignment.actualMinutes % 60}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Progress Celebration */}
              {progressPercentage === 100 && (
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-xl p-8 text-white text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold mb-2">Mission Complete! 🎉</h2>
                  <p className="text-lg">You've completed all your tasks for today. Great job!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayPlan;