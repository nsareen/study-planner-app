import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Chapter, PlannerTask } from '../../types';
import SmartTimer from './SmartTimer';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter;
  chapters?: Chapter[];
  task?: PlannerTask;
  mode: 'single' | 'subject' | 'daily';
  sessionType?: 'study' | 'revision';
  onComplete?: (actualMinutes: number) => void;
  onUpdateChapterStatus?: (chapterId: string, updates: Partial<Chapter>) => void;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  chapter,
  chapters = [],
  task,
  mode,
  sessionType: initialSessionType,
  onComplete,
  onUpdateChapterStatus,
}) => {
  const [sessionType, setSessionType] = useState<'study' | 'revision'>(
    initialSessionType || task?.taskType || 'study'
  );

  if (!isOpen) return null;

  // Get planned minutes based on mode and session type
  const getPlannedMinutes = () => {
    if (task) {
      return task.plannedMinutes;
    }
    
    if (mode === 'single' && chapter) {
      return sessionType === 'study' 
        ? (chapter.studyHours || 2) * 60
        : (chapter.revisionHours || 1) * 60;
    }
    
    if (mode === 'subject' && chapters.length > 0) {
      return chapters.reduce((total, ch) => {
        const hours = sessionType === 'study' ? (ch.studyHours || 2) : (ch.revisionHours || 1);
        return total + hours * 60;
      }, 0);
    }
    
    if (mode === 'daily' && chapters.length > 0) {
      return chapters.reduce((total, ch) => {
        // For daily, include both study and revision
        const studyHours = ch.studyHours || 2;
        const revisionHours = ch.revisionHours || 1;
        return total + (studyHours + revisionHours) * 60;
      }, 0);
    }
    
    return 120; // Default 2 hours
  };

  const handleTimerComplete = (actualMinutes: number) => {
    // Update chapter status and actual hours
    if (chapter && onUpdateChapterStatus) {
      const updates: Partial<Chapter> = {
        [sessionType === 'study' ? 'studyStatus' : 'revisionStatus']: 'done',
        [sessionType === 'study' ? 'actualStudyHours' : 'actualRevisionHours']: actualMinutes / 60,
        [sessionType === 'study' ? 'lastStudiedAt' : 'lastRevisedAt']: new Date().toISOString(),
      };
      
      onUpdateChapterStatus(chapter.id, updates);
    }
    
    // Call the onComplete callback
    if (onComplete) {
      onComplete(actualMinutes);
    }
  };

  const handleTimerStart = () => {
    // Update status to in-progress when timer starts
    if (chapter && onUpdateChapterStatus) {
      const updates: Partial<Chapter> = {
        [sessionType === 'study' ? 'studyStatus' : 'revisionStatus']: 'in-progress',
      };
      
      onUpdateChapterStatus(chapter.id, updates);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Study Timer</h2>
            {chapter && (
              <p className="text-gray-600 mt-1">
                {chapter.subject} - {chapter.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Session Type Selector (if not predetermined) */}
        {!initialSessionType && !task && (
          <div className="px-6 py-4 border-b bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionType('study')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sessionType === 'study'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📖 Study Session
              </button>
              <button
                onClick={() => setSessionType('revision')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sessionType === 'revision'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔄 Revision Session
              </button>
            </div>
          </div>
        )}

        {/* Timer Component */}
        <div className="p-6">
          <SmartTimer
            chapter={chapter}
            chapters={mode !== 'single' ? chapters : []}
            mode={mode}
            sessionType={sessionType}
            plannedMinutes={getPlannedMinutes()}
            onComplete={handleTimerComplete}
            onStart={handleTimerStart}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerModal;