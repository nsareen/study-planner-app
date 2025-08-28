import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Calendar, Clock, BookOpen, Target, 
  HelpCircle, CalendarDays
} from 'lucide-react';
import type { Chapter, PlannerDay } from '../types';
import { format, addDays, startOfDay, isSameDay, isWeekend } from 'date-fns';
import PlannerTutorial from '../components/PlannerTutorial';
import MatrixPlannerView from '../components/MatrixPlannerView';
import EnhancedMatrixEditor from '../components/EnhancedMatrixEditor';
import StudyPlanManager from '../components/StudyPlanManager';

const SmartPlanner: React.FC = () => {
  const { 
    chapters, exams, examGroups, offDays, studyPlans, activeStudyPlanId, plannerDays,
    chapterAssignments, activitySessions,
    addExam, addChapter, updateChapter, deleteChapter, 
    addStudyPlan, updateStudyPlan, deleteStudyPlan, setActiveStudyPlan, duplicateStudyPlan,
    addPlannerDay, getPlannerDayByDate,
    scheduleChapter, getAssignmentsForDate, deleteAssignment,
    startActivity, pauseActivity, resumeActivity, completeActivity, getActiveSession
  } = useStore();
  
  // Simplified to 3 essential tabs
  const [selectedView, setSelectedView] = useState<'overview' | 'chapters' | 'schedule'>('overview');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Add sample exams if none exist
  useEffect(() => {
    if (exams.length === 0) {
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
    }
  }, [exams.length, addExam]);

  // Initialize planner days
  useEffect(() => {
    const today = startOfDay(new Date());
    const endDate = addDays(today, 30);
    
    for (let d = today; d <= endDate; d = addDays(d, 1)) {
      const existing = getPlannerDayByDate(d.toISOString());
      if (!existing) {
        const isOffDay = offDays.some(off => isSameDay(new Date(off.date), d));
        const isExamDay = exams.some(exam => isSameDay(new Date(exam.date), d));
        
        let dayType: PlannerDay['dayType'] = 'study';
        let availableHours = 4;
        
        if (isExamDay) {
          dayType = 'exam';
          availableHours = 2;
        } else if (isOffDay) {
          dayType = 'off';
          availableHours = 0;
        } else if (isWeekend(d)) {
          dayType = 'weekend';
          availableHours = 6;
        }
        
        addPlannerDay({
          date: d.toISOString(),
          dayType,
          availableHours,
          plannedTasks: [],
          actualTimeSpent: 0
        } as any);
      }
    }
  }, [exams, offDays, addPlannerDay, getPlannerDayByDate]);

  // Calculate stats
  const stats = {
    totalChapters: chapters.length,
    completedChapters: chapters.filter(c => c.studyStatus === 'done' && c.revisionStatus === 'done').length,
    totalStudyHours: chapters.reduce((sum, c) => sum + (c.studyHours || 0), 0),
    totalRevisionHours: chapters.reduce((sum, c) => sum + (c.revisionHours || 0), 0),
    completedStudyHours: chapters.reduce((sum, c) => sum + (c.completedStudyHours || 0), 0),
    completedRevisionHours: chapters.reduce((sum, c) => sum + (c.completedRevisionHours || 0), 0),
  };
  
  const progressPercentage = stats.totalChapters > 0 
    ? Math.round((stats.completedChapters / stats.totalChapters) * 100)
    : 0;

  // Get next exam
  const nextExam = exams
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const daysUntilExam = nextExam 
    ? Math.ceil((new Date(nextExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter?')) {
      deleteChapter(chapterId);
    }
  };

  const handleDeleteSubject = (subject: string) => {
    const subjectChapters = chapters.filter(c => c.subject === subject);
    if (confirm(`Delete all ${subjectChapters.length} chapters in ${subject}?`)) {
      subjectChapters.forEach(c => deleteChapter(c.id));
    }
  };

  const handleAddSubject = (subjectName: string) => {
    // Create a placeholder chapter for the new subject
    addChapter({
      subject: subjectName,
      name: 'Introduction',
      estimatedHours: 2,
      studyHours: 2,
      revisionHours: 1,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      studyStatus: 'not-done',
      revisionStatus: 'not-done'
    });
  };

  const handleBulkUpdate = (chapterIds: string[], updates: Partial<Chapter>) => {
    chapterIds.forEach(id => updateChapter(id, updates));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Smart Study Planner
              </h1>
              <p className="text-gray-600">Intelligent exam preparation with adaptive scheduling</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-500 animate-pulse" />
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Simplified Tab Navigation - Only 3 Essential Tabs */}
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
                onClick={() => setSelectedView('overview')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'overview' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CalendarDays size={18} />
                Overview
              </button>
              <button
                onClick={() => setSelectedView('chapters')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'chapters' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BookOpen size={18} />
                Chapters
              </button>
              <button
                onClick={() => setSelectedView('schedule')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedView === 'schedule' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Calendar size={18} />
                Schedule
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

        {/* Quick Stats Summary - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{stats.totalChapters}</span>
            </div>
            <p className="text-sm text-gray-600">Total Chapters</p>
            <div className="mt-2 text-xs text-green-600">
              ✓ {stats.completedChapters} completed
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">
                {Math.round(stats.totalStudyHours)}h
              </span>
            </div>
            <p className="text-sm text-gray-600">Study Hours Needed</p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.completedStudyHours / stats.totalStudyHours) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{Math.round(stats.completedStudyHours)}h completed</span>
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

          {nextExam && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-6 h-6" />
                <span className="text-2xl font-bold">
                  {daysUntilExam}
                </span>
              </div>
              <p className="text-sm">Days Until Exam</p>
              <p className="text-xs mt-1 opacity-90">{nextExam.name}</p>
            </div>
          )}
        </div>

        {/* Main Content Area - Based on Selected View */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {selectedView === 'overview' ? (
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
              onOpenPlan={() => setSelectedView('schedule')}
            />
          ) : selectedView === 'chapters' ? (
            <EnhancedMatrixEditor
              chapters={chapters}
              onUpdateChapter={updateChapter}
              onAddChapter={addChapter}
              onDeleteChapter={handleDeleteChapter}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onBulkUpdate={handleBulkUpdate}
              onReorderChapters={(subject, newOrder) => {
                // Handle reordering for a specific subject
                console.log('Reordering chapters for', subject, newOrder);
              }}
            />
          ) : (
            <MatrixPlannerView 
              chapters={chapters}
              plannerDays={plannerDays}
              exams={exams}
              chapterAssignments={chapterAssignments}
              activitySessions={activitySessions}
              activeSession={getActiveSession()}
              onDrop={(e) => {
                // Handle drop functionality
                e.preventDefault();
              }}
              onDragOver={(e) => e.preventDefault()}
              onStartTask={() => {}}
              onUpdateChapterHours={(chapterId, studyHours, revisionHours) => {
                updateChapter(chapterId, { studyHours, revisionHours });
              }}
              onUpdateChapterStatus={updateChapter}
              onDeleteChapter={handleDeleteChapter}
              onResetChapter={(id) => {
                updateChapter(id, {
                  studyStatus: 'not-done',
                  revisionStatus: 'not-done',
                  completedStudyHours: 0,
                  completedRevisionHours: 0
                });
              }}
              onDeleteSubject={handleDeleteSubject}
              onScheduleChapter={scheduleChapter}
              getAssignmentsForDate={getAssignmentsForDate}
              onStartActivity={startActivity}
              onPauseActivity={pauseActivity}
              onResumeActivity={resumeActivity}
              onCompleteActivity={completeActivity}
              onDeleteAssignment={deleteAssignment}
              selectedExamDate={selectedExam && exams.find(e => e.id === selectedExam) ? new Date(exams.find(e => e.id === selectedExam)!.date) : null}
              selectedChapterIds={[]}
              onToggleChapterSelection={() => {}}
            />
          )}
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