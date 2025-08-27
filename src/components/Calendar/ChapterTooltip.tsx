import React from 'react';
import { Clock, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { Chapter } from '../../types';

interface ChapterTooltipProps {
  chapter: Chapter;
  position: { x: number; y: number };
}

const ChapterTooltip: React.FC<ChapterTooltipProps> = ({ chapter, position }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'not-done':
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const studyProgress = getProgressPercentage(chapter.completedStudyHours, chapter.studyHours);
  const revisionProgress = getProgressPercentage(chapter.completedRevisionHours, chapter.revisionHours);

  return (
    <div
      className="absolute z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4"
      style={{
        top: position.y + 10,
        left: position.x + 10,
      }}
    >
      {/* Header */}
      <div className="border-b pb-3 mb-3">
        <h3 className="font-bold text-lg text-gray-800">{chapter.name}</h3>
        <p className="text-sm text-gray-600">{chapter.subject}</p>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chapter.studyStatus)}`}>
          Study: {chapter.studyStatus.replace('-', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chapter.revisionStatus)}`}>
          Revision: {chapter.revisionStatus.replace('-', ' ')}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {/* Study Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Study Progress</span>
            <span className="text-xs text-gray-500">
              {chapter.completedStudyHours}h / {chapter.studyHours}h ({studyProgress}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${studyProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Revision Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Revision Progress</span>
            <span className="text-xs text-gray-500">
              {chapter.completedRevisionHours}h / {chapter.revisionHours}h ({revisionProgress}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${revisionProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-3 h-3" />
          <span>Total: {chapter.studyHours + chapter.revisionHours}h</span>
        </div>
        
        {chapter.confidence && (
          <div className="flex items-center gap-1 text-gray-600">
            <TrendingUp className="w-3 h-3" />
            <span>Confidence: {chapter.confidence}</span>
          </div>
        )}
        
        {chapter.lastStudiedAt && (
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>Last studied: {new Date(chapter.lastStudiedAt).toLocaleDateString()}</span>
          </div>
        )}
        
        {chapter.priority && (
          <div className="flex items-center gap-1 text-gray-600">
            <Target className="w-3 h-3" />
            <span>Priority: {chapter.priority}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {chapter.notes && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Notes:</span> {chapter.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChapterTooltip;