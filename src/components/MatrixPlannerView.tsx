import React, { useState } from 'react';
import { 
  CheckCircle, Circle, Clock, BookOpen, Target, TrendingUp, 
  Calendar, AlertTriangle, Play, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  RotateCcw, Edit2, Save, X, CalendarPlus, Trash2, RefreshCw, HelpCircle,
  PlayCircle, PauseCircle, CheckSquare, Square, Timer, Plus, Download,
  Grid3x3, BarChart3, Settings, ZoomIn, ZoomOut, CalendarDays, ListTodo
} from 'lucide-react';
import type { Chapter, PlannerDay, PlannerTask, Exam, ChapterAssignment, ActivitySession } from '../types';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import SubjectQuickActions from './SubjectQuickActions';
import FlexibleCalendar from './Calendar/FlexibleCalendar';
import TimerModal from './Timer/TimerModal';
import DailyMetricsPanel from './DailyMetricsPanel';
import ConfirmDialog, { useConfirmDialog } from './ConfirmDialog';
import ChapterScheduler from './ChapterScheduler';
import TodayActivities from './TodayActivities';
import SimpleAnalytics from './SimpleAnalytics';

interface MatrixPlannerViewProps {
  chapters: Chapter[];
  plannerDays: PlannerDay[];
  chapterAssignments: ChapterAssignment[];
  activitySessions?: ActivitySession[];
  activeSession?: ActivitySession;
  onDrop: (e: React.DragEvent, day: PlannerDay) => void;
  onDragOver: (e: React.DragEvent) => void;
  onStartTask: (task: PlannerTask) => void;
  onUpdateChapterHours?: (chapterId: string, studyHours: number, revisionHours: number) => void;
  onUpdateChapterStatus?: (chapterId: string, updates: Partial<Chapter>) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onResetChapter?: (chapterId: string) => void;
  onDeleteSubject?: (subject: string) => void;
  onAddSubject?: (subject: string) => void;
  onScheduleChapter?: (chapterId: string, date: string, activityType: 'study' | 'revision', plannedMinutes: number) => void;
  getAssignmentsForDate?: (date: string) => ChapterAssignment[];
  onStartActivity?: (assignmentId: string) => void;
  onPauseActivity?: (sessionId: string) => void;
  onResumeActivity?: (sessionId: string) => void;
  onCompleteActivity?: (sessionId: string, actualMinutes: number) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
  selectedExamDate?: Date | null;
  selectedChapterIds?: string[];
  onToggleChapterSelection?: (chapterId: string) => void;
  exams?: Exam[];
}

const MatrixPlannerView: React.FC<MatrixPlannerViewProps> = ({
  chapters,
  plannerDays,
  chapterAssignments,
  activitySessions = [],
  activeSession,
  onDrop,
  onDragOver,
  onStartTask,
  onUpdateChapterHours,
  onUpdateChapterStatus,
  onDeleteChapter,
  onResetChapter,
  onDeleteSubject,
  onAddSubject,
  onScheduleChapter,
  getAssignmentsForDate,
  onStartActivity,
  onPauseActivity,
  onResumeActivity,
  onCompleteActivity,
  onDeleteAssignment,
  selectedExamDate,
  selectedChapterIds = [],
  onToggleChapterSelection,
  exams = []
}) => {
  // State Management
  const [activeView, setActiveView] = useState<'today' | 'chapters' | 'calendar' | 'progress'>('today');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ chapterId: string; type: 'study' | 'revision' } | null>(null);
  const [tempHours, setTempHours] = useState<number>(0);
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();
  const [showDatePicker, setShowDatePicker] = useState<{ chapter: Chapter; type: 'study' | 'revision' } | null>(null);
  const [calendarZoom, setCalendarZoom] = useState<'small' | 'medium' | 'large'>('medium');
  const [showTimer, setShowTimer] = useState(false);
  const [timerConfig, setTimerConfig] = useState<{
    chapter?: Chapter;
    chapters?: Chapter[];
    task?: PlannerTask;
    mode: 'single' | 'subject' | 'daily';
    sessionType?: 'study' | 'revision';
  }>({ mode: 'single' });
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [chapterToSchedule, setChapterToSchedule] = useState<Chapter | null>(null);

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
    completedHours: chapters.reduce((sum, c) => sum + (c.completedStudyHours || 0) + (c.completedRevisionHours || 0), 0),
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

  const handleEditHours = (chapterId: string, type: 'study' | 'revision', currentHours: number) => {
    setEditingCell({ chapterId, type });
    setTempHours(currentHours);
  };

  const handleSaveHours = (chapter: Chapter) => {
    if (editingCell && onUpdateChapterStatus) {
      const updates: Partial<Chapter> = {};
      
      if (editingCell.type === 'study') {
        updates.studyHours = tempHours;
      } else if (editingCell.type === 'revision') {
        updates.revisionHours = tempHours;
      }
      
      onUpdateChapterStatus(chapter.id, updates);
    }
    setEditingCell(null);
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim() && onAddSubject) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName('');
      setShowAddSubjectModal(false);
    }
  };

  const handleExportToCalendar = () => {
    // Export functionality
    console.log('Exporting to calendar...');
  };

  const openTimerForTask = (task: PlannerTask) => {
    const chapter = chapters.find(c => c.id === task.chapterId);
    if (chapter) {
      setTimerConfig({
        chapter,
        task,
        mode: 'single',
        sessionType: task.taskType as 'study' | 'revision'
      });
      setShowTimer(true);
    }
  };

  const openTimerForChapter = (chapter: Chapter, sessionType: 'study' | 'revision') => {
    setTimerConfig({
      chapter,
      mode: 'single',
      sessionType
    });
    setShowTimer(true);
  };

  const getCellSizeClass = () => {
    switch (calendarZoom) {
      case 'small': return 'h-32';
      case 'medium': return 'h-40';
      case 'large': return 'h-52';
      default: return 'h-40';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-7 h-7 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-800">Matrix Study Planner</h2>
              <button
                onClick={() => {/* Show tutorial */}}
                className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50"
                title="Help & Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* View Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('today')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeView === 'today'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                <span className="hidden sm:inline">Today</span>
              </button>
              <button
                onClick={() => setActiveView('chapters')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeView === 'chapters'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Chapters</span>
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeView === 'calendar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => setActiveView('progress')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  activeView === 'progress'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Collapsible Sidebar - Only show in chapters view */}
        {activeView === 'chapters' && (
          <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r transition-all duration-300 flex-shrink-0 shadow-lg`}>
            <div className="p-4 border-b flex items-center justify-between">
              {!isSidebarCollapsed && (
                <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
            
            {!isSidebarCollapsed && (
              <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-4rem)]">
                {/* Add Subject Button */}
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Subject
                </button>
                
                {/* Subject List with counts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Subjects Overview</h4>
                  {Object.entries(chaptersBySubject).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No subjects added yet
                    </div>
                  ) : (
                    Object.entries(chaptersBySubject).map(([subject, chapters]) => {
                      const stats = getSubjectStats(subject);
                      return (
                        <div key={subject} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700">{subject}</span>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              {chapters.length} ch
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                            <div>Study: {stats.studyCompleted === stats.totalChapters ? '✓' : stats.studyCompleted > 0 ? `${Math.round((stats.studyCompleted / stats.totalChapters) * 100)}%` : '0%'}</div>
                            <div>Revision: {stats.revisionCompleted === stats.totalChapters ? '✓' : stats.revisionCompleted > 0 ? `${Math.round((stats.revisionCompleted / stats.totalChapters) * 100)}%` : '0%'}</div>
                          </div>
                          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all"
                              style={{ 
                                width: `${stats.totalChapters > 0 
                                  ? ((stats.studyCompleted + stats.revisionCompleted) / (stats.totalChapters * 2)) * 100 
                                  : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Overall Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Chapters:</span>
                      <span className="font-semibold">{overallStats.totalChapters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Study Progress:</span>
                      <span className="font-semibold text-blue-600">
                        {overallStats.totalChapters > 0 
                          ? `${Math.round((overallStats.studyCompleted / overallStats.totalChapters) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revision Progress:</span>
                      <span className="font-semibold text-green-600">
                        {overallStats.totalChapters > 0 
                          ? `${Math.round((overallStats.revisionCompleted / overallStats.totalChapters) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="font-semibold text-purple-600">{overallStats.completedHours.toFixed(1)} hours</span>
                    </div>
                  </div>
                </div>
                
                {/* Export Button */}
                <button
                  onClick={handleExportToCalendar}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Plan
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Chapters View */}
          {activeView === 'chapters' && (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <h3 className="text-xl font-bold">Chapter Matrix</h3>
                  <p className="text-sm opacity-90 mt-1">Manage your subjects and chapters, track progress</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          <input 
                            type="checkbox"
                            className="rounded border-gray-300"
                            onChange={(e) => {
                              if (onToggleChapterSelection) {
                                chapters.forEach(c => onToggleChapterSelection(c.id));
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Subject / Chapter
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Study Progress
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Revision Progress
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Estimated Time
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[200px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => {
                        const isExpanded = expandedSubjects.has(subject);
                        const stats = getSubjectStats(subject);
                        
                        return (
                          <React.Fragment key={subject}>
                            {/* Subject Row */}
                            <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleSubject(subject)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-800">{subject}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all"
                                      style={{ width: `${stats.totalChapters > 0 ? (stats.studyCompleted / stats.totalChapters) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {stats.studyCompleted === stats.totalChapters ? '✓ Complete' : 
                                     stats.studyCompleted > 0 ? `${Math.round((stats.studyCompleted / stats.totalChapters) * 100)}%` : 
                                     'Not Started'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all"
                                      style={{ width: `${stats.totalChapters > 0 ? (stats.revisionCompleted / stats.totalChapters) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {stats.revisionCompleted === stats.totalChapters ? '✓ Complete' : 
                                     stats.revisionCompleted > 0 ? `${Math.round((stats.revisionCompleted / stats.totalChapters) * 100)}%` : 
                                     'Not Started'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {(stats.totalStudyHours + stats.totalRevisionHours).toFixed(1)} hours
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      // Add all chapters from this subject to schedule
                                      const firstChapter = subjectChapters[0];
                                      if (firstChapter) {
                                        setChapterToSchedule(firstChapter);
                                        setShowScheduler(true);
                                      }
                                    }}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                    title="Schedule subject"
                                  >
                                    <CalendarDays size={18} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteSubject && showConfirm(
                                      'Delete Subject',
                                      `Are you sure you want to delete "${subject}" and all its chapters? This action cannot be undone.`,
                                      () => onDeleteSubject(subject),
                                      'danger'
                                    )}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete subject"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Chapter Rows */}
                            {isExpanded && subjectChapters.map(chapter => (
                              <tr key={chapter.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 pl-8">
                                  <input
                                    type="checkbox"
                                    checked={selectedChapterIds.includes(chapter.id)}
                                    onChange={() => onToggleChapterSelection?.(chapter.id)}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                                <td className="px-4 py-3 pl-8 text-gray-700">{chapter.name}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => {
                                      if (onUpdateChapterStatus) {
                                        const nextStatus = 
                                          chapter.studyStatus === 'done' ? 'not-done' :
                                          chapter.studyStatus === 'in-progress' ? 'done' : 'in-progress';
                                        onUpdateChapterStatus(chapter.id, { studyStatus: nextStatus });
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      chapter.studyStatus === 'done' 
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                        : chapter.studyStatus === 'in-progress'
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {chapter.studyStatus === 'done' ? '✓ Complete' : 
                                     chapter.studyStatus === 'in-progress' ? '🔄 Working' : '⭕ Ready'}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => {
                                      if (onUpdateChapterStatus) {
                                        const nextStatus = 
                                          chapter.revisionStatus === 'done' ? 'not-done' :
                                          chapter.revisionStatus === 'in-progress' ? 'done' : 'in-progress';
                                        onUpdateChapterStatus(chapter.id, { revisionStatus: nextStatus });
                                      }
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      chapter.revisionStatus === 'done' 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : chapter.revisionStatus === 'in-progress'
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {chapter.revisionStatus === 'done' ? '✓ Complete' : 
                                     chapter.revisionStatus === 'in-progress' ? '🔄 Working' : '⭕ Ready'}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-sm text-gray-700">
                                      📚 {chapter.studyHours || 2}h + 🔄 {chapter.revisionHours || 1}h
                                    </span>
                                    <button
                                      onClick={() => {
                                        setChapterToSchedule(chapter);
                                        setShowScheduler(true);
                                      }}
                                      className="ml-1 p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                      title="Edit time estimates"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Primary Actions Group */}
                                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                                      <button
                                        onClick={() => {
                                          setChapterToSchedule(chapter);
                                          setShowScheduler(true);
                                        }}
                                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
                                        title="Schedule activity on calendar"
                                      >
                                        <CalendarPlus size={20} />
                                      </button>
                                    </div>
                                    
                                    {/* Secondary Actions Group */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => onResetChapter?.(chapter.id)}
                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                        title="Reset progress"
                                      >
                                        <RotateCcw size={18} />
                                      </button>
                                      <button
                                        onClick={() => onDeleteChapter && showConfirm(
                                          'Delete Chapter',
                                          `Are you sure you want to delete "${chapter.name}"? This will remove all progress and cannot be undone.`,
                                          () => onDeleteChapter(chapter.id),
                                          'danger'
                                        )}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete chapter"
                                      >
                                        <Trash2 size={18} />
                                      </button>
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
            </div>
          )}
          
          {/* Today's Activities View */}
          {activeView === 'today' && (
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <TodayActivities
                  assignments={chapterAssignments}
                  chapters={chapters}
                  activeSession={activeSession}
                  onStartActivity={(assignmentId) => onStartActivity?.(assignmentId)}
                  onPauseActivity={(sessionId) => onPauseActivity?.(sessionId)}
                  onResumeActivity={(sessionId) => onResumeActivity?.(sessionId)}
                  onCompleteActivity={(sessionId, actualMinutes) => onCompleteActivity?.(sessionId, actualMinutes)}
                  getAssignmentsForDate={(date) => getAssignmentsForDate?.(date) || []}
                  onDeleteAssignment={(assignmentId) => onDeleteAssignment?.(assignmentId)}
                />
              </div>
            </div>
          )}
          
          {/* Calendar View */}
          {activeView === 'calendar' && (
            <div className="p-6 h-full">
              <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Study Calendar</h3>
                    <p className="text-sm opacity-90 mt-1">View and manage your study schedule</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarZoom('small')}
                      className={`p-2 rounded ${calendarZoom === 'small' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="Small cells"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={() => setCalendarZoom('medium')}
                      className={`p-2 rounded ${calendarZoom === 'medium' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="Medium cells"
                    >
                      <Grid3x3 size={20} />
                    </button>
                    <button
                      onClick={() => setCalendarZoom('large')}
                      className={`p-2 rounded ${calendarZoom === 'large' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="Large cells"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  <FlexibleCalendar
                    chapters={chapters}
                    exams={exams}
                    chapterAssignments={chapterAssignments}
                    plannedTasks={plannerDays.flatMap(day => 
                      day.plannedTasks.map(task => ({
                        ...task,
                        date: format(new Date(day.date), 'yyyy-MM-dd')
                      }))
                    )}
                    onDateSelect={(date, type) => {
                      console.log('Date selected:', date, type);
                    }}
                    onChapterStatusUpdate={(chapterId, status) => {
                      onUpdateChapterStatus?.(chapterId, { status: status as any });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Progress View - Simplified */}
          {activeView === 'progress' && (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <SimpleAnalytics
                  chapters={chapters}
                  assignments={chapterAssignments}
                  exams={exams}
                  currentStreak={3} // TODO: Calculate from actual data
                  level={2} // TODO: Calculate from user profile
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Timer Modal */}
      {showTimer && (
        <TimerModal
          isOpen={showTimer}
          onClose={() => setShowTimer(false)}
          config={timerConfig}
          onComplete={(actualMinutes) => {
            if (timerConfig.chapter && onUpdateChapterStatus) {
              const updates: Partial<Chapter> = {};
              if (timerConfig.sessionType === 'study') {
                updates.actualStudyHours = (timerConfig.chapter.actualStudyHours || 0) + (actualMinutes / 60);
              } else {
                updates.actualRevisionHours = (timerConfig.chapter.actualRevisionHours || 0) + (actualMinutes / 60);
              }
              onUpdateChapterStatus(timerConfig.chapter.id, updates);
            }
            setShowTimer(false);
          }}
        />
      )}
      
      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter subject name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddSubject}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Subject
              </button>
              <button
                onClick={() => {
                  setNewSubjectName('');
                  setShowAddSubjectModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chapter Scheduler Modal */}
      <ChapterScheduler
        isOpen={showScheduler}
        chapter={chapterToSchedule}
        existingSchedules={chapterAssignments.map(a => ({
          date: a.date,
          chapterId: a.chapterId,
          activityType: a.activityType
        }))}
        onClose={() => {
          setShowScheduler(false);
          setChapterToSchedule(null);
        }}
        onSchedule={(chapterId, date, activityType, duration) => {
          // Schedule the chapter activity using store action
          const dateStr = format(date, 'yyyy-MM-dd');
          
          if (onScheduleChapter) {
            // Use the provided duration or default to chapter's planned hours
            const chapter = chapters.find(c => c.id === chapterId);
            const defaultDuration = chapter 
              ? (activityType === 'study' ? chapter.studyHours * 60 : chapter.revisionHours * 60)
              : 60;
            
            onScheduleChapter(chapterId, dateStr, activityType, duration || defaultDuration);
            
            // Update chapter status to reflect it's been scheduled
            if (chapter && onUpdateChapterStatus) {
              if (activityType === 'study') {
                onUpdateChapterStatus(chapterId, {
                  plannedStatus: 'scheduled',
                  studyStatus: chapter.studyStatus === 'not-done' ? 'in-progress' : chapter.studyStatus
                });
              } else {
                onUpdateChapterStatus(chapterId, {
                  plannedStatus: 'scheduled',
                  revisionStatus: chapter.revisionStatus === 'not-done' ? 'in-progress' : chapter.revisionStatus
                });
              }
            }
          }
          
          setShowScheduler(false);
          setChapterToSchedule(null);
        }}
      />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={hideConfirm}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
    </div>
  );
};

export default MatrixPlannerView;