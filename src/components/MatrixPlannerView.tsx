import React, { useState } from 'react';
import { 
  CheckCircle, Circle, Clock, BookOpen, Target, TrendingUp, 
  Calendar, AlertTriangle, Play, ChevronDown, ChevronUp,
  RotateCcw, Edit2, Save, X, CalendarPlus, Trash2, RefreshCw,
  PlayCircle, PauseCircle, CheckSquare, Square
} from 'lucide-react';
import type { Chapter, PlannerDay, PlannerTask, Exam } from '../types';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import SubjectQuickActions from './SubjectQuickActions';
import FlexibleCalendar from './Calendar/FlexibleCalendar';

interface MatrixPlannerViewProps {
  chapters: Chapter[];
  plannerDays: PlannerDay[];
  onDrop: (e: React.DragEvent, day: PlannerDay) => void;
  onDragOver: (e: React.DragEvent) => void;
  onStartTask: (task: PlannerTask) => void;
  onUpdateChapterHours?: (chapterId: string, studyHours: number, revisionHours: number) => void;
  onUpdateChapterStatus?: (chapterId: string, updates: Partial<Chapter>) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onResetChapter?: (chapterId: string) => void;
  onDeleteSubject?: (subject: string) => void;
  selectedExamDate?: Date | null;
  selectedChapterIds?: string[];
  onToggleChapterSelection?: (chapterId: string) => void;
  exams?: Exam[];
}

const MatrixPlannerView: React.FC<MatrixPlannerViewProps> = ({
  chapters,
  plannerDays,
  onDrop,
  onDragOver,
  onStartTask,
  onUpdateChapterHours,
  onUpdateChapterStatus,
  onDeleteChapter,
  onResetChapter,
  onDeleteSubject,
  selectedExamDate,
  selectedChapterIds = [],
  onToggleChapterSelection,
  exams = []
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ chapterId: string; type: 'study' | 'revision' } | null>(null);
  const [tempHours, setTempHours] = useState<number>(0);
  const [showDatePicker, setShowDatePicker] = useState<{ chapter: Chapter; type: 'study' | 'revision' } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(true); // Default to showing full calendar
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const startDate = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const monthDays = Array.from({ length: 30 }, (_, i) => addDays(startDate, i));

  // Group chapters by subject
  const chaptersBySubject = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  // Calculate subject-level stats
  const getSubjectStats = (subject: string) => {
    const subjectChapters = chaptersBySubject[subject] || [];
    return {
      totalChapters: subjectChapters.length,
      studyCompleted: subjectChapters.filter(c => c.studyStatus === 'done').length,
      revisionCompleted: subjectChapters.filter(c => c.revisionStatus === 'done').length,
      totalStudyHours: subjectChapters.reduce((sum, c) => sum + (c.studyHours || c.estimatedHours || 2), 0),
      totalRevisionHours: subjectChapters.reduce((sum, c) => sum + (c.revisionHours || 1), 0),
      completedStudyHours: subjectChapters.reduce((sum, c) => sum + (c.completedStudyHours || 0), 0),
      completedRevisionHours: subjectChapters.reduce((sum, c) => sum + (c.completedRevisionHours || 0), 0),
    };
  };

  // Get overall stats
  const overallStats = {
    totalChapters: chapters.length,
    studyCompleted: chapters.filter(c => c.studyStatus === 'done').length,
    revisionCompleted: chapters.filter(c => c.revisionStatus === 'done').length,
    totalStudyHours: chapters.reduce((sum, c) => sum + (c.studyHours || c.estimatedHours || 2), 0),
    totalRevisionHours: chapters.reduce((sum, c) => sum + (c.revisionHours || 1), 0),
    remainingStudyHours: chapters
      .filter(c => c.studyStatus !== 'done')
      .reduce((sum, c) => sum + (c.studyHours || c.estimatedHours || 2), 0),
    remainingRevisionHours: chapters
      .filter(c => c.revisionStatus !== 'done')
      .reduce((sum, c) => sum + (c.revisionHours || 1), 0),
  };

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const getStatusIcon = (status: 'not-done' | 'in-progress' | 'done' | undefined) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const handleEditHours = (chapterId: string, type: 'study' | 'revision', currentHours: number) => {
    setEditingCell({ chapterId, type });
    setTempHours(currentHours);
  };

  const handleSaveHours = (chapter: Chapter) => {
    if (editingCell && onUpdateChapterHours) {
      const newStudyHours = editingCell.type === 'study' ? tempHours : (chapter.studyHours || 2);
      const newRevisionHours = editingCell.type === 'revision' ? tempHours : (chapter.revisionHours || 1);
      onUpdateChapterHours(editingCell.chapterId, newStudyHours, newRevisionHours);
    }
    setEditingCell(null);
  };

  // Status management functions
  const handleToggleStudyStatus = (chapter: Chapter) => {
    const currentStatus = chapter.studyStatus || 'not-done';
    const nextStatus = currentStatus === 'not-done' ? 'in-progress' : 
                      currentStatus === 'in-progress' ? 'done' : 'not-done';
    
    onUpdateChapterStatus?.(chapter.id, { 
      studyStatus: nextStatus,
      completedStudyHours: nextStatus === 'done' ? (chapter.studyHours || chapter.estimatedHours || 2) : 
                          nextStatus === 'in-progress' ? (chapter.completedStudyHours || 0) : 0
    });
  };

  const handleToggleRevisionStatus = (chapter: Chapter) => {
    const currentStatus = chapter.revisionStatus || 'not-done';
    const nextStatus = currentStatus === 'not-done' ? 'in-progress' : 
                      currentStatus === 'in-progress' ? 'done' : 'not-done';
    
    onUpdateChapterStatus?.(chapter.id, { 
      revisionStatus: nextStatus,
      completedRevisionHours: nextStatus === 'done' ? (chapter.revisionHours || 1) : 
                              nextStatus === 'in-progress' ? (chapter.completedRevisionHours || 0) : 0
    });
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const day = plannerDays.find(d => isSameDay(new Date(d.date), date));
    return day?.plannedTasks || [];
  };

  // Calendar handlers
  const handleAddToCalendar = (chapter: Chapter, type: 'study' | 'revision') => {
    setShowDatePicker({ chapter, type });
    setSelectedDate(null);
  };

  const handleDateSelect = (date: Date) => {
    if (!showDatePicker) return;
    
    const day = plannerDays.find(d => isSameDay(new Date(d.date), date));
    if (day) {
      // Create a mock drag event with the chapter data
      const mockEvent = new DragEvent('drop');
      Object.defineProperty(mockEvent, 'dataTransfer', {
        value: {
          getData: () => JSON.stringify(showDatePicker)
        }
      });
      onDrop(mockEvent as any, day);
    }
    
    setShowDatePicker(null);
    setSelectedDate(null);
  };

  const closeDatePicker = () => {
    setShowDatePicker(null);
    setSelectedDate(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      {/* Grid Layout: Side-by-side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Section: Chapter Matrix */}
        <div className="lg:col-span-1">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Subjects & Chapters Matrix
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left text-sm font-semibold text-gray-700 w-48">Subject / Chapter</th>
                <th className="border p-2 text-center text-sm text-gray-600 w-20">Study</th>
                <th className="border p-2 text-center text-sm text-gray-600 w-20">Revision</th>
                <th className="border p-2 text-center text-sm text-gray-600 w-24">Study Hrs</th>
                <th className="border p-2 text-center text-sm text-gray-600 w-24">Rev. Hrs</th>
                <th className="border p-2 text-center text-sm text-gray-600 w-24">Progress</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => {
                const stats = getSubjectStats(subject);
                const isExpanded = expandedSubjects.has(subject);
                
                return (
                  <React.Fragment key={subject}>
                    {/* Subject Header Row */}
                    <tr className="bg-gradient-to-r from-blue-50 to-purple-50 font-semibold group">
                      <td className="border p-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSubject(subject)}
                            className="flex items-center gap-2 flex-1 text-left hover:text-blue-600"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            <span>{subject}</span>
                            <span className="text-xs text-gray-500">
                              ({stats.totalChapters} chapters)
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <SubjectQuickActions
                              subject={subject}
                              chapterCount={stats.totalChapters}
                              onSetHours={(studyHours, revisionHours) => {
                                subjectChapters.forEach(chapter => {
                                  if (onUpdateChapterHours) {
                                    onUpdateChapterHours(chapter.id, studyHours, revisionHours);
                                  }
                                });
                              }}
                            />
                            {onDeleteSubject && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete all chapters in ${subject}?`)) {
                                    onDeleteSubject(subject);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1"
                                title="Delete subject"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-green-600">{stats.studyCompleted}</span>
                          <span className="text-xs text-gray-400">/</span>
                          <span className="text-xs text-gray-600">{stats.totalChapters}</span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-blue-600">{stats.revisionCompleted}</span>
                          <span className="text-xs text-gray-400">/</span>
                          <span className="text-xs text-gray-600">{stats.totalChapters}</span>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <span className="text-sm font-bold text-purple-600">
                          {stats.totalStudyHours}h
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <span className="text-sm font-bold text-green-600">
                          {stats.totalRevisionHours}h
                        </span>
                      </td>
                      <td className="border p-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                            style={{ 
                              width: `${((stats.studyCompleted + stats.revisionCompleted) / (stats.totalChapters * 2)) * 100}%` 
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Chapter Rows (Expandable) */}
                    {isExpanded && subjectChapters.map(chapter => (
                      <tr key={chapter.id} className={`hover:bg-gray-50 text-sm group ${selectedChapterIds.includes(chapter.id) ? 'bg-purple-50' : ''}`}>
                        <td className="border p-2 pl-8">
                          <div className="flex items-center gap-2">
                            {onToggleChapterSelection && (
                              <input
                                type="checkbox"
                                checked={selectedChapterIds.includes(chapter.id)}
                                onChange={() => onToggleChapterSelection(chapter.id)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                            )}
                            <span className="text-gray-700">{chapter.name}</span>
                            {chapter.confidence === 'low' && (
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            )}
                            {/* Status buttons */}
                            <div className="ml-auto flex items-center gap-2">
                              {/* Study Status Button */}
                              <button
                                onClick={() => handleToggleStudyStatus(chapter)}
                                className={`p-1 rounded transition-colors ${
                                  chapter.studyStatus === 'done' ? 'text-green-600 bg-green-100' :
                                  chapter.studyStatus === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                                  'text-gray-400 hover:text-gray-600'
                                }`}
                                title={`Study: ${chapter.studyStatus || 'not started'}`}
                              >
                                {chapter.studyStatus === 'done' ? <CheckSquare size={16} /> :
                                 chapter.studyStatus === 'in-progress' ? <PlayCircle size={16} /> :
                                 <Square size={16} />}
                              </button>
                              
                              {/* Revision Status Button */}
                              <button
                                onClick={() => handleToggleRevisionStatus(chapter)}
                                className={`p-1 rounded transition-colors ${
                                  chapter.revisionStatus === 'done' ? 'text-green-600 bg-green-100' :
                                  chapter.revisionStatus === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                                  'text-gray-400 hover:text-gray-600'
                                }`}
                                title={`Revision: ${chapter.revisionStatus || 'not started'}`}
                              >
                                {chapter.revisionStatus === 'done' ? <CheckCircle size={16} /> :
                                 chapter.revisionStatus === 'in-progress' ? <PauseCircle size={16} /> :
                                 <Circle size={16} />}
                              </button>
                              
                              {/* Calendar buttons */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                <button
                                  onClick={() => handleAddToCalendar(chapter, 'study')}
                                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                                  title="Add study session to calendar"
                                >
                                  <CalendarPlus className="w-3 h-3" />
                                  Study
                                </button>
                                <button
                                  onClick={() => handleAddToCalendar(chapter, 'revision')}
                                  className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 flex items-center gap-1"
                                  title="Add revision to calendar"
                                >
                                  <CalendarPlus className="w-3 h-3" />
                                  Revise
                                </button>
                              </div>
                              {onResetChapter && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Reset progress for "${chapter.name}"?`)) {
                                      onResetChapter(chapter.id);
                                    }
                                  }}
                                  className="p-1 text-orange-500 hover:text-orange-700"
                                  title="Reset chapter progress"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              )}
                              {onDeleteChapter && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete chapter "${chapter.name}"?`)) {
                                      onDeleteChapter(chapter.id);
                                    }
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Delete chapter"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border p-2 text-center">
                          {getStatusIcon(chapter.studyStatus)}
                        </td>
                        <td className="border p-2 text-center">
                          {getStatusIcon(chapter.revisionStatus)}
                        </td>
                        <td className="border p-2 text-center">
                          {editingCell?.chapterId === chapter.id && editingCell.type === 'study' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempHours}
                                onChange={(e) => setTempHours(parseFloat(e.target.value))}
                                className="w-12 px-1 border rounded"
                                step="0.5"
                                min="0.5"
                              />
                              <button onClick={() => handleSaveHours(chapter)}>
                                <Save className="w-3 h-3 text-green-500" />
                              </button>
                              <button onClick={() => setEditingCell(null)}>
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditHours(chapter.id, 'study', chapter.studyHours || 2)}
                              className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 mx-auto"
                            >
                              {chapter.studyHours || 2}h
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border p-2 text-center">
                          {editingCell?.chapterId === chapter.id && editingCell.type === 'revision' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={tempHours}
                                onChange={(e) => setTempHours(parseFloat(e.target.value))}
                                className="w-12 px-1 border rounded"
                                step="0.5"
                                min="0.5"
                              />
                              <button onClick={() => handleSaveHours(chapter)}>
                                <Save className="w-3 h-3 text-green-500" />
                              </button>
                              <button onClick={() => setEditingCell(null)}>
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditHours(chapter.id, 'revision', chapter.revisionHours || 1)}
                              className="text-green-600 hover:bg-green-50 px-2 py-1 rounded flex items-center gap-1 mx-auto"
                            >
                              {chapter.revisionHours || 1}h
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-gray-200 rounded-full flex-1">
                              <div 
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${
                                    chapter.studyStatus === 'done' ? 100 : 
                                    chapter.studyStatus === 'in-progress' ? 50 : 0
                                  }%` 
                                }}
                              />
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full flex-1">
                              <div 
                                className="h-2 bg-green-500 rounded-full"
                                style={{ 
                                  width: `${
                                    chapter.revisionStatus === 'done' ? 100 : 
                                    chapter.revisionStatus === 'in-progress' ? 50 : 0
                                  }%` 
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
        
        {/* Right Section: Enhanced Calendar with Flexible Views */}
        <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Study Calendar
          </h3>
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Calendar size={18} />
            {showFullCalendar ? 'Hide Full Calendar' : 'Show Full Calendar'}
          </button>
        </div>
        
        {showFullCalendar ? (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <FlexibleCalendar
              chapters={chapters}
              exams={exams}
              plannedTasks={plannerDays.flatMap(day => 
                day.plannedTasks.map(task => ({
                  ...task,
                  date: format(new Date(day.date), 'yyyy-MM-dd')
                }))
              )}
              onDateSelect={(date, type) => {
                // Handle date selection for adding chapters
                console.log('Date selected:', date, type);
              }}
              onChapterStatusUpdate={(chapterId, status) => {
                // This will be connected to proper status update
                onUpdateChapterStatus?.(chapterId, { status: status as any });
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, index) => {
              const tasks = getTasksForDate(date);
              const dayHours = tasks.reduce((sum, task) => sum + (task.plannedMinutes / 60), 0);
              const isExamDay = selectedExamDate && isSameDay(date, selectedExamDate);
              
              return (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-2 min-h-[150px] transition-all ${
                    isExamDay 
                      ? 'border-red-400 bg-red-50 ring-2 ring-red-300' 
                      : 'border-gray-200 bg-gray-50 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-700">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {format(date, 'MMM dd')}
                  </div>
                  
                  {isExamDay && (
                    <div className="text-xs font-bold text-red-600 mb-1">
                      🎯 EXAM DAY
                    </div>
                  )}
                  
                  {dayHours > 0 && (
                    <div className="text-xs font-semibold text-blue-600 mb-1">
                      {dayHours.toFixed(1)}h planned
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {tasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer ${
                          task.taskType === 'study' 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        onClick={() => onStartTask(task)}
                      >
                        <div className="truncate">
                          {task.taskType === 'study' ? '📖' : '🔄'} {task.chapterName}
                        </div>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
      
      {/* Bottom Section: Full Width Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Subject-wise Metrics */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-gray-700 mb-2">Subject-wise Progress</h4>
          <div className="space-y-2">
            {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => {
              const stats = getSubjectStats(subject);
              const remainingStudy = stats.totalStudyHours - stats.completedStudyHours;
              const remainingRevision = stats.totalRevisionHours - stats.completedRevisionHours;
              
              return (
                <div key={subject} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 w-24 truncate">{subject}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Study: </span>
                      <span className="font-semibold text-blue-600">
                        {remainingStudy.toFixed(1)}h left
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revision: </span>
                      <span className="font-semibold text-green-600">
                        {remainingRevision.toFixed(1)}h left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">Overall Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Chapters:</span>
              <span className="font-bold text-lg">{overallStats.totalChapters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Study Hours Left:</span>
              <span className="font-bold text-lg text-blue-600">
                {overallStats.remainingStudyHours.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revision Hours Left:</span>
              <span className="font-bold text-lg text-green-600">
                {overallStats.remainingRevisionHours.toFixed(1)}h
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total Hours:</span>
                <span className="font-bold text-xl text-purple-600">
                  {(overallStats.remainingStudyHours + overallStats.remainingRevisionHours).toFixed(1)}h
                </span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Overall Progress</div>
              <div className="h-3 bg-gray-200 rounded-full">
                <div 
                  className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ 
                    width: `${((overallStats.studyCompleted + overallStats.revisionCompleted) / (overallStats.totalChapters * 2)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Add to Calendar: {showDatePicker.chapter.name}
              </h3>
              <button
                onClick={closeDatePicker}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                showDatePicker.type === 'study' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {showDatePicker.type === 'study' ? '📖 Study Session' : '🔄 Revision Session'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Select a date to schedule this {showDatePicker.type} session:
            </p>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Sun</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Mon</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Tue</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Wed</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Thu</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Fri</div>
              <div className="text-center text-xs font-semibold text-gray-600 py-2">Sat</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date, index) => {
                const tasks = getTasksForDate(date);
                const dayHours = tasks.reduce((sum, task) => sum + (task.plannedMinutes / 60), 0);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const isExamDay = selectedExamDate && isSameDay(date, selectedExamDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 rounded-lg border-2 transition-all text-center
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-100' 
                        : isExamDay
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                      ${isToday ? 'ring-2 ring-purple-400' : ''}
                      ${isExamDay ? 'ring-2 ring-red-300' : ''}
                    `}
                  >
                    <div className="text-sm font-semibold">
                      {format(date, 'd')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(date, 'MMM')}
                    </div>
                    {isExamDay && (
                      <div className="text-xs text-red-600 font-bold mt-1">
                        🎯 Exam
                      </div>
                    )}
                    {dayHours > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        {dayHours.toFixed(1)}h
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeDatePicker}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrixPlannerView;