import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import type { Chapter, PlannerTask, PlannerDay } from '../types';
import { format } from 'date-fns';

interface DailyProgressProps {
  chapters: Chapter[];
  plannerDays: PlannerDay[];
  currentDate?: Date;
}

const DailyProgress: React.FC<DailyProgressProps> = ({ 
  chapters, 
  plannerDays,
  currentDate = new Date()
}) => {
  // Calculate daily metrics
  const dailyMetrics = useMemo(() => {
    // Get today's tasks
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const todayPlan = plannerDays.find(day => 
      format(new Date(day.date), 'yyyy-MM-dd') === todayStr
    );
    
    const todayTasks = todayPlan?.plannedTasks || [];
    
    // Calculate planned hours for today
    const plannedStudyHours = todayTasks
      .filter(t => t.taskType === 'study')
      .reduce((sum, t) => sum + (t.plannedMinutes / 60), 0);
    
    const plannedRevisionHours = todayTasks
      .filter(t => t.taskType === 'revision')
      .reduce((sum, t) => sum + (t.plannedMinutes / 60), 0);
    
    // Calculate actual hours for today's chapters
    const todayChapterIds = todayTasks.map(t => t.chapterId);
    const todayChapters = chapters.filter(c => todayChapterIds.includes(c.id));
    
    const actualStudyHours = todayChapters
      .reduce((sum, c) => sum + (c.actualStudyHours || 0), 0);
    
    const actualRevisionHours = todayChapters
      .reduce((sum, c) => sum + (c.actualRevisionHours || 0), 0);
    
    // Calculate completion status
    const completedTasks = todayTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      if (t.taskType === 'study') {
        return chapter?.studyStatus === 'done';
      } else {
        return chapter?.revisionStatus === 'done';
      }
    });
    
    const inProgressTasks = todayTasks.filter(t => {
      const chapter = chapters.find(c => c.id === t.chapterId);
      if (t.taskType === 'study') {
        return chapter?.studyStatus === 'in-progress';
      } else {
        return chapter?.revisionStatus === 'in-progress';
      }
    });
    
    return {
      plannedStudyHours,
      plannedRevisionHours,
      actualStudyHours,
      actualRevisionHours,
      totalPlannedHours: plannedStudyHours + plannedRevisionHours,
      totalActualHours: actualStudyHours + actualRevisionHours,
      tasksTotal: todayTasks.length,
      tasksCompleted: completedTasks.length,
      tasksInProgress: inProgressTasks.length,
      tasksPending: todayTasks.length - completedTasks.length - inProgressTasks.length,
      completionPercentage: todayTasks.length > 0 
        ? Math.round((completedTasks.length / todayTasks.length) * 100)
        : 0,
      velocityPercentage: (plannedStudyHours + plannedRevisionHours) > 0
        ? Math.round((actualStudyHours + actualRevisionHours) / (plannedStudyHours + plannedRevisionHours) * 100)
        : 0
    };
  }, [chapters, plannerDays, currentDate]);

  // Determine velocity status
  const getVelocityStatus = () => {
    const { velocityPercentage } = dailyMetrics;
    if (velocityPercentage === 0) return { status: 'not-started', color: 'gray', icon: Clock };
    if (velocityPercentage < 80) return { status: 'ahead', color: 'green', icon: TrendingDown };
    if (velocityPercentage <= 120) return { status: 'on-time', color: 'blue', icon: Activity };
    return { status: 'behind', color: 'red', icon: TrendingUp };
  };

  const velocityStatus = getVelocityStatus();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Progress</h2>
          <p className="text-gray-600 mt-1">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Calendar className="w-8 h-8 text-purple-500" />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tasks Progress */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Tasks</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {dailyMetrics.tasksCompleted} / {dailyMetrics.tasksTotal}
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Progress</span>
              <span>{dailyMetrics.completionPercentage}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${dailyMetrics.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hours Progress */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Hours</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {dailyMetrics.totalActualHours.toFixed(1)} / {dailyMetrics.totalPlannedHours.toFixed(1)}h
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-blue-600">Study: {dailyMetrics.actualStudyHours.toFixed(1)}h</span>
              <span className="text-green-600">Revision: {dailyMetrics.actualRevisionHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Velocity Status */}
        <div className={`bg-gradient-to-br from-${velocityStatus.color}-50 to-${velocityStatus.color}-100 rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Velocity</span>
            <velocityStatus.icon className={`w-4 h-4 text-${velocityStatus.color}-600`} />
          </div>
          <div className={`text-2xl font-bold text-${velocityStatus.color}-900`}>
            {dailyMetrics.velocityPercentage}%
          </div>
          <div className={`mt-2 text-xs text-${velocityStatus.color}-700 font-medium`}>
            {velocityStatus.status === 'ahead' && 'Ahead of schedule! 🚀'}
            {velocityStatus.status === 'on-time' && 'Right on track! ✨'}
            {velocityStatus.status === 'behind' && 'Take your time 💪'}
            {velocityStatus.status === 'not-started' && 'Ready to start 📚'}
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Task Status</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">
              Completed: <span className="font-semibold">{dailyMetrics.tasksCompleted}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">
              In Progress: <span className="font-semibold">{dailyMetrics.tasksInProgress}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-700">
              Pending: <span className="font-semibold">{dailyMetrics.tasksPending}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Variance Analysis */}
      {dailyMetrics.totalPlannedHours > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Time Variance</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Study Time</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {dailyMetrics.actualStudyHours.toFixed(1)}h / {dailyMetrics.plannedStudyHours.toFixed(1)}h
                </span>
                {dailyMetrics.actualStudyHours !== dailyMetrics.plannedStudyHours && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    dailyMetrics.actualStudyHours > dailyMetrics.plannedStudyHours
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {dailyMetrics.actualStudyHours > dailyMetrics.plannedStudyHours ? '+' : ''}
                    {(dailyMetrics.actualStudyHours - dailyMetrics.plannedStudyHours).toFixed(1)}h
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revision Time</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {dailyMetrics.actualRevisionHours.toFixed(1)}h / {dailyMetrics.plannedRevisionHours.toFixed(1)}h
                </span>
                {dailyMetrics.actualRevisionHours !== dailyMetrics.plannedRevisionHours && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    dailyMetrics.actualRevisionHours > dailyMetrics.plannedRevisionHours
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {dailyMetrics.actualRevisionHours > dailyMetrics.plannedRevisionHours ? '+' : ''}
                    {(dailyMetrics.actualRevisionHours - dailyMetrics.plannedRevisionHours).toFixed(1)}h
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyProgress;