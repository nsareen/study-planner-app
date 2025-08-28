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
  Zap
} from 'lucide-react';
import type { Chapter } from '../types';

interface MetricsComparisonProps {
  chapters: Chapter[];
  selectedSubject?: string;
  dateRange?: { start: Date; end: Date };
}

const MetricsComparison: React.FC<MetricsComparisonProps> = ({ 
  chapters, 
  selectedSubject,
  dateRange 
}) => {
  const metrics = useMemo(() => {
    // Filter chapters by subject if selected
    const filteredChapters = selectedSubject 
      ? chapters.filter(c => c.subject === selectedSubject)
      : chapters;

    // Calculate totals
    const plannedStudyHours = filteredChapters.reduce((sum, c) => sum + (c.studyHours || 0), 0);
    const plannedRevisionHours = filteredChapters.reduce((sum, c) => sum + (c.revisionHours || 0), 0);
    const actualStudyHours = filteredChapters.reduce((sum, c) => sum + (c.actualStudyHours || 0), 0);
    const actualRevisionHours = filteredChapters.reduce((sum, c) => sum + (c.actualRevisionHours || 0), 0);
    
    const totalPlanned = plannedStudyHours + plannedRevisionHours;
    const totalActual = actualStudyHours + actualRevisionHours;
    
    // Calculate variance
    const studyVariance = actualStudyHours - plannedStudyHours;
    const revisionVariance = actualRevisionHours - plannedRevisionHours;
    const totalVariance = totalActual - totalPlanned;
    
    // Calculate efficiency
    const studyEfficiency = plannedStudyHours > 0 
      ? (actualStudyHours / plannedStudyHours) * 100 
      : 0;
    const revisionEfficiency = plannedRevisionHours > 0 
      ? (actualRevisionHours / plannedRevisionHours) * 100 
      : 0;
    const overallEfficiency = totalPlanned > 0 
      ? (totalActual / totalPlanned) * 100 
      : 0;
    
    // Count completed chapters
    const studyCompleted = filteredChapters.filter(c => c.studyStatus === 'done').length;
    const revisionCompleted = filteredChapters.filter(c => c.revisionStatus === 'done').length;
    const studyInProgress = filteredChapters.filter(c => c.studyStatus === 'in-progress').length;
    const revisionInProgress = filteredChapters.filter(c => c.revisionStatus === 'in-progress').length;
    
    return {
      plannedStudyHours,
      plannedRevisionHours,
      actualStudyHours,
      actualRevisionHours,
      totalPlanned,
      totalActual,
      studyVariance,
      revisionVariance,
      totalVariance,
      studyEfficiency,
      revisionEfficiency,
      overallEfficiency,
      studyCompleted,
      revisionCompleted,
      studyInProgress,
      revisionInProgress,
      totalChapters: filteredChapters.length
    };
  }, [chapters, selectedSubject]);

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600 bg-red-50';
    if (variance < 0) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getEfficiencyStatus = (efficiency: number) => {
    if (efficiency === 0) return { label: 'Not Started', color: 'gray' };
    if (efficiency < 80) return { label: 'Ahead of Schedule', color: 'green' };
    if (efficiency <= 120) return { label: 'On Track', color: 'blue' };
    return { label: 'Behind Schedule', color: 'red' };
  };

  const overallStatus = getEfficiencyStatus(metrics.overallEfficiency);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Metrics</h2>
          <p className="text-gray-600 mt-1">
            {selectedSubject ? `Subject: ${selectedSubject}` : 'All Subjects'}
          </p>
        </div>
        <BarChart3 className="w-8 h-8 text-purple-500" />
      </div>

      {/* Overall Status Card */}
      <div className={`rounded-xl p-4 mb-6 bg-gradient-to-r from-${overallStatus.color}-50 to-${overallStatus.color}-100 border border-${overallStatus.color}-200`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">Overall Performance</div>
            <div className={`text-2xl font-bold text-${overallStatus.color}-700 mt-1`}>
              {overallStatus.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">
              {metrics.overallEfficiency.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </div>
        </div>
      </div>

      {/* Study vs Revision Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Study Metrics */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800">Study Sessions</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Planned</span>
              <span className="font-semibold">{metrics.plannedStudyHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Actual</span>
              <span className="font-semibold">{metrics.actualStudyHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
              <span className="text-sm text-gray-700">Variance</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                metrics.studyVariance > 0 ? 'bg-red-100 text-red-700' : 
                metrics.studyVariance < 0 ? 'bg-green-100 text-green-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {metrics.studyVariance > 0 ? '+' : ''}{metrics.studyVariance.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Completed</span>
              <span className="font-semibold">{metrics.studyCompleted}/{metrics.totalChapters}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{metrics.studyEfficiency.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.studyEfficiency)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Revision Metrics */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800">Revision Sessions</h3>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Planned</span>
              <span className="font-semibold">{metrics.plannedRevisionHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Actual</span>
              <span className="font-semibold">{metrics.actualRevisionHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-sm text-gray-700">Variance</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                metrics.revisionVariance > 0 ? 'bg-red-100 text-red-700' : 
                metrics.revisionVariance < 0 ? 'bg-green-100 text-green-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {metrics.revisionVariance > 0 ? '+' : ''}{metrics.revisionVariance.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Completed</span>
              <span className="font-semibold">{metrics.revisionCompleted}/{metrics.totalChapters}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{metrics.revisionEfficiency.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.revisionEfficiency)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.totalActual.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">Total Time Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.studyInProgress + metrics.revisionInProgress}
          </div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            metrics.totalVariance > 0 ? 'text-red-600' : 
            metrics.totalVariance < 0 ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {metrics.totalVariance > 0 ? '+' : ''}{metrics.totalVariance.toFixed(1)}h
          </div>
          <div className="text-xs text-gray-500">Total Variance</div>
        </div>
      </div>

      {/* Motivational Message */}
      {metrics.overallEfficiency > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              {metrics.overallEfficiency < 80 && "Fantastic pace! You're saving time while maintaining quality! 🚀"}
              {metrics.overallEfficiency >= 80 && metrics.overallEfficiency <= 120 && "Perfect balance! You're right on schedule! ✨"}
              {metrics.overallEfficiency > 120 && "Take your time - understanding is more important than speed! 💪"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsComparison;