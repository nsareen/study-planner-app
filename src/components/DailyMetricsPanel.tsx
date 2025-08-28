import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Award,
  Calendar,
  BookOpen,
  Timer,
  Zap
} from 'lucide-react';
import type { Chapter, PlannerTask, PlannerDay } from '../types';
import { format, isToday, startOfDay } from 'date-fns';

interface DailyMetricsPanelProps {
  chapters: Chapter[];
  plannerDays: PlannerDay[];
  compact?: boolean;
}

const DailyMetricsPanel: React.FC<DailyMetricsPanelProps> = ({ 
  chapters, 
  plannerDays,
  compact = false
}) => {
  const metrics = useMemo(() => {
    const today = startOfDay(new Date());
    const todayPlan = plannerDays.find(day => 
      isToday(new Date(day.date))
    );
    
    const todayTasks = todayPlan?.plannedTasks || [];
    
    // Get unique chapter IDs from today's tasks
    const todayChapterIds = [...new Set(todayTasks.map(t => t.chapterId))];
    const todayChapters = chapters.filter(c => todayChapterIds.includes(c.id));
    
    // Calculate task metrics
    const studyTasks = todayTasks.filter(t => t.taskType === 'study');
    const revisionTasks = todayTasks.filter(t => t.taskType === 'revision');
    
    // Calculate completion metrics
    const completedStudy = studyTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      return chapter?.studyStatus === 'done';
    }).length;
    
    const completedRevision = revisionTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      return chapter?.revisionStatus === 'done';
    }).length;
    
    const inProgressStudy = studyTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      return chapter?.studyStatus === 'in-progress';
    }).length;
    
    const inProgressRevision = revisionTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      return chapter?.revisionStatus === 'in-progress';
    }).length;
    
    // Calculate time metrics
    const plannedStudyMinutes = studyTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
    const plannedRevisionMinutes = revisionTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
    
    const actualStudyMinutes = todayChapters.reduce((sum, c) => 
      sum + (c.actualStudyHours || 0) * 60, 0
    );
    
    const actualRevisionMinutes = todayChapters.reduce((sum, c) => 
      sum + (c.actualRevisionHours || 0) * 60, 0
    );
    
    // Calculate efficiency
    const totalPlannedMinutes = plannedStudyMinutes + plannedRevisionMinutes;
    const totalActualMinutes = actualStudyMinutes + actualRevisionMinutes;
    const efficiency = totalPlannedMinutes > 0 
      ? (totalActualMinutes / totalPlannedMinutes) * 100 
      : 0;
    
    // Calculate completion percentage
    const totalTasks = todayTasks.length;
    const completedTasks = completedStudy + completedRevision;
    const completionRate = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0;
    
    // Get unique subjects for today
    const todaySubjects = [...new Set(todayChapters.map(c => c.subject))];
    
    return {
      totalTasks,
      studyTasks: studyTasks.length,
      revisionTasks: revisionTasks.length,
      completedTasks,
      completedStudy,
      completedRevision,
      inProgressTasks: inProgressStudy + inProgressRevision,
      plannedStudyMinutes,
      plannedRevisionMinutes,
      actualStudyMinutes,
      actualRevisionMinutes,
      totalPlannedMinutes,
      totalActualMinutes,
      efficiency,
      completionRate,
      todaySubjects,
      remainingTasks: totalTasks - completedTasks - (inProgressStudy + inProgressRevision),
      inProgressStudy,
      inProgressRevision
    };
  }, [chapters, plannerDays]);

  const getPerformanceLabel = (efficiency: number) => {
    if (efficiency === 0) return { text: 'Not Started', color: 'gray', icon: Clock };
    if (efficiency < 80) return { text: 'Ahead of Schedule', color: 'green', icon: Zap };
    if (efficiency <= 120) return { text: 'On Track', color: 'blue', icon: Activity };
    return { text: 'Taking Time', color: 'orange', icon: Timer };
  };

  const performance = getPerformanceLabel(metrics.efficiency);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (compact) {
    // Compact view for embedding in other components
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Today's Metrics</h3>
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-purple-700">
              {metrics.completedTasks}/{metrics.totalTasks}
            </div>
            <div className="text-xs text-gray-600">Tasks Complete</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {metrics.efficiency.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className={`flex items-center gap-2 text-${performance.color}-700`}>
            <performance.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{performance.text}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Today's Dashboard</h2>
          <p className="text-gray-600 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-${performance.color}-50`}>
          <performance.icon className={`w-5 h-5 text-${performance.color}-600`} />
          <span className={`font-semibold text-${performance.color}-700`}>{performance.text}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Tasks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {metrics.completedTasks}/{metrics.totalTasks}
            </span>
          </div>
          <div className="text-sm text-blue-700 font-medium">Tasks Complete</div>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-bold text-purple-900">
              {formatMinutes(metrics.actualStudyMinutes)}
            </span>
          </div>
          <div className="text-sm text-purple-700 font-medium">Study Time</div>
          <div className="text-xs text-purple-600 mt-1">
            Planned: {formatMinutes(metrics.plannedStudyMinutes)}
          </div>
        </div>

        {/* Revision Time */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-green-900">
              {formatMinutes(metrics.actualRevisionMinutes)}
            </span>
          </div>
          <div className="text-sm text-green-700 font-medium">Revision Time</div>
          <div className="text-xs text-green-600 mt-1">
            Planned: {formatMinutes(metrics.plannedRevisionMinutes)}
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">
              {metrics.efficiency.toFixed(0)}%
            </span>
          </div>
          <div className="text-sm text-orange-700 font-medium">Efficiency</div>
          <div className="text-xs text-orange-600 mt-1">
            {metrics.efficiency < 100 ? 'Faster pace' : 'Steady pace'}
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Study Tasks */}
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Study Sessions</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{metrics.completedStudy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">{metrics.inProgressStudy || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-gray-500">
                {metrics.studyTasks - metrics.completedStudy - (metrics.inProgressStudy || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Revision Tasks */}
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Revision Sessions</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{metrics.completedRevision}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">{metrics.inProgressRevision || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-gray-500">
                {metrics.revisionTasks - metrics.completedRevision - (metrics.inProgressRevision || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Subjects */}
      {metrics.todaySubjects.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Today's Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.todaySubjects.map((subject, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {metrics.totalTasks > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-600" />
            <div>
              <div className="font-semibold text-gray-800">
                {metrics.completionRate === 100 && "Outstanding! You've completed all tasks for today! 🎉"}
                {metrics.completionRate >= 75 && metrics.completionRate < 100 && "Great progress! You're almost done with today's goals! 💪"}
                {metrics.completionRate >= 50 && metrics.completionRate < 75 && "Halfway there! Keep up the momentum! 🚀"}
                {metrics.completionRate >= 25 && metrics.completionRate < 50 && "Good start! You're making progress! ⭐"}
                {metrics.completionRate > 0 && metrics.completionRate < 25 && "You've begun! Every step counts! 🌟"}
                {metrics.completionRate === 0 && "Ready to start? Let's make today productive! 📚"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {metrics.remainingTasks > 0 && `${metrics.remainingTasks} task${metrics.remainingTasks > 1 ? 's' : ''} remaining`}
                {metrics.inProgressTasks > 0 && ` • ${metrics.inProgressTasks} in progress`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMetricsPanel;