import React, { useState } from 'react';
import {
  Plus, Trash2, Edit2, Save, X, Copy, Move, ChevronDown, ChevronUp,
  Sparkles, BookOpen, Clock, CheckCircle, Circle, AlertTriangle,
  Settings, Upload, Download, FolderPlus, Shuffle
} from 'lucide-react';
import type { Chapter } from '../types';
import ConfirmDialog, { useConfirmDialog } from './ConfirmDialog';

interface EnhancedMatrixEditorProps {
  chapters: Chapter[];
  onUpdateChapter: (id: string, updates: Partial<Chapter>) => void;
  onAddChapter: (chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteChapter: (id: string) => void;
  onAddSubject: (subjectName: string) => void;
  onDeleteSubject: (subject: string) => void;
  onBulkUpdate: (chapterIds: string[], updates: Partial<Chapter>) => void;
  onReorderChapters: (subject: string, newOrder: string[]) => void;
}

const EnhancedMatrixEditor: React.FC<EnhancedMatrixEditorProps> = ({
  chapters,
  onUpdateChapter,
  onAddChapter,
  onDeleteChapter,
  onAddSubject,
  onDeleteSubject,
  onBulkUpdate,
  onReorderChapters
}) => {
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newChapterForm, setNewChapterForm] = useState<{ subject: string } | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [tempChapterName, setTempChapterName] = useState('');
  const [tempSubjectName, setTempSubjectName] = useState('');
  const [tempStudyHours, setTempStudyHours] = useState(2);
  const [tempRevisionHours, setTempRevisionHours] = useState(1);

  // Group chapters by subject
  const chaptersBySubject = chapters.reduce((acc, chapter) => {
    if (!acc[chapter.subject]) {
      acc[chapter.subject] = [];
    }
    acc[chapter.subject].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleEditChapterName = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setTempChapterName(chapter.name);
    setTempStudyHours(chapter.studyHours || 2);
    setTempRevisionHours(chapter.revisionHours || 1);
  };

  const handleSaveChapterEdit = (chapterId: string) => {
    onUpdateChapter(chapterId, {
      name: tempChapterName,
      studyHours: tempStudyHours,
      revisionHours: tempRevisionHours
    });
    setEditingChapter(null);
  };

  const handleEditSubjectName = (subject: string) => {
    setEditingSubject(subject);
    setTempSubjectName(subject);
  };

  const handleSaveSubjectEdit = (oldSubject: string) => {
    // Update all chapters with this subject
    const subjectChapters = chaptersBySubject[oldSubject] || [];
    subjectChapters.forEach(chapter => {
      onUpdateChapter(chapter.id, { subject: tempSubjectName });
    });
    setEditingSubject(null);
  };

  const handleAddNewChapter = (subject: string) => {
    onAddChapter({
      subject,
      name: tempChapterName,
      estimatedHours: tempStudyHours + tempRevisionHours,
      studyHours: tempStudyHours,
      revisionHours: tempRevisionHours,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      status: 'not_started',
      studyStatus: 'not-done',
      revisionStatus: 'not-done'
    });
    setNewChapterForm(null);
    setTempChapterName('');
    setTempStudyHours(2);
    setTempRevisionHours(1);
  };

  const handleAddNewSubject = () => {
    if (newSubjectName.trim()) {
      // Add a default chapter to the new subject
      onAddChapter({
        subject: newSubjectName,
        name: 'Chapter 1',
        estimatedHours: 3,
        studyHours: 2,
        revisionHours: 1,
        completedStudyHours: 0,
        completedRevisionHours: 0,
        status: 'not_started',
        studyStatus: 'not-done',
        revisionStatus: 'not-done'
      });
      setNewSubjectName('');
      setShowNewSubjectForm(false);
    }
  };

  const handleBulkAction = (action: 'delete' | 'setHours' | 'reset') => {
    const selectedIds = Array.from(selectedChapters);
    if (selectedIds.length === 0) return;

    switch (action) {
      case 'delete':
        showConfirm(
          'Delete Selected Chapters',
          `Are you sure you want to delete ${selectedIds.length} selected chapters? This action cannot be undone.`,
          () => {
            selectedIds.forEach(id => onDeleteChapter(id));
            setSelectedChapters(new Set());
          },
          'danger'
        );
        break;
      case 'setHours':
        onBulkUpdate(selectedIds, {
          studyHours: tempStudyHours,
          revisionHours: tempRevisionHours
        });
        setSelectedChapters(new Set());
        break;
      case 'reset':
        onBulkUpdate(selectedIds, {
          studyStatus: 'not-done',
          revisionStatus: 'not-done',
          completedStudyHours: 0,
          completedRevisionHours: 0,
          status: 'not_started'
        });
        setSelectedChapters(new Set());
        break;
    }
  };

  const handleCloneChapter = (chapter: Chapter) => {
    onAddChapter({
      ...chapter,
      name: `${chapter.name} (Copy)`,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      status: 'not_started',
      studyStatus: 'not-done',
      revisionStatus: 'not-done'
    });
  };

  const toggleChapterSelection = (chapterId: string) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(chapterId)) {
      newSelected.delete(chapterId);
    } else {
      newSelected.add(chapterId);
    }
    setSelectedChapters(newSelected);
  };

  const selectAllInSubject = (subject: string) => {
    const subjectChapters = chaptersBySubject[subject] || [];
    const newSelected = new Set(selectedChapters);
    subjectChapters.forEach(chapter => {
      newSelected.add(chapter.id);
    });
    setSelectedChapters(newSelected);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-purple-500" />
          Subjects & Chapters Editor
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          {selectedChapters.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
              <span className="text-sm font-medium text-purple-700">
                {selectedChapters.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('setHours')}
                className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
              >
                Set Hours
              </button>
              <button
                onClick={() => handleBulkAction('reset')}
                className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
              >
                Reset
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedChapters(new Set())}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          )}
          
          {/* Add New Subject */}
          <button
            onClick={() => setShowNewSubjectForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* New Subject Form */}
      {showNewSubjectForm && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter subject name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={handleAddNewSubject}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowNewSubjectForm(false);
                setNewSubjectName('');
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subjects and Chapters Matrix */}
      <div className="space-y-4">
        {Object.entries(chaptersBySubject).map(([subject, subjectChapters]) => {
          const isExpanded = expandedSubjects.has(subject);
          const totalStudyHours = subjectChapters.reduce((sum, c) => sum + (c.studyHours || 2), 0);
          const totalRevisionHours = subjectChapters.reduce((sum, c) => sum + (c.revisionHours || 1), 0);
          const completedChapters = subjectChapters.filter(c => c.status === 'mastered' || c.studyStatus === 'done').length;

          return (
            <div key={subject} className="border-2 border-gray-200 rounded-lg overflow-hidden">
              {/* Subject Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSubject(subject)}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {editingSubject === subject ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempSubjectName}
                          onChange={(e) => setTempSubjectName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveSubjectEdit(subject)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSubject(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">{subject}</h3>
                        <button
                          onClick={() => handleEditSubjectName(subject)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <span className="text-sm text-gray-600">
                      ({subjectChapters.length} chapters)
                    </span>
                    
                    {/* Subject Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-600 font-medium">
                        📚 {totalStudyHours}h study
                      </span>
                      <span className="text-green-600 font-medium">
                        🔄 {totalRevisionHours}h revision
                      </span>
                      <span className="text-purple-600 font-medium">
                        ✅ {completedChapters}/{subjectChapters.length} done
                      </span>
                    </div>
                  </div>
                  
                  {/* Subject Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectAllInSubject(subject)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setNewChapterForm({ subject })}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Chapter
                    </button>
                    <button
                      onClick={() => showConfirm(
                        'Delete Subject',
                        `Are you sure you want to delete "${subject}" and all its chapters? This will remove all progress and cannot be undone.`,
                        () => onDeleteSubject(subject),
                        'danger'
                      )}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* New Chapter Form */}
                {newChapterForm?.subject === subject && (
                  <div className="mt-4 p-3 bg-white rounded-lg flex items-center gap-2">
                    <input
                      type="text"
                      value={tempChapterName}
                      onChange={(e) => setTempChapterName(e.target.value)}
                      placeholder="Chapter name..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={tempStudyHours}
                      onChange={(e) => setTempStudyHours(parseFloat(e.target.value))}
                      placeholder="Study hrs"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.5"
                      min="0.5"
                    />
                    <input
                      type="number"
                      value={tempRevisionHours}
                      onChange={(e) => setTempRevisionHours(parseFloat(e.target.value))}
                      placeholder="Revision hrs"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.5"
                      min="0.5"
                    />
                    <button
                      onClick={() => handleAddNewChapter(subject)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setNewChapterForm(null);
                        setTempChapterName('');
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Chapters List */}
              {isExpanded && (
                <div className="p-4 space-y-2">
                  {subjectChapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                        selectedChapters.has(chapter.id) ? 'bg-purple-50 border-2 border-purple-300' : 'bg-white border border-gray-200'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedChapters.has(chapter.id)}
                        onChange={() => toggleChapterSelection(chapter.id)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      
                      {/* Chapter Index */}
                      <span className="text-sm text-gray-500 font-mono w-8">
                        #{index + 1}
                      </span>
                      
                      {/* Chapter Name & Edit */}
                      <div className="flex-1 flex items-center gap-2">
                        {editingChapter === chapter.id ? (
                          <>
                            <input
                              type="text"
                              value={tempChapterName}
                              onChange={(e) => setTempChapterName(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded"
                              autoFocus
                            />
                            <input
                              type="number"
                              value={tempStudyHours}
                              onChange={(e) => setTempStudyHours(parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                              placeholder="Study"
                              step="0.5"
                              min="0.5"
                            />
                            <input
                              type="number"
                              value={tempRevisionHours}
                              onChange={(e) => setTempRevisionHours(parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                              placeholder="Revision"
                              step="0.5"
                              min="0.5"
                            />
                            <button
                              onClick={() => handleSaveChapterEdit(chapter.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingChapter(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 font-medium text-gray-800">
                              {chapter.name}
                            </span>
                            <span className="text-sm text-blue-600">
                              📖 {chapter.studyHours || 2}h
                            </span>
                            <span className="text-sm text-green-600">
                              🔄 {chapter.revisionHours || 1}h
                            </span>
                            
                            {/* Status Icons */}
                            <div className="flex items-center gap-1">
                              {chapter.studyStatus === 'done' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {chapter.studyStatus === 'in-progress' && (
                                <Clock className="w-4 h-4 text-orange-500" />
                              )}
                              {chapter.confidence === 'low' && (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            
                            {/* Chapter Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditChapterName(chapter)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title="Edit chapter"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCloneChapter(chapter)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Clone chapter"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => showConfirm(
                                  'Delete Chapter',
                                  `Are you sure you want to delete "${chapter.name}"? This action cannot be undone.`,
                                  () => onDeleteChapter(chapter.id),
                                  'danger'
                                )}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Delete chapter"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-700 font-semibold mb-2">
          💡 Quick Tips:
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click on any chapter or subject name to edit it inline</li>
          <li>• Changes are saved automatically and update everywhere</li>
          <li>• Use checkboxes to select multiple chapters for bulk operations</li>
          <li>• Add new subjects and chapters directly from this view</li>
          <li>• Clone chapters to quickly create similar content</li>
        </ul>
      </div>

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

export default EnhancedMatrixEditor;