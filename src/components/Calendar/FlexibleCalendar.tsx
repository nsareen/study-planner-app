import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Grid3x3, 
  List, 
  CalendarDays,
  ZoomIn,
  ZoomOut,
  Info
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isToday } from 'date-fns';
import { Chapter, Exam } from '../../types';
import CalendarDayCell from './CalendarDayCell';
import CalendarControls from './CalendarControls';
import ChapterTooltip from './ChapterTooltip';

interface FlexibleCalendarProps {
  chapters: Chapter[];
  exams: Exam[];
  plannedTasks: any[]; // Will be properly typed later
  onDateSelect: (date: Date, type: 'study' | 'revision') => void;
  onChapterStatusUpdate: (chapterId: string, status: string) => void;
}

type ViewMode = 'daily' | 'weekly' | 'monthly';
type ZoomLevel = 'small' | 'medium' | 'large';

const FlexibleCalendar: React.FC<FlexibleCalendarProps> = ({
  chapters,
  exams,
  plannedTasks,
  onDateSelect,
  onChapterStatusUpdate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('medium');
  const [hoveredCell, setHoveredCell] = useState<{ date: string; chapter?: Chapter } | null>(null);

  // Get dates for current view
  const getViewDates = (): Date[] => {
    switch (viewMode) {
      case 'daily':
        return [currentDate];
      case 'weekly':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case 'monthly':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const dates = [];
        let current = calendarStart;
        while (current <= calendarEnd) {
          dates.push(current);
          current = addDays(current, 1);
        }
        return dates;
      default:
        return [];
    }
  };

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'daily':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'daily':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const getCellSize = () => {
    const sizes = {
      small: 'h-20',
      medium: 'h-32',
      large: 'h-44'
    };
    return sizes[zoomLevel];
  };

  const getGridColumns = () => {
    switch (viewMode) {
      case 'daily':
        return 'grid-cols-1';
      case 'weekly':
        return 'grid-cols-7';
      case 'monthly':
        return 'grid-cols-7';
      default:
        return 'grid-cols-7';
    }
  };

  const viewDates = getViewDates();

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannedTasks.filter(task => task.date === dateStr);
  };

  // Get exams for a specific date
  const getExamsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return exams.filter(exam => exam.date === dateStr);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Calendar Header with Controls */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <CalendarControls
          currentDate={currentDate}
          viewMode={viewMode}
          zoomLevel={zoomLevel}
          onViewModeChange={setViewMode}
          onZoomChange={setZoomLevel}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onNavigateToday={navigateToToday}
        />
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {/* Weekday Headers (for weekly and monthly views) */}
        {viewMode !== 'daily' && (
          <div className={`grid ${getGridColumns()} gap-2 mb-2`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Date Cells */}
        <div className={`grid ${getGridColumns()} gap-2`}>
          {viewDates.map((date, index) => {
            const tasks = getTasksForDate(date);
            const dayExams = getExamsForDate(date);
            const isCurrentMonth = viewMode === 'monthly' ? 
              date.getMonth() === currentDate.getMonth() : true;

            return (
              <CalendarDayCell
                key={index}
                date={date}
                tasks={tasks}
                exams={dayExams}
                isToday={isToday(date)}
                isCurrentMonth={isCurrentMonth}
                cellSize={getCellSize()}
                viewMode={viewMode}
                onDateSelect={onDateSelect}
                onHover={setHoveredCell}
                onChapterStatusUpdate={onChapterStatusUpdate}
              />
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && hoveredCell.chapter && (
        <ChapterTooltip
          chapter={hoveredCell.chapter}
          position={{ x: 0, y: 0 }} // Will be properly positioned
        />
      )}

      {/* Legend */}
      <div className="border-t p-3 bg-white">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Study Session</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Revision Session</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Exam</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Holiday/Off Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleCalendar;