import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, Clock, BookOpen, Target, 
  CheckCircle, Play, Pause, RotateCcw, Zap, Brain, Award,
  ChevronLeft, ChevronRight, X, HelpCircle, Grid3x3, CalendarDays, Edit2
} from 'lucide-react';
import type { Chapter, PlannerDay, PlannerTask } from '../types';
import { format, addDays, differenceInDays, startOfDay, isSameDay, isWeekend } from 'date-fns';
import PlannerTutorial from '../components/PlannerTutorial';
import MatrixPlannerView from '../components/MatrixPlannerView';
import QuickActionsToolbar from '../components/QuickActionsToolbar';
import StudyPlanManager from '../components/StudyPlanManager';
import EnhancedMatrixEditor from '../components/EnhancedMatrixEditor';
import FlexibleCalendar from '../components/Calendar/FlexibleCalendar';

const SmartPlanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { 
    chapters, exams, examGroups, offDays, studyPlans, activeStudyPlanId,
    addExam, addChapter, updateChapter, deleteChapter, 
    addStudyPlan, updateStudyPlan, deleteStudyPlan, setActiveStudyPlan, duplicateStudyPlan
  } = useStore();
  
  // Get view from URL param if provided
  const viewParam = searchParams.get('view') as 'week' | 'month' | 'list' | 'matrix' | 'plans' | 'editor' | null;
  
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [plannerDays, setPlannerDays] = useState<PlannerDay[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfDay(new Date()));
  const [draggedChapter, setDraggedChapter] = useState<Chapter | null>(null);
  const [draggedTaskType, setDraggedTaskType] = useState<'study' | 'revision'>('study');
  const [activeTask, setActiveTask] = useState<PlannerTask | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedView, setSelectedView] = useState<'week' | 'month' | 'list' | 'matrix' | 'plans' | 'editor'>(viewParam || 'plans');
  const [showTutorial, setShowTutorial] = useState(false);
  const [subjectDefaults] = useState<Map<string, { study: number; revision: number }>>(new Map());
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentStudyPlan, setCurrentStudyPlan] = useState<any>(null);
  
  const timerInterval = useRef<number | null>(null);
  
  // Add sample exams if none exist
  useEffect(() => {
    if (exams.length === 0) {
      // Add sample exams for demonstration
      const today = new Date();
      addExam({
        name: 'Mid-Term Mathematics',
        date: addDays(today, 14).toISOString(),
        type: 'mid-term',
        subjects: ['Mathematics']
      });
      addExam({
        name: 'Quarterly Exam - All Subjects',
        date: addDays(today, 30).toISOString(),
        type: 'quarterly',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology']
      });
      addExam({
        name: 'Weekly Test - Science',
        date: addDays(today, 7).toISOString(),
        type: 'weekly',
        subjects: ['Physics', 'Chemistry']
      });
    }
  }, [exams.length, addExam]);

  // Initialize planner days - generate for next 30 days always
  useEffect(() => {
    const today = startOfDay(new Date());
    let endDate = addDays(today, 30); // Default to next 30 days
    
    if (selectedExam && exams.length > 0) {
      const exam = exams.find(e => e.id === selectedExam);
      if (exam) {
        // Extend end date to exam date if it's further than 30 days
        const examDate = new Date(exam.date);
        if (examDate > endDate) {
          endDate = examDate;
        }
      }
    }
    
    const days = generatePlannerDays(today, endDate);
    setPlannerDays(days);
  }, [selectedExam, exams, offDays]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && activeTask) {
      timerInterval.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerInterval.current) {
      window.clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) window.clearInterval(timerInterval.current);
    };
  }, [isTimerRunning, activeTask]);

  const generatePlannerDays = (startDate: Date, endDate: Date): PlannerDay[] => {
    const days: PlannerDay[] = [];
    let currentDate = startOfDay(startDate);
    
    while (currentDate <= endDate) {
      const isOffDay = offDays.some(off => isSameDay(new Date(off.date), currentDate));
      const isExamDay = exams.some(exam => isSameDay(new Date(exam.date), currentDate));
      
      let dayType: PlannerDay['dayType'] = 'study';
      let availableHours = 4; // Default study hours
      
      if (isExamDay) {
        dayType = 'exam';
        availableHours = 2; // Less time on exam day
      } else if (isOffDay) {
        dayType = 'off';
        availableHours = 0;
      } else if (isWeekend(currentDate)) {
        dayType = 'weekend';
        availableHours = 6; // More time on weekends
      } else if (differenceInDays(new Date(endDate), currentDate) <= 3) {
        dayType = 'revision';
        availableHours = 5; // More time for revision days
      }
      
      days.push({
        id: `day-${currentDate.getTime()}`,
        date: currentDate.toISOString(),
        dayType,
        availableHours,
        plannedTasks: [],
        actualTimeSpent: 0
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  const handleDragStart = (chapter: Chapter, taskType: 'study' | 'revision') => {
    setDraggedChapter(chapter);
    setDraggedTaskType(taskType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: PlannerDay) => {
    e.preventDefault();
    if (!draggedChapter) return;
    
    const defaultHours = subjectDefaults.get(draggedChapter.subject) || { study: 2, revision: 1 };
    const plannedMinutes = draggedTaskType === 'study' 
      ? (draggedChapter.studyHours || defaultHours.study) * 60
      : (draggedChapter.revisionHours || defaultHours.revision) * 60;
    
    const newTask: PlannerTask = {
      id: `task-${Date.now()}`,
      chapterId: draggedChapter.id,
      subject: draggedChapter.subject,
      chapterName: draggedChapter.name,
      taskType: draggedTaskType,
      plannedMinutes,
      status: 'scheduled',
      confidence: draggedChapter.confidence || 'medium'
    };
    
    const updatedDays = plannerDays.map(d => {
      if (d.id === day.id) {
        return {
          ...d,
          plannedTasks: [...d.plannedTasks, newTask]
        };
      }
      return d;
    });
    
    setPlannerDays(updatedDays);
    setDraggedChapter(null);
  };

  const removeTask = (dayId: string, taskId: string) => {
    const updatedDays = plannerDays.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          plannedTasks: d.plannedTasks.filter(t => t.id !== taskId)
        };
      }
      return d;
    });
    setPlannerDays(updatedDays);
  };

  // Handler for updating chapter hours in Matrix view
  const handleUpdateChapterHours = (chapterId: string, studyHours: number, revisionHours: number) => {
    updateChapter(chapterId, {
      studyHours,
      revisionHours,
    });
  };

  // Handler for deleting a chapter
  const handleDeleteChapter = (chapterId: string) => {
    deleteChapter(chapterId);
  };

  // Handler for resetting a chapter
  const handleResetChapter = (chapterId: string) => {
    updateChapter(chapterId, {
      studyStatus: 'not-done',
      revisionStatus: 'not-done',
      completedStudyHours: 0,
      completedRevisionHours: 0,
      status: 'not_started',
    });
  };

  // Handler for deleting all chapters of a subject
  const handleDeleteSubject = (subject: string) => {
    const subjectChapters = chapters.filter(c => c.subject === subject);
    subjectChapters.forEach(chapter => {
      deleteChapter(chapter.id);
    });
  };

  // Handler for adding a new subject
  const handleAddSubject = (subjectName: string) => {
    // Add a default first chapter when creating a new subject
    addChapter({
      subject: subjectName,
      name: 'Chapter 1',
      estimatedHours: 3,
      studyHours: 2,
      revisionHours: 1,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      studyStatus: 'not-done',
      revisionStatus: 'not-done'
    });
  };

  // Handler for bulk chapter updates
  const handleBulkUpdate = (chapterIds: string[], updates: Partial<Chapter>) => {
    chapterIds.forEach(id => {
      updateChapter(id, updates);
    });
  };

  // Handler for reordering chapters (placeholder for now)
  const handleReorderChapters = (subject: string, newOrder: string[]) => {
    console.log('Reorder not yet implemented:', subject, newOrder);
  };

  const startTask = (task: PlannerTask) => {
    setActiveTask(task);
    setElapsedTime(0);
    setIsTimerRunning(true);
    
    // Update task status
    const updatedDays = plannerDays.map(day => ({
      ...day,
      plannedTasks: day.plannedTasks.map(t => 
        t.id === task.id ? { ...t, status: 'in-progress' as const } : t
      )
    }));
    setPlannerDays(updatedDays);
  };

  const pauseTask = () => {
    setIsTimerRunning(false);
  };

  const completeTask = () => {
    if (!activeTask) return;
    
    const updatedDays = plannerDays.map(day => ({
      ...day,
      plannedTasks: day.plannedTasks.map(t => 
        t.id === activeTask.id 
          ? { ...t, status: 'completed' as const, actualMinutes: Math.floor(elapsedTime / 60) }
          : t
      )
    }));
    setPlannerDays(updatedDays);
    
    setActiveTask(null);
    setElapsedTime(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getChapterStats = () => {
    const stats = {
      totalChapters: chapters.length,
      studyNotDone: chapters.filter(c => !c.studyStatus || c.studyStatus === 'not-done').length,
      studyInProgress: chapters.filter(c => c.studyStatus === 'in-progress').length,
      studyDone: chapters.filter(c => c.studyStatus === 'done').length,
      revisionNotDone: chapters.filter(c => !c.revisionStatus || c.revisionStatus === 'not-done').length,
      revisionInProgress: chapters.filter(c => c.revisionStatus === 'in-progress').length,
      revisionDone: chapters.filter(c => c.revisionStatus === 'done').length,
      totalStudyHours: chapters.reduce((sum, c) => sum + (c.studyHours || c.estimatedHours || 2), 0),
      totalRevisionHours: chapters.reduce((sum, c) => sum + (c.revisionHours || c.estimatedHours * 0.5 || 1), 0),
      completedStudyHours: chapters.reduce((sum, c) => sum + (c.completedStudyHours || 0), 0),
      completedRevisionHours: chapters.reduce((sum, c) => sum + (c.completedRevisionHours || 0), 0)
    };
    return stats;
  };

  const stats = getChapterStats();
  const progressPercentage = chapters.length > 0 
    ? Math.round(((stats.studyDone + stats.revisionDone) / (stats.totalChapters * 2)) * 100)
    : 0;

  // Group chapters by subject
  const chaptersBySubject = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  // Bulk operation handlers for QuickActionsToolbar
  const handleSetAllHours = (studyHours: number, revisionHours: number) => {
    const chaptersToUpdate = selectedChapterIds.length > 0 
      ? chapters.filter(c => selectedChapterIds.includes(c.id))
      : chapters;
    
    chaptersToUpdate.forEach(chapter => {
      updateChapter(chapter.id, { studyHours, revisionHours });
    });
    
    // Clear selection after bulk update
    setSelectedChapterIds([]);
  };

  const handleApplyTemplate = (templateId: string) => {
    const SUBJECT_TEMPLATES: Record<string, Record<string, { study: number; revision: number }>> = {
      math: { Mathematics: { study: 3, revision: 2 } },
      science: { 
        Physics: { study: 2.5, revision: 1.5 }, 
        Chemistry: { study: 2.5, revision: 1.5 }, 
        Biology: { study: 2, revision: 1 }
      },
      languages: { 
        English: { study: 1.5, revision: 1 }, 
        Hindi: { study: 1.5, revision: 1 }
      },
      social: { 
        'History & Civics': { study: 2, revision: 1.5 }, 
        Geography: { study: 2, revision: 1 }
      }
    };

    const template = SUBJECT_TEMPLATES[templateId];
    if (template) {
      Object.entries(template).forEach(([subject, hours]) => {
        const subjectChapters = chapters.filter(c => c.subject === subject);
        subjectChapters.forEach(chapter => {
          updateChapter(chapter.id, { 
            studyHours: hours.study, 
            revisionHours: hours.revision 
          });
        });
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedChapterIds.length > 0) {
      if (window.confirm(`Delete ${selectedChapterIds.length} selected chapters?`)) {
        selectedChapterIds.forEach(id => deleteChapter(id));
        setSelectedChapterIds([]);
      }
    }
  };

  const handleRecalibrate = () => {
    // Trigger recalculation of all metrics and plans
    const endDate = selectedExam ? exams.find(e => e.id === selectedExam)?.date : addDays(new Date(), 30).toISOString();
    if (endDate) {
      const newPlan = generatePlannerDays(new Date(), new Date(endDate));
      setPlannerDays(newPlan);
    }
  };

  const handleExportData = () => {
    const exportData = {
      chapters: chapters,
      selectedChapterIds: selectedChapterIds,
      studyPlan: plannerDays,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-plan-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const handleImportData = (data: any) => {
    if (data.chapters) {
      // This would need to be implemented in the store
      console.log('Importing chapters:', data.chapters);
      alert('Import functionality will be implemented soon!');
    }
  };

  const handleSelectAll = () => {
    setSelectedChapterIds(chapters.map(c => c.id));
  };

  const handleClearSelection = () => {
    setSelectedChapterIds([]);
  };

  const toggleChapterSelection = (chapterId: string) => {
    setSelectedChapterIds(prev => 
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Smart Study Planner
              </h1>
              <p className="text-gray-600 mt-1">Intelligent exam preparation with adaptive scheduling</p>
            </div>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Exam Selection */}
          <div className="flex items-center gap-4">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select an exam to plan for</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {format(new Date(exam.date), 'MMM dd, yyyy')}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedView('plans')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'plans' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CalendarDays size={18} />
                Plans
              </button>
              <button
                onClick={() => setSelectedView('matrix')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'matrix' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 size={18} />
                Matrix
              </button>
              <button
                onClick={() => setSelectedView('editor')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'editor' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Edit2 size={18} />
                Editor
              </button>
              <button
                onClick={() => setSelectedView('week')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedView === 'week' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedView === 'list' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <HelpCircle size={18} />
                Tutorial
              </button>
            </div>
          </div>
        </div>

        {/* Overall Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.totalChapters}</span>
            </div>
            <p className="text-sm text-gray-600">Total Chapters</p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">✓ {stats.studyDone} studied</span>
              <span className="text-orange-500 ml-2">⟲ {stats.studyInProgress} in progress</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">
                {stats.totalStudyHours}h
              </span>
            </div>
            <p className="text-sm text-gray-600">Study Hours Needed</p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(stats.completedStudyHours / stats.totalStudyHours) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.completedStudyHours}h completed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <RotateCcw className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">
                {stats.totalRevisionHours}h
              </span>
            </div>
            <p className="text-sm text-gray-600">Revision Hours</p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                  style={{ width: `${(stats.completedRevisionHours / stats.totalRevisionHours) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{stats.completedRevisionHours}h completed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">
                {progressPercentage}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Keep going! 💪</span>
            </div>
          </div>
        </div>

        {/* Active Task Timer */}
        {activeTask && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Currently Studying</h3>
                <p className="text-2xl font-bold">{activeTask.chapterName}</p>
                <p className="text-sm opacity-90">{activeTask.subject} • {activeTask.taskType === 'study' ? '📖 Study' : '🔄 Revision'}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <div className="flex items-center gap-2">
                  {isTimerRunning ? (
                    <button
                      onClick={pauseTask}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2"
                    >
                      <Pause size={20} />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTimerRunning(true)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2"
                    >
                      <Play size={20} />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={completeTask}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Toolbar - Show only in matrix view */}
        {selectedView === 'matrix' && showQuickActions && (
          <QuickActionsToolbar
            onSetAllHours={handleSetAllHours}
            onApplyTemplate={handleApplyTemplate}
            onBulkDelete={handleBulkDelete}
            onRecalibrate={handleRecalibrate}
            onExport={handleExportData}
            onImport={handleImportData}
            totalChapters={chapters.length}
            selectedChapters={selectedChapterIds}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        )}

        {/* Main Content Area */}
        {selectedView === 'plans' ? (
          <StudyPlanManager
            plans={studyPlans || []}
            activeStudyPlanId={activeStudyPlanId}
            examGroups={examGroups || []}
            onCreatePlan={(plan) => addStudyPlan(plan)}
            onUpdatePlan={(id, updates) => updateStudyPlan(id, updates)}
            onDeletePlan={(id) => deleteStudyPlan(id)}
            onSetActivePlan={(id) => setActiveStudyPlan(id)}
            onDuplicatePlan={(id) => {
              const plan = studyPlans?.find(p => p.id === id);
              if (plan) {
                duplicateStudyPlan(id, `${plan.name} (Copy)`);
              }
            }}
            onOpenPlan={(plan) => {
              setCurrentStudyPlan(plan);
              setSelectedView('matrix');
            }}
          />
        ) : selectedView === 'matrix' ? (
          <MatrixPlannerView 
            chapters={chapters}
            plannerDays={plannerDays}
            exams={exams}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onStartTask={startTask}
            onUpdateChapterHours={handleUpdateChapterHours}
            onUpdateChapterStatus={updateChapter}
            onDeleteChapter={handleDeleteChapter}
            onResetChapter={handleResetChapter}
            onDeleteSubject={handleDeleteSubject}
            selectedExamDate={selectedExam && exams.find(e => e.id === selectedExam) ? new Date(exams.find(e => e.id === selectedExam)!.date) : null}
            selectedChapterIds={selectedChapterIds}
            onToggleChapterSelection={toggleChapterSelection}
          />
        ) : selectedView === 'editor' ? (
          <EnhancedMatrixEditor
            chapters={chapters}
            onUpdateChapter={updateChapter}
            onAddChapter={addChapter}
            onDeleteChapter={deleteChapter}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onBulkUpdate={handleBulkUpdate}
            onReorderChapters={handleReorderChapters}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapter Catalog (Draggable) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Chapter Catalog
              </h3>
              
              {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => (
                <div key={subject} className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{subject}</h4>
                  <div className="space-y-2">
                    {subjectChapters.map(chapter => (
                      <div
                        key={chapter.id}
                        className="border border-gray-200 rounded-lg p-2 cursor-move hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={() => handleDragStart(chapter, 'study')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800 truncate flex-1">
                            {chapter.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {chapter.studyStatus === 'done' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {chapter.revisionStatus === 'done' && (
                              <RotateCcw className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(chapter, 'study');
                            }}
                          >
                            📖 Study ({chapter.studyHours || 2}h)
                          </button>
                          <button
                            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(chapter, 'revision');
                            }}
                          >
                            🔄 Revise ({chapter.revisionHours || 1}h)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planner Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Study Schedule
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    {format(currentWeekStart, 'MMM dd')} - {format(addDays(currentWeekStart, 6), 'MMM dd, yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Week View */}
              {selectedView === 'week' && (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = addDays(currentWeekStart, i);
                    const day = plannerDays.find(d => isSameDay(new Date(d.date), date));
                    
                    return (
                      <div
                        key={i}
                        className={`border rounded-lg p-2 min-h-[200px] ${
                          day?.dayType === 'off' ? 'bg-gray-50' :
                          day?.dayType === 'exam' ? 'bg-red-50' :
                          day?.dayType === 'weekend' ? 'bg-blue-50' :
                          day?.dayType === 'revision' ? 'bg-green-50' :
                          'bg-white'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => day && handleDrop(e, day)}
                      >
                        <div className="font-semibold text-sm text-gray-700 mb-1">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {format(date, 'MMM dd')}
                        </div>
                        
                        {day && (
                          <>
                            <div className="text-xs text-gray-600 mb-2">
                              {day.availableHours}h available
                            </div>
                            
                            <div className="space-y-1">
                              {day.plannedTasks.map(task => (
                                <div
                                  key={task.id}
                                  className={`text-xs p-1 rounded ${
                                    task.taskType === 'study' 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-green-100 text-green-700'
                                  } ${
                                    task.status === 'completed' ? 'opacity-50 line-through' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate flex-1">
                                      {task.taskType === 'study' ? '📖' : '🔄'} {task.chapterName}
                                    </span>
                                    <button
                                      onClick={() => removeTask(day.id, task.id)}
                                      className="ml-1 hover:text-red-500"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px]">
                                      {Math.floor(task.plannedMinutes / 60)}h {task.plannedMinutes % 60}m
                                    </span>
                                    {task.status === 'scheduled' && (
                                      <button
                                        onClick={() => startTask(task)}
                                        className="hover:bg-blue-200 p-1 rounded"
                                      >
                                        <Play size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {selectedView === 'list' && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {plannerDays.map(day => (
                    <div
                      key={day.id}
                      className={`border rounded-lg p-4 ${
                        day.dayType === 'off' ? 'bg-gray-50' :
                        day.dayType === 'exam' ? 'bg-red-50' :
                        day.dayType === 'weekend' ? 'bg-blue-50' :
                        day.dayType === 'revision' ? 'bg-green-50' :
                        'bg-white'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-800">
                            {format(new Date(day.date), 'EEEE, MMMM dd, yyyy')}
                          </span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${
                            day.dayType === 'exam' ? 'bg-red-200 text-red-700' :
                            day.dayType === 'revision' ? 'bg-green-200 text-green-700' :
                            day.dayType === 'weekend' ? 'bg-blue-200 text-blue-700' :
                            day.dayType === 'off' ? 'bg-gray-200 text-gray-700' :
                            'bg-purple-200 text-purple-700'
                          }`}>
                            {day.dayType.charAt(0).toUpperCase() + day.dayType.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {day.availableHours}h available • {day.plannedTasks.length} tasks
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {day.plannedTasks.map(task => (
                          <div
                            key={task.id}
                            className={`border rounded-lg p-2 ${
                              task.taskType === 'study' 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-green-50 border-green-200'
                            } ${
                              task.status === 'completed' ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {task.chapterName}
                              </span>
                              <button
                                onClick={() => removeTask(day.id, task.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-600">
                              {task.subject} • {task.taskType === 'study' ? '📖 Study' : '🔄 Revision'}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {Math.floor(task.plannedMinutes / 60)}h {task.plannedMinutes % 60}m
                              </span>
                              {task.status === 'scheduled' && (
                                <button
                                  onClick={() => startTask(task)}
                                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                >
                                  Start
                                </button>
                              )}
                              {task.status === 'completed' && (
                                <span className="text-xs text-green-600">✓ Done</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Motivational Section */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">You're doing great! 🌟</h3>
              <p className="opacity-90">
                {stats.studyDone} chapters studied, {stats.revisionDone} chapters revised. 
                Keep up the momentum!
              </p>
            </div>
            <Award className="w-16 h-16 text-yellow-300" />
          </div>
        </div>
        
        {/* Tutorial Modal */}
        <PlannerTutorial 
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      </div>
    </div>
  );
};

export default SmartPlanner;