import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { backendAssignmentOps } from '../store/backendStore';
import { Plus, BookOpen, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface QuickSchedulerProps {
  date?: string;
  onScheduled?: () => void;
}

const QuickScheduler: React.FC<QuickSchedulerProps> = ({ date, onScheduled }) => {
  const chapters = useStore((state) => state.getChapters());
  const chapterAssignments = useStore((state) => state.getChapterAssignments());
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [activityType, setActivityType] = useState<'study' | 'revision'>('study');
  const [minutes, setMinutes] = useState<number>(60);
  const [isScheduling, setIsScheduling] = useState(false);

  const today = date || format(new Date(), 'yyyy-MM-dd');

  // Get chapters that aren't already scheduled for today
  const scheduledChapterIds = chapterAssignments
    .filter((a: any) => a.date === today)
    .map((a: any) => a.chapterId);

  const availableChapters = chapters.filter((c: any) => !scheduledChapterIds.includes(c.id));

  const handleQuickSchedule = async () => {
    if (!selectedChapterId || isScheduling) return;

    setIsScheduling(true);

    try {
      // Use backend operation (optimistic update + background sync)
      await backendAssignmentOps.scheduleChapter(selectedChapterId, today, activityType, minutes);

      setSelectedChapterId('');
      setMinutes(60);
      setActivityType('study');

      if (onScheduled) {
        onScheduled();
      }
    } catch (error) {
      console.error('Failed to schedule chapter:', error);
      // Error is already handled in backendAssignmentOps (optimistic update succeeded)
    } finally {
      setIsScheduling(false);
    }
  };

  if (availableChapters.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-dashed border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="text-lg font-bold text-green-800 mb-2">All Chapters Scheduled!</h3>
          <p className="text-green-700 text-sm">
            Great job! You've scheduled all your chapters for today. Time to start studying!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-dashed border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <Plus className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Quick Schedule</h3>
          <p className="text-sm text-gray-600">Add a chapter to today's plan</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Chapter Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Select Chapter
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="">Choose a chapter...</option>
            {availableChapters.map((chapter: any) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.subject} - {chapter.name}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setActivityType('study')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activityType === 'study'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              📚 Study
            </button>
            <button
              onClick={() => setActivityType('revision')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activityType === 'revision'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300'
              }`}
            >
              🔄 Revision
            </button>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Duration (minutes)
          </label>
          <div className="flex gap-2">
            {[30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => setMinutes(mins)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  minutes === mins
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 60)}
            min={15}
            max={300}
            step={15}
            className="mt-2 w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
            placeholder="Or enter custom minutes..."
          />
        </div>

        {/* Add Button */}
        <button
          onClick={handleQuickSchedule}
          disabled={!selectedChapterId || isScheduling}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            selectedChapterId && !isScheduling
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isScheduling ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Today's Plan
            </>
          )}
        </button>
      </div>

      {availableChapters.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-purple-100">
          <p className="text-sm text-gray-600 text-center">
            {availableChapters.length} chapter{availableChapters.length !== 1 ? 's' : ''} available to schedule
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickScheduler;
