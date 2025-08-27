import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Calendar as CalendarIcon, Trash2, X, Users, Play, Copy, Archive, Edit, FileText, CheckCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import type { ExamType, ExamGroup } from '../types';
import ExamGroupForm from '../components/ExamGroupForm';

const Calendar: React.FC = () => {
  const { 
    exams, examGroups, offDays, chapters, 
    addExam, deleteExam, addExamGroup, updateExamGroup, deleteExamGroup, applyExamGroup,
    addOffDay, deleteOffDay, currentDate 
  } = useStore();
  const [showExamForm, setShowExamForm] = useState(false);
  const [showExamGroupForm, setShowExamGroupForm] = useState(false);
  const [showOffDayForm, setShowOffDayForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'exams' | 'groups'>('groups');
  const [editingGroup, setEditingGroup] = useState<ExamGroup | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [examForm, setExamForm] = useState({
    name: '',
    date: '',
    type: 'monthly' as ExamType,
    subjects: [] as string[],
  });
  
  // Get unique subjects from chapters for quick selection
  const availableSubjects = Array.from(new Set(chapters.map(c => c.subject))).sort();
  const [offDayForm, setOffDayForm] = useState({
    date: '',
    reason: '',
  });
  const [subjectInput, setSubjectInput] = useState('');
  
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    addExam(examForm);
    setExamForm({
      name: '',
      date: '',
      type: 'monthly',
      subjects: [],
    });
    setShowExamForm(false);
  };
  
  const handleAddOffDay = (e: React.FormEvent) => {
    e.preventDefault();
    addOffDay(offDayForm);
    setOffDayForm({
      date: '',
      reason: '',
    });
    setShowOffDayForm(false);
  };
  
  const addSubject = () => {
    if (subjectInput.trim()) {
      setExamForm({
        ...examForm,
        subjects: [...examForm.subjects, subjectInput.trim()],
      });
      setSubjectInput('');
    }
  };
  
  const removeSubject = (index: number) => {
    setExamForm({
      ...examForm,
      subjects: examForm.subjects.filter((_, i) => i !== index),
    });
  };
  
  const getDaysUntil = (date: string) => {
    const days = differenceInDays(parseISO(date), parseISO(currentDate));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `In ${days} days`;
  };
  
  const getExamTypeColor = (type: ExamType) => {
    const colors = {
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-green-100 text-green-800',
      quarterly: 'bg-yellow-100 text-yellow-800',
      'mid-term': 'bg-orange-100 text-orange-800',
      final: 'bg-red-100 text-red-800',
    };
    return colors[type];
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'published':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'applied':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };
  
  const handleEditGroup = (group: ExamGroup) => {
    setEditingGroup(group);
    setFormMode('edit');
    setShowExamGroupForm(true);
  };
  
  const handleDuplicateGroup = (group: ExamGroup) => {
    setEditingGroup(group);
    setFormMode('duplicate');
    setShowExamGroupForm(true);
  };
  
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setFormMode('create');
    setShowExamGroupForm(true);
  };
  
  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const sortedOffDays = [...offDays].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Tabs for Exam Groups and Individual Exams */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'groups'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users className="inline w-4 h-4 mr-1" />
                Exam Groups
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'exams'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="inline w-4 h-4 mr-1" />
                Individual Exams
              </button>
            </div>
            {activeTab === 'groups' ? (
              <button
                onClick={handleCreateGroup}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus size={16} />
                New Group
              </button>
            ) : (
              <button
                onClick={() => setShowExamForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Exam
              </button>
            )}
          </div>
          
          {showExamForm && (
            <form onSubmit={handleAddExam} className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg space-y-4 border-2 border-purple-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Mid-Term Mathematics"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={currentDate}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={examForm.type}
                    onChange={(e) => setExamForm({ ...examForm, type: e.target.value as ExamType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="weekly">Weekly Test</option>
                    <option value="monthly">Monthly Exam</option>
                    <option value="quarterly">Quarterly Exam</option>
                    <option value="mid-term">Mid-Term Exam</option>
                    <option value="final">Final Exam</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects</label>
                
                {/* Quick subject selection */}
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Quick Add:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableSubjects.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          if (!examForm.subjects.includes(subject)) {
                            setExamForm({ ...examForm, subjects: [...examForm.subjects, subject] });
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          examForm.subjects.includes(subject) 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              
                {/* Manual subject input */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add subject"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubject();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {examForm.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="hover:text-primary-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Add Exam
                </button>
                <button
                  type="button"
                  onClick={() => setShowExamForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {/* Content based on active tab */}
          {activeTab === 'groups' ? (
            // Exam Groups Tab
            (!examGroups || examGroups.length === 0) ? (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 text-sm">No exam groups created</p>
                <p className="text-xs text-gray-400 mt-1">Create a group to manage multiple subject exams together</p>
              </div>
            ) : (
              <div className="space-y-3">
                {examGroups.map((group) => (
                  <div key={group.id} className={`border-2 rounded-lg p-4 transition-all ${
                    group.status === 'applied' 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                      : group.status === 'draft'
                      ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
                      : 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
                          {group.isTemplate && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold flex items-center gap-1">
                              <FileText size={10} />
                              Template
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(group.status || 'draft')}`}>
                            {group.status === 'applied' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                            {(group.status || 'draft').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExamTypeColor(group.type)}`}>
                            {group.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {format(parseISO(group.startDate), 'MMM d')} - {format(parseISO(group.endDate), 'MMM d, yyyy')}
                          </span>
                          {group.version && group.version > 1 && (
                            <span className="text-xs text-gray-500">v{group.version}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {group.status !== 'applied' && (
                          <>
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Edit group"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => applyExamGroup(group.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                              title="Apply this group to calendar"
                            >
                              <Play size={14} />
                              Apply
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDuplicateGroup(group)}
                          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                          title="Duplicate group"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete exam group "${group.name}"?`)) {
                              deleteExamGroup(group.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                          title="Delete group"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subject Exams List */}
                    <div className="space-y-1 mb-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Subject Exams:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {group.subjectExams.map((exam, idx) => (
                          <div key={idx} className="text-xs bg-white px-2 py-1 rounded flex justify-between">
                            <span className="font-medium">{exam.subject}</span>
                            <span className="text-gray-500">{format(parseISO(exam.date), 'MMM d')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {group.offDays && group.offDays.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Off Days:</span> {group.offDays.length} days included
                      </div>
                    )}
                    
                    {group.description && (
                      <p className="text-xs text-gray-600 mt-2 italic">{group.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            // Individual Exams Tab
            sortedExams.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 text-sm">No individual exams scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedExams.map((exam) => (
                  <div key={exam.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{exam.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExamTypeColor(exam.type)}`}>
                            {exam.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(exam.date), 'MMM d, yyyy')} • {getDaysUntil(exam.date)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exam.subjects.map((subject, index) => (
                            <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Off Days</h2>
            <button
              onClick={() => setShowOffDayForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Off Day
            </button>
          </div>
          
          {showOffDayForm && (
            <form onSubmit={handleAddOffDay} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <input
                type="date"
                value={offDayForm.date}
                onChange={(e) => setOffDayForm({ ...offDayForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min={currentDate}
                required
              />
              
              <input
                type="text"
                value={offDayForm.reason}
                onChange={(e) => setOffDayForm({ ...offDayForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Reason (e.g., Holiday, Family event)"
                required
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Add Off Day
                </button>
                <button
                  type="button"
                  onClick={() => setShowOffDayForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {sortedOffDays.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-500 text-sm">No off days scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedOffDays.map((offDay) => (
                <div key={offDay.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{offDay.reason}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(offDay.date), 'MMM d, yyyy')} • {getDaysUntil(offDay.date)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOffDay(offDay.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Exam Group Form Modal */}
      {showExamGroupForm && (
        <ExamGroupForm
          onClose={() => {
            setShowExamGroupForm(false);
            setEditingGroup(null);
            setFormMode('create');
          }}
          onSubmit={(examGroup) => {
            if (formMode === 'edit' && examGroup.id) {
              // Update existing group
              const { id, ...updates } = examGroup;
              updateExamGroup(id, updates);
            } else {
              // Add new group (create or duplicate)
              addExamGroup(examGroup);
            }
            setShowExamGroupForm(false);
            setEditingGroup(null);
            setFormMode('create');
          }}
          editingGroup={editingGroup}
          mode={formMode}
        />
      )}
    </div>
  );
};

export default Calendar;