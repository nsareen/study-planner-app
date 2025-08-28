import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Book, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Plus,
  BookOpen,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import type { Chapter, Exam, ChapterAssignment } from '../../types';

interface CalendarDayCellProps {
  date: Date;
  tasks: any[];
  assignments?: ChapterAssignment[];
  chapters?: Chapter[];
  exams: Exam[];
  isToday: boolean;
  isCurrentMonth: boolean;
  cellSize: string;
  viewMode: 'daily' | 'weekly' | 'monthly';
  onDateSelect: (date: Date, type: 'study' | 'revision') => void;
  onHover: (cell: { date: string; chapter?: Chapter } | null) => void;
  onAssignmentUpdate?: (assignmentId: string, updates: Partial<ChapterAssignment>) => void;
  onAssignmentDelete?: (assignmentId: string) => void;
  onAssignmentStart?: (assignmentId: string) => void;
  onAssignmentClick?: (assignment: ChapterAssignment) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  tasks,
  assignments = [],
  chapters = [],
  exams,
  isToday,
  isCurrentMonth,
  cellSize,
  viewMode,
  onDateSelect,
  onHover,
  onAssignmentUpdate,
  onAssignmentDelete,
  onAssignmentStart,
  onAssignmentClick,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const dayNumber = format(date, 'd');
  const dateStr = format(date, 'yyyy-MM-dd');

  // Group tasks by type
  const studyTasks = tasks.filter(t => t.taskType === 'study');
  const revisionTasks = tasks.filter(t => t.taskType === 'revision');
  
  // Group assignments by type and enhance with chapter info
  const studyAssignments = assignments
    .filter(a => a.activityType === 'study')
    .map(a => ({
      ...a,
      chapter: chapters.find(c => c.id === a.chapterId)
    }));
  const revisionAssignments = assignments
    .filter(a => a.activityType === 'revision')
    .map(a => ({
      ...a,
      chapter: chapters.find(c => c.id === a.chapterId)
    }));

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
            className="flex items-center gap-1 bg-blue-100 rounded px-1 py-0.5 text-xs hover:bg-blue-200 group"
            onMouseEnter={() => onHover({ date: dateStr, chapter: task.chapter })}
            onMouseLeave={() => onHover(null)}
          >
            {getStatusIcon(task.status)}
            <Book className="w-3 h-3 text-blue-600" />
            <span className="truncate text-blue-700 flex-1">
              {task.chapterName || task.subject}
            </span>
          </div>
        ))}

        {/* Study Assignments - New scheduled chapters */}
        {viewMode !== 'monthly' && studyAssignments.map((assignment, idx) => (
          <div
            key={`study-assign-${idx}`}
            className="flex items-center gap-1 bg-blue-50 border-2 border-blue-300 rounded-lg px-2 py-1.5 text-xs hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all group cursor-pointer"
            title="Click to view/manage this activity"
            onMouseEnter={() => assignment.chapter && onHover({ date: dateStr, chapter: assignment.chapter })}
            onMouseLeave={() => onHover(null)}
            onClick={() => {
              if (onAssignmentClick) {
                onAssignmentClick(assignment);
              } else if (assignment.status === 'scheduled' && onAssignmentStart) {
                onAssignmentStart(assignment.id);
              }
            }}
          >
            {getStatusIcon(assignment.status)}
            <BookOpen className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-blue-800">
              {assignment.chapter?.subject}:
            </span>
            <span className="truncate text-blue-700 flex-1">
              {assignment.chapter?.name}
            </span>
            <span className="text-blue-500 text-[10px]">
              {Math.round(assignment.plannedMinutes / 60)}h
            </span>
            {assignment.status === 'scheduled' && onAssignmentStart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignmentStart(assignment.id);
                }}
                className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                title="Start this activity"
              >
                <Play className="w-3 h-3 text-blue-500 hover:text-blue-700" />
              </button>
            )}
            {onAssignmentDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Remove this scheduled activity?')) {
                    onAssignmentDelete(assignment.id);
                  }
                }}
                className="p-0.5 hover:bg-red-100 rounded transition-colors"
                title="Delete this activity"
              >
                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
              </button>
            )}
          </div>
        ))}

        {/* Revision Tasks */}
        {viewMode !== 'monthly' && revisionTasks.map((task, idx) => (
          <div
            key={`revision-${idx}`}
            className="flex items-center gap-1 bg-green-100 rounded px-1 py-0.5 text-xs hover:bg-green-200 group"
            onMouseEnter={() => onHover({ date: dateStr, chapter: task.chapter })}
            onMouseLeave={() => onHover(null)}
          >
            {getStatusIcon(task.status)}
            <RefreshCw className="w-3 h-3 text-green-600" />
            <span className="truncate text-green-700 flex-1">
              {task.chapterName || task.subject}
            </span>
          </div>
        ))}

        {/* Revision Assignments - New scheduled chapters */}
        {viewMode !== 'monthly' && revisionAssignments.map((assignment, idx) => (
          <div
            key={`revision-assign-${idx}`}
            className="flex items-center gap-1 bg-green-50 border-2 border-green-300 rounded-lg px-2 py-1.5 text-xs hover:bg-green-100 hover:shadow-lg hover:scale-[1.02] transition-all group cursor-pointer"
            title="Click to view/manage this activity"
            onMouseEnter={() => assignment.chapter && onHover({ date: dateStr, chapter: assignment.chapter })}
            onMouseLeave={() => onHover(null)}
            onClick={() => {
              if (onAssignmentClick) {
                onAssignmentClick(assignment);
              } else if (assignment.status === 'scheduled' && onAssignmentStart) {
                onAssignmentStart(assignment.id);
              }
            }}
          >
            {getStatusIcon(assignment.status)}
            <RefreshCw className="w-3 h-3 text-green-600" />
            <span className="font-medium text-green-800">
              {assignment.chapter?.subject}:
            </span>
            <span className="truncate text-green-700 flex-1">
              {assignment.chapter?.name}
            </span>
            <span className="text-green-500 text-[10px]">
              {Math.round(assignment.plannedMinutes / 60)}h
            </span>
            {assignment.status === 'scheduled' && onAssignmentStart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignmentStart(assignment.id);
                }}
                className="p-0.5 hover:bg-green-100 rounded transition-colors"
                title="Start this activity"
              >
                <Play className="w-3 h-3 text-green-500 hover:text-green-700" />
              </button>
            )}
            {onAssignmentDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Remove this scheduled activity?')) {
                    onAssignmentDelete(assignment.id);
                  }
                }}
                className="p-0.5 hover:bg-red-100 rounded transition-colors"
                title="Delete this activity"
              >
                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
              </button>
            )}
          </div>
        ))}

        {/* Summary for monthly view */}
        {viewMode === 'monthly' && (tasks.length > 0 || assignments.length > 0) && (
          <div className="text-xs space-y-1">
            {(studyTasks.length > 0 || studyAssignments.length > 0) && (
              <div className="flex items-center gap-1 text-blue-600">
                <BookOpen className="w-3 h-3" />
                <span>{studyTasks.length + studyAssignments.length}</span>
              </div>
            )}
            {(revisionTasks.length > 0 || revisionAssignments.length > 0) && (
              <div className="flex items-center gap-1 text-green-600">
                <RefreshCw className="w-3 h-3" />
                <span>{revisionTasks.length + revisionAssignments.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty State for viewMode !== 'monthly' */}
        {viewMode !== 'monthly' && tasks.length === 0 && assignments.length === 0 && exams.length === 0 && isCurrentMonth && (
          <div className="text-xs text-gray-400 text-center pt-2">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDayCell;