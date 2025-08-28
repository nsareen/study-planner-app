import React from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp,
  Calendar,
  BookOpen,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Timer
} from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import type { Chapter, ChapterAssignment, Exam, ActivitySession, DailyLog } from '../types';

interface DetailedAnalyticsProps {
  chapters: Chapter[];
  assignments: ChapterAssignment[];
  exams: Exam[];
  activitySessions: ActivitySession[];
  dailyLogs: DailyLog[];
  currentStreak: number;
  level: number;
}

const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({
  chapters,
  assignments,
  exams,
  activitySessions,
  dailyLogs,
  currentStreak,
  level
}) => {
  // Calculate comprehensive metrics
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => 
    c.studyStatus === 'done' && c.revisionStatus === 'done'
  ).length;
  const inProgressChapters = chapters.filter(c =>
    c.studyStatus === 'in-progress' || c.revisionStatus === 'in-progress'
  ).length;
  const notStartedChapters = chapters.filter(c =>
    c.studyStatus === 'not-done' && c.revisionStatus === 'not-done'
  ).length;

  // Subject-wise breakdown
  const subjectStats = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        plannedHours: 0,
        actualHours: 0,
        efficiency: 0
      };
    }
    acc[chapter.subject].total++;
    if (chapter.studyStatus === 'done' && chapter.revisionStatus === 'done') {
      acc[chapter.subject].completed++;
    } else if (chapter.studyStatus === 'in-progress' || chapter.revisionStatus === 'in-progress') {
      acc[chapter.subject].inProgress++;
    }
    acc[chapter.subject].plannedHours += (chapter.studyHours + chapter.revisionHours);
    acc[chapter.subject].actualHours += (chapter.actualStudyHours || 0) + (chapter.actualRevisionHours || 0);
    return acc;
  }, {} as Record<string, any>);

  // Calculate efficiency for each subject
  Object.keys(subjectStats).forEach(subject => {
    const stat = subjectStats[subject];
    if (stat.actualHours > 0 && stat.plannedHours > 0) {
      stat.efficiency = Math.round((stat.plannedHours / stat.actualHours) * 100);
    }
  });

  // Time analysis
  const totalPlannedHours = assignments.reduce((sum, a) => sum + (a.plannedMinutes / 60), 0);
  const totalActualHours = activitySessions.reduce((sum, s) => {
    const duration = s.endTime ? 
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60) : 0;
    return sum + duration;
  }, 0);

  // Weekly pattern analysis
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyPattern = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayAssignments = assignments.filter(a => a.date === dayStr);
    const daySessions = activitySessions.filter(s => 
      s.startTime && format(parseISO(s.startTime), 'yyyy-MM-dd') === dayStr
    );
    
    const plannedHours = dayAssignments.reduce((sum, a) => sum + (a.plannedMinutes / 60), 0);
    const actualHours = daySessions.reduce((sum, s) => {
      const duration = s.endTime ? 
        (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60) : 0;
      return sum + duration;
    }, 0);
    
    return {
      day: format(day, 'EEE'),
      date: dayStr,
      planned: plannedHours,
      actual: actualHours,
      completed: dayAssignments.filter(a => a.status === 'completed').length,
      total: dayAssignments.length
    };
  });

  // Peak performance times
  const sessionsByHour = activitySessions
    .filter(s => s.startTime)
    .reduce((acc, session) => {
      const hour = new Date(session.startTime).getHours();
      if (!acc[hour]) acc[hour] = { count: 0, totalMinutes: 0 };
      acc[hour].count++;
      if (session.endTime) {
        const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
        acc[hour].totalMinutes += duration;
      }
      return acc;
    }, {} as Record<number, { count: number; totalMinutes: number }>);

  const peakHours = Object.entries(sessionsByHour)
    .sort(([, a], [, b]) => b.totalMinutes - a.totalMinutes)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // Exam preparedness
  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const examReadiness = upcomingExams.map(exam => {
    const examChapters = chapters.filter(c => 
      exam.subjects.includes(c.subject)
    );
    const completedCount = examChapters.filter(c => 
      c.studyStatus === 'done' && c.revisionStatus === 'done'
    ).length;
    const readinessPercent = examChapters.length > 0 ? 
      Math.round((completedCount / examChapters.length) * 100) : 0;
    
    return {
      exam,
      totalChapters: examChapters.length,
      completed: completedCount,
      readiness: readinessPercent,
      daysLeft: differenceInDays(new Date(exam.date), new Date())
    };
  });

  // Completion rate trends
  const last7DaysCompletion = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAssignments = assignments.filter(a => a.date === dateStr);
    const completed = dayAssignments.filter(a => a.status === 'completed').length;
    return {
      date: format(date, 'MMM d'),
      rate: dayAssignments.length > 0 ? Math.round((completed / dayAssignments.length) * 100) : 0
    };
  }).reverse();

  // Problematic chapters (taking longer than planned)
  const problematicChapters = chapters
    .filter(c => {
      const actualTotal = (c.actualStudyHours || 0) + (c.actualRevisionHours || 0);
      const plannedTotal = c.studyHours + c.revisionHours;
      return actualTotal > plannedTotal * 1.5; // 50% over planned time
    })
    .sort((a, b) => {
      const aRatio = ((a.actualStudyHours || 0) + (a.actualRevisionHours || 0)) / (a.studyHours + a.revisionHours);
      const bRatio = ((b.actualStudyHours || 0) + (b.actualRevisionHours || 0)) / (b.studyHours + b.revisionHours);
      return bRatio - aRatio;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      {/* Header with Parent Mode Indicator */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Detailed Analytics Dashboard</h2>
            <p className="text-indigo-100">Parent Mode - Comprehensive Performance Metrics</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-sm font-medium">📊 Advanced View</span>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500">Overall</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{completedChapters}/{totalChapters}</div>
          <div className="text-sm text-gray-600">Chapters Complete</div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500">Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalActualHours.toFixed(1)}h</div>
          <div className="text-sm text-gray-600">Total Study Time</div>
          <div className="text-xs text-gray-500 mt-1">
            Planned: {totalPlannedHours.toFixed(1)}h
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-gray-500">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalActualHours > 0 ? Math.round((totalPlannedHours / totalActualHours) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Time Efficiency</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalActualHours > totalPlannedHours ? 'Taking longer' : 'On track'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xs text-gray-500">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{currentStreak} days</div>
          <div className="text-sm text-gray-600">Study Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            Level {level}
          </div>
        </div>
      </div>

      {/* Subject Performance Matrix */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          Subject-wise Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Hours</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Hours</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(subjectStats).map(([subject, stats]) => (
                <tr key={subject}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {Math.round((stats.completed / stats.total) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {stats.completed}/{stats.total}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {stats.inProgress}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {stats.plannedHours.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">
                    {stats.actualHours.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stats.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                      stats.efficiency >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stats.efficiency || 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Study Pattern */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Weekly Study Pattern
        </h3>
        <div className="space-y-3">
          {weeklyPattern.map(day => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((day.planned / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {day.planned.toFixed(1)}h plan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.min((day.actual / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">
                    {day.actual.toFixed(1)}h actual
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {day.total > 0 ? `${day.completed}/${day.total}` : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Performance Hours */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-500" />
          Peak Study Hours
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Most productive times:</div>
          {peakHours.map(hour => (
            <div key={hour} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {hour}:00 - {hour + 1}:00
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on completed study sessions
        </p>
      </div>

      {/* Exam Readiness */}
      {examReadiness.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Exam Readiness Assessment
          </h3>
          <div className="space-y-3">
            {examReadiness.map(({ exam, totalChapters, completed, readiness, daysLeft }) => (
              <div key={exam.id} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{exam.name}</div>
                    <div className="text-xs text-gray-500">
                      {exam.subjects.join(', ')} • {daysLeft} days left
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    readiness >= 80 ? 'text-green-600' :
                    readiness >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {readiness}% Ready
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        readiness >= 80 ? 'bg-green-500' :
                        readiness >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {completed}/{totalChapters} chapters
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problematic Chapters Alert */}
      {problematicChapters.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            Attention Needed - Difficult Chapters
          </h3>
          <p className="text-sm text-red-700 mb-3">
            These chapters are taking significantly longer than planned:
          </p>
          <div className="space-y-2">
            {problematicChapters.map(chapter => {
              const actualTotal = (chapter.actualStudyHours || 0) + (chapter.actualRevisionHours || 0);
              const plannedTotal = chapter.studyHours + chapter.revisionHours;
              const overTime = ((actualTotal / plannedTotal - 1) * 100).toFixed(0);
              
              return (
                <div key={chapter.id} className="bg-white rounded p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{chapter.name}</div>
                      <div className="text-xs text-gray-600">{chapter.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        +{overTime}% over time
                      </div>
                      <div className="text-xs text-gray-500">
                        {actualTotal.toFixed(1)}h / {plannedTotal.toFixed(1)}h planned
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-800 font-medium">💡 Recommendations:</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Consider breaking down complex chapters into smaller parts</li>
              <li>• Schedule extra revision time for these topics</li>
              <li>• Seek additional help or resources for difficult concepts</li>
            </ul>
          </div>
        </div>
      )}

      {/* Completion Rate Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          7-Day Completion Rate Trend
        </h3>
        <div className="flex items-end gap-2 h-32">
          {last7DaysCompletion.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t flex-1 relative">
                <div 
                  className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${
                    day.rate >= 80 ? 'bg-green-500' :
                    day.rate >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ height: `${day.rate}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">{day.date}</div>
              <div className="text-xs font-medium">{day.rate}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-bold mb-3 text-purple-900">📊 Key Insights & Recommendations</h3>
        <div className="space-y-2">
          {totalActualHours > totalPlannedHours * 1.2 && (
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Time Management Alert</p>
                <p className="text-xs text-gray-600">
                  Student is taking {Math.round((totalActualHours / totalPlannedHours - 1) * 100)}% more time than planned. 
                  Consider adjusting study techniques or seeking additional support.
                </p>
              </div>
            </div>
          )}
          
          {currentStreak >= 7 && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Excellent Consistency!</p>
                <p className="text-xs text-gray-600">
                  {currentStreak} day streak shows great discipline. Keep encouraging this behavior!
                </p>
              </div>
            </div>
          )}
          
          {examReadiness.some(e => e.readiness < 50 && e.daysLeft < 7) && (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Exam Preparation Warning</p>
                <p className="text-xs text-gray-600">
                  Some upcoming exams have low readiness scores. Consider prioritizing these subjects immediately.
                </p>
              </div>
            </div>
          )}

          {peakHours.length > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">Optimal Study Times Identified</p>
                <p className="text-xs text-gray-600">
                  Student performs best during {peakHours.map(h => `${h}:00`).join(', ')}. 
                  Schedule important topics during these hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;