import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, RefreshCw, X, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import type { Chapter, StudyPlan } from '../types';
import PlanSelectionDialog from './PlanSelectionDialog';

interface ChapterSchedulerProps {
  isOpen: boolean;
  chapter: Chapter | null;
  onClose: () => void;
  onSchedule: (chapterId: string, date: Date, activityType: 'study' | 'revision', duration?: number, planId?: string) => void;
  existingSchedules?: Array<{
    date: string;
    chapterId: string;
    activityType: 'study' | 'revision';
  }>;
  plans?: StudyPlan[];
  activeStudyPlanId?: string;
  onCreateNewPlan?: () => void;
}

const ChapterScheduler: React.FC<ChapterSchedulerProps> = ({
  isOpen,
  chapter,
  onClose,
  onSchedule,
  existingSchedules = [],
  plans = [],
  activeStudyPlanId,
  onCreateNewPlan
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activityType, setActivityType] = useState<'study' | 'revision'>('study');
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(activeStudyPlanId);
  
  if (!isOpen || !chapter) return null;
  
  const defaultDuration = activityType === 'study' 
    ? (chapter.studyHours || 2) * 60 
    : (chapter.revisionHours || 1) * 60;
  
  const handleSchedule = () => {
    if (selectedDate) {
      // If plans exist and we need to select one, show plan selection
      if (plans.length > 1 && !selectedPlanId) {
        setShowPlanSelection(true);
      } else {
        // Proceed with scheduling
        const duration = customDuration || defaultDuration;
        onSchedule(chapter.id, selectedDate, activityType, duration, selectedPlanId);
        onClose();
      }
    }
  };
  
  const handlePlanSelected = (planId: string) => {
    setSelectedPlanId(planId);
    setShowPlanSelection(false);
    // Now schedule with the selected plan
    if (selectedDate) {
      const duration = customDuration || defaultDuration;
      onSchedule(chapter.id, selectedDate, activityType, duration, planId);
      onClose();
    }
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const start = startOfWeek(startOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)));
    const days = [];
    
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  const today = startOfDay(new Date());
  
  const isDateScheduled = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return existingSchedules.some(s => 
      s.date === dateStr && 
      s.chapterId === chapter.id && 
      s.activityType === activityType
    );
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Schedule Chapter</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium">{chapter.subject}</p>
            <p className="text-white/90">{chapter.name}</p>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Activity Type Selector */}
          <div className="py-6 border-b">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Select Activity Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActivityType('study')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activityType === 'study'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Study</div>
                <div className="text-sm mt-1">
                  Default: {chapter.studyHours || 2} hours
                </div>
                {chapter.studyStatus === 'done' && (
                  <div className="text-xs mt-2 text-green-600">✓ Already completed</div>
                )}
              </button>
              
              <button
                onClick={() => setActivityType('revision')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activityType === 'revision'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Revision</div>
                <div className="text-sm mt-1">
                  Default: {chapter.revisionHours || 1} hours
                </div>
                {chapter.revisionStatus === 'done' && (
                  <div className="text-xs mt-2 text-green-600">✓ Already completed</div>
                )}
              </button>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="py-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Select Date</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-gray-800 min-w-[140px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isPast = isBefore(date, today) && !isSameDay(date, today);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isScheduled = isDateScheduled(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    className={`
                      p-2 rounded-lg text-sm transition-all relative
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                      ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${isToday(date) ? 'font-bold text-purple-600' : ''}
                      ${isSelected ? 'bg-purple-100 border-2 border-purple-500' : ''}
                      ${isScheduled ? 'bg-yellow-50' : ''}
                    `}
                  >
                    <div>{format(date, 'd')}</div>
                    {isScheduled && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
                    )}
                    {isToday(date) && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {selectedDate && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <strong>Selected:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
          
          {/* Duration Override */}
          <div className="py-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Duration (Optional)</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Default: {(defaultDuration / 60).toFixed(1)} hours
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customDuration ? customDuration / 60 : ''}
                  onChange={(e) => {
                    const hours = parseFloat(e.target.value);
                    setCustomDuration(hours ? hours * 60 : null);
                  }}
                  placeholder="Custom"
                  className="w-20 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.5"
                  min="0.5"
                />
                <span className="text-sm text-gray-600">hours</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions - Fixed at bottom */}
        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!selectedDate}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              selectedDate
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Schedule Activity
          </button>
        </div>
      </div>
      
      {/* Plan Selection Dialog */}
      <PlanSelectionDialog
        isOpen={showPlanSelection}
        onClose={() => setShowPlanSelection(false)}
        onSelectPlan={handlePlanSelected}
        plans={plans}
        activeStudyPlanId={activeStudyPlanId}
        chapter={chapter}
        onCreateNewPlan={onCreateNewPlan}
      />
    </div>
  );
};

export default ChapterScheduler;