import React from 'react';
import { 
  Trophy, 
  Target, 
  Sparkles, 
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  Zap
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { Chapter, ChapterAssignment, Exam } from '../types';

interface SimpleAnalyticsProps {
  chapters: Chapter[];
  assignments: ChapterAssignment[];
  exams: Exam[];
  currentStreak: number;
  level: number;
}

const SimpleAnalytics: React.FC<SimpleAnalyticsProps> = ({
  chapters,
  assignments,
  exams,
  currentStreak = 0,
  level = 1
}) => {
  // Calculate simple metrics
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => 
    c.studyStatus === 'done' || c.revisionStatus === 'done'
  ).length;
  const progressPercentage = totalChapters > 0 ? 
    Math.round((completedChapters / totalChapters) * 100) : 0;

  // Get next exam
  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = upcomingExams[0];
  const daysToExam = nextExam ? 
    differenceInDays(new Date(nextExam.date), new Date()) : null;

  // Today's scheduled hours
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAssignments = assignments.filter(a => a.date === todayStr);
  const todayHours = todayAssignments.reduce((sum, a) => 
    sum + (a.plannedMinutes / 60), 0
  );

  // This week's progress
  const thisWeekCompleted = assignments.filter(a => {
    const assignmentDate = new Date(a.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return assignmentDate >= weekAgo && a.status === 'completed';
  });
  
  // Calculate pace (actual vs planned time)
  const completedToday = assignments.filter(a => 
    a.date === todayStr && a.status === 'completed'
  );
  
  const todayActualHours = completedToday.reduce((sum, a) => 
    sum + (a.actualMinutes || 0) / 60, 0
  );
  
  const todayPlannedHours = completedToday.reduce((sum, a) => 
    sum + a.plannedMinutes / 60, 0
  );
  
  // Calculate if on track, ahead, or behind
  const getPaceStatus = () => {
    if (completedToday.length === 0) return null;
    const ratio = todayActualHours / todayPlannedHours;
    if (ratio <= 1.1) return 'onTrack';
    if (ratio <= 1.3) return 'slightlyBehind';
    return 'behind';
  };
  
  const paceStatus = getPaceStatus();
  
  // Get recent completed activities with time comparison
  const recentCompleted = assignments
    .filter(a => a.status === 'completed' && a.actualMinutes)
    .sort((a, b) => new Date(b.completedAt || b.date).getTime() - new Date(a.completedAt || a.date).getTime())
    .slice(0, 3);

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "Let's get started! 🚀";
    if (progressPercentage < 25) return "Great beginning! Keep going! 💪";
    if (progressPercentage < 50) return "You're doing awesome! 🌟";
    if (progressPercentage < 75) return "Amazing progress! Almost there! 🎯";
    if (progressPercentage < 100) return "So close to finishing! You got this! 🏆";
    return "Champion! All done! 🎉";
  };

  // Visual progress bar component
  const ProgressBar = ({ value, max, color = "blue" }: { value: number; max: number; color?: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const gradients = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      yellow: 'from-yellow-400 to-yellow-600'
    };
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${gradients[color as keyof typeof gradients]} transition-all duration-500 flex items-center justify-center`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        >
          {percentage > 20 && (
            <span className="text-[10px] text-white font-bold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero Card - Main Progress */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Progress</h2>
            <p className="text-white/80 text-lg">{getMotivationalMessage()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{completedChapters}/{totalChapters}</div>
            <div className="text-sm text-white/80">chapters done</div>
          </div>
        </div>
        <ProgressBar value={completedChapters} max={totalChapters} color="blue" />
      </div>

      {/* Today's Focus */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold">Today's Mission</h3>
        </div>
        
        {todayAssignments.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{todayAssignments.length} activities</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {todayHours.toFixed(1)}h
              </span>
            </div>
            <div className="text-sm text-gray-600 text-center">
              You can do this! 💪
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No activities scheduled for today</p>
            <p className="text-sm mt-1">Time to plan your day! 📅</p>
          </div>
        )}
      </div>

      {/* Exam Countdown - Only if exam exists */}
      {nextExam && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold">Next Exam</h3>
              </div>
              <p className="text-xl font-bold">{nextExam.name}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{daysToExam}</div>
              <div className="text-sm">days left</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak */}
        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Study Streak</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </div>
          {currentStreak >= 3 && (
            <div className="text-xs text-yellow-700 mt-1">🔥 You're on fire!</div>
          )}
        </div>

        {/* Level */}
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Your Level</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            Level {level}
          </div>
          <div className="flex gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Your Pace - Time Reality Check */}
      {(completedToday.length > 0 || recentCompleted.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold">Your Speed Check</h3>
          </div>
          
          {/* Today's Pace Status */}
          {paceStatus && (
            <div className={`p-4 rounded-lg mb-4 ${
              paceStatus === 'onTrack' ? 'bg-green-50 border-2 border-green-200' :
              paceStatus === 'slightlyBehind' ? 'bg-yellow-50 border-2 border-yellow-200' :
              'bg-orange-50 border-2 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${
                    paceStatus === 'onTrack' ? 'text-green-800' :
                    paceStatus === 'slightlyBehind' ? 'text-yellow-800' :
                    'text-orange-800'
                  }`}>
                    {paceStatus === 'onTrack' ? '✅ Perfect pace! Keep it up!' :
                     paceStatus === 'slightlyBehind' ? '⏰ Running a bit slow - pick up the pace!' :
                     '🏃 Time to speed up! You can do it!'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Planned: {todayPlannedHours.toFixed(1)}h | 
                    Actual: {todayActualHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Recent Activities Time Comparison */}
          {recentCompleted.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Recent Activities:</p>
              {recentCompleted.map((assignment, idx) => {
                const chapter = chapters.find(c => c.id === assignment.chapterId);
                const timeDiff = ((assignment.actualMinutes || 0) - assignment.plannedMinutes) / 60;
                const isOnTime = Math.abs(timeDiff) <= 0.25; // Within 15 minutes
                
                return (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{chapter?.name || 'Activity'}</p>
                      <p className="text-xs text-gray-600">{chapter?.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        isOnTime ? 'text-green-600' :
                        timeDiff > 0 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {(assignment.actualMinutes || 0) / 60}h
                        {isOnTime ? ' ✓' : timeDiff > 0 ? ' 🐢' : ' 🚀'}
                      </div>
                      <div className="text-xs text-gray-500">
                        planned: {(assignment.plannedMinutes / 60).toFixed(1)}h
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Speed Tips */}
              {paceStatus === 'behind' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-1">💡 Speed Tips:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Try 25-min focused sessions (Pomodoro)</li>
                    <li>• Remove distractions (phone, tabs)</li>
                    <li>• Take short 5-min breaks only</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Weekly Achievement */}
      {thisWeekCompleted.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">This week</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {thisWeekCompleted.length} completed! ✨
            </div>
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            Keep up the great work! You're doing amazing!
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalytics;