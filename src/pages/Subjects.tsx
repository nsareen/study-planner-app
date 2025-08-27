import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, BookOpen, Clock, CheckCircle, Circle, Trash2, Edit, HelpCircle, Lightbulb, Download, Zap, Brain } from 'lucide-react';
import { getSubjectStats } from '../utils/prioritization';
import CurriculumImport from '../components/CurriculumImport';
import SmartChapterSuggest from '../components/SmartChapterSuggest';

const Subjects: React.FC = () => {
  const { chapters, addChapter, updateChapter, deleteChapter, clearAllChapters } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCurriculumImport, setShowCurriculumImport] = useState(false);
  const [useSmartSuggest, setUseSmartSuggest] = useState(true);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    name: '',
    estimatedHours: 1,
  });
  
  const subjectStats = getSubjectStats(chapters);
  const subjects = Array.from(subjectStats.keys());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChapter) {
      updateChapter(editingChapter, formData);
      setEditingChapter(null);
    } else {
      addChapter({
        ...formData,
        studyHours: formData.estimatedHours || 2,
        revisionHours: 1,
        completedStudyHours: 0,
        completedRevisionHours: 0,
        studyStatus: 'not-done' as const,
        revisionStatus: 'not-done' as const,
        confidence: 'medium' as const
      });
    }
    setFormData({ subject: '', name: '', estimatedHours: 1 });
    setShowAddForm(false);
  };
  
  const handleEdit = (chapter: any) => {
    setFormData({
      subject: chapter.subject,
      name: chapter.name,
      estimatedHours: chapter.estimatedHours,
    });
    setEditingChapter(chapter.id);
    setShowAddForm(true);
  };
  
  const handleCancel = () => {
    setFormData({ subject: '', name: '', estimatedHours: 1 });
    setEditingChapter(null);
    setShowAddForm(false);
  };
  
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <Circle className="text-blue-500 fill-blue-200" size={20} />;
      default:
        return <Circle className="text-gray-400" size={20} />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subjects & Chapters</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCurriculumImport(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              <Brain size={16} />
              Smart Import
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              <Plus size={16} />
              Add Chapter
            </button>
            {chapters.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all chapters for testing? This cannot be undone.')) {
                    clearAllChapters();
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                <Trash2 size={16} />
                Clear All (Test)
              </button>
            )}
          </div>
        </div>
        
        {showAddForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smartSuggest"
                    checked={useSmartSuggest}
                    onChange={(e) => setUseSmartSuggest(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="smartSuggest" className="text-sm text-gray-700 flex items-center gap-1 font-medium">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Smart Suggestions
                  </label>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {useSmartSuggest ? (
                <SmartChapterSuggest
                  subjectValue={formData.subject}
                  chapterValue={formData.name}
                  onSubjectChange={(subject) => setFormData({ ...formData, subject })}
                  onChapterChange={(name) => setFormData({ ...formData, name })}
                  onChapterSelect={(chapter) => {
                    setFormData({
                      subject: formData.subject,
                      name: chapter.name,
                      estimatedHours: chapter.estimatedHours
                    });
                  }}
                />
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Mathematics"
                      required
                      list="subjects"
                    />
                    <datalist id="subjects">
                      {subjects.map((subject) => (
                        <option key={subject} value={subject} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chapter Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Quadratic Equations"
                      required
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingChapter ? 'Update' : 'Add'} Chapter
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Start Studying? 📚</h3>
              <p className="text-gray-600 mb-6">Add your subjects and chapters to create personalized study plans!</p>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Quick Start Tips:</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">1.</span>
                    <span>Click "Add Chapter" above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">2.</span>
                    <span>Enter your subject (Math, Science, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">3.</span>
                    <span>Add individual chapters with time estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">4.</span>
                    <span>Visit Calendar to add exam dates</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowCurriculumImport(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  🚀 Import from Curriculum
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ✏️ Add Manually
                </button>
                <a href="/help" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Need Help?
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => {
              const stats = subjectStats.get(subject)!;
              const subjectChapters = chapters.filter((ch) => ch.subject === subject);
              const progressPercentage = getProgressPercentage(stats.completedHours, stats.totalHours);
              
              return (
                <div key={subject} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{stats.completed}/{stats.total} chapters</span>
                        <span>{stats.completedHours.toFixed(1)}/{stats.totalHours.toFixed(1)} hours</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {subjectChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(chapter.status)}
                          <span className="font-medium">{chapter.name}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            {(chapter.studyProgress || 0).toFixed(1)}/{chapter.estimatedHours}h
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteChapter(chapter.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <CurriculumImport 
          isOpen={showCurriculumImport} 
          onClose={() => setShowCurriculumImport(false)}
        />
      </div>
    </div>
  );
};

export default Subjects;