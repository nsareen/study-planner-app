import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Book, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Chapter, Exam } from '../../types';

interface CalendarDayCellProps {
  date: Date;
  tasks: any[];
  exams: Exam[];
  isToday: boolean;
  isCurrentMonth: boolean;
  cellSize: string;
  viewMode: 'daily' | 'weekly' | 'monthly';
  onDateSelect: (date: Date, type: 'study' | 'revision') => void;
  onHover: (cell: { date: string; chapter?: Chapter } | null) => void;
  onChapterStatusUpdate: (chapterId: string, status: string) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  tasks,
  exams,
  isToday,
  isCurrentMonth,
  cellSize,
  viewMode,
  onDateSelect,
  onHover,
  onChapterStatusUpdate,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const dayNumber = format(date, 'd');
  const dateStr = format(date, 'yyyy-MM-dd');

  // Group tasks by type
  const studyTasks = tasks.filter(t => t.taskType === 'study');
  const revisionTasks = tasks.filter(t => t.taskType === 'revision');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'scheduled':
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getCellBackground = () => {
    if (!isCurrentMonth) return 'bg-gray-50';
    if (isToday) return 'bg-blue-50 ring-2 ring-blue-400';
    if (exams.length > 0) return 'bg-red-50';
    if (tasks.length > 0) return 'bg-purple-50';
    return 'bg-white hover:bg-gray-50';
  };

  const handleQuickAdd = (type: 'study' | 'revision') => {
    onDateSelect(date, type);
    setShowQuickAdd(false);
  };

  return (
    <div
      className={`
        ${getCellBackground()}
        ${cellSize}
        relative border rounded-lg p-2 transition-all cursor-pointer
        hover:shadow-md overflow-hidden group
        ${!isCurrentMonth ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-1">
        <span className={`
          text-sm font-semibold
          ${isToday ? 'text-blue-600' : 'text-gray-700'}
          ${!isCurrentMonth ? 'text-gray-400' : ''}
        `}>
          {dayNumber}
        </span>
        
        {/* Quick Add Button */}
        {showQuickAdd && isCurrentMonth && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleQuickAdd('study')}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Add Study Session"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleQuickAdd('revision')}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Add Revision Session"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100% - 28px)' }}>
        {/* Exams */}
        {exams.map((exam, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-red-100 rounded px-1 py-0.5 text-xs"
          >
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span className="truncate font-medium text-red-700">
              {exam.name}
            </span>
          </div>
        ))}

        {/* Study Tasks */}
        {viewMode !== 'monthly' && studyTasks.map((task, idx) => (
          <div
            key={`study-${idx}`}
            className="flex items-center gap-1 bg-blue-100 rounded px-1 py-0.5 text-xs cursor-pointer hover:bg-blue-200"
            onClick={() => onChapterStatusUpdate(task.chapterId, task.status)}
            onMouseEnter={() => onHover({ date: dateStr, chapter: task.chapter })}
            onMouseLeave={() => onHover(null)}
          >
            {getStatusIcon(task.status)}
            <Book className="w-3 h-3 text-blue-600" />
            <span className="truncate text-blue-700">
              {task.chapterName || task.subject}
            </span>
          </div>
        ))}

        {/* Revision Tasks */}
        {viewMode !== 'monthly' && revisionTasks.map((task, idx) => (
          <div
            key={`revision-${idx}`}
            className="flex items-center gap-1 bg-green-100 rounded px-1 py-0.5 text-xs cursor-pointer hover:bg-green-200"
            onClick={() => onChapterStatusUpdate(task.chapterId, task.status)}
            onMouseEnter={() => onHover({ date: dateStr, chapter: task.chapter })}
            onMouseLeave={() => onHover(null)}
          >
            {getStatusIcon(task.status)}
            <RefreshCw className="w-3 h-3 text-green-600" />
            <span className="truncate text-green-700">
              {task.chapterName || task.subject}
            </span>
          </div>
        ))}

        {/* Summary for monthly view */}
        {viewMode === 'monthly' && tasks.length > 0 && (
          <div className="text-xs">
            {studyTasks.length > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Book className="w-3 h-3" />
                <span>{studyTasks.length}</span>
              </div>
            )}
            {revisionTasks.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <RefreshCw className="w-3 h-3" />
                <span>{revisionTasks.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty State for viewMode !== 'monthly' */}
        {viewMode !== 'monthly' && tasks.length === 0 && exams.length === 0 && isCurrentMonth && (
          <div className="text-xs text-gray-400 text-center pt-2">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDayCell;