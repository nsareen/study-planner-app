import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, BookOpen, AlertCircle, Save, Copy, FileText } from 'lucide-react';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import type { ExamType, SubjectExam, ExamGroup } from '../types';
import { useStore } from '../store/useStore';

interface ExamGroupFormProps {
  onClose: () => void;
  onSubmit: (examGroup: any) => void;
  editingGroup?: ExamGroup | null; // If provided, we're in edit mode
  mode?: 'create' | 'edit' | 'duplicate';
}

const ExamGroupForm: React.FC<ExamGroupFormProps> = ({ 
  onClose, 
  onSubmit, 
  editingGroup = null, 
  mode = 'create' 
}) => {
  const { chapters } = useStore();
  
  // Get unique subjects from chapters
  const availableSubjects = Array.from(new Set(chapters.map(c => c.subject))).sort();
  
  // Initialize form data based on mode and editing group
  const getInitialFormData = () => {
    if (editingGroup) {
      return {
        name: mode === 'duplicate' ? `${editingGroup.name} (Copy)` : editingGroup.name,
        type: editingGroup.type,
        startDate: mode === 'duplicate' 
          ? format(new Date(), 'yyyy-MM-dd')
          : editingGroup.startDate,
        endDate: mode === 'duplicate'
          ? format(addDays(new Date(), 14), 'yyyy-MM-dd')
          : editingGroup.endDate,
        description: editingGroup.description || '',
        status: mode === 'duplicate' ? 'draft' : editingGroup.status,
        isTemplate: false,
      };
    }
    return {
      name: '',
      type: 'mid-term' as ExamType,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      description: '',
      status: 'draft',
      isTemplate: false,
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData());
  const [subjectExams, setSubjectExams] = useState<SubjectExam[]>(
    editingGroup ? [...editingGroup.subjectExams] : []
  );
  const [offDays, setOffDays] = useState<string[]>(
    editingGroup ? [...editingGroup.offDays] : []
  );
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [duration, setDuration] = useState(180); // 3 hours default
  const [maxMarks, setMaxMarks] = useState(100);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  
  // Generate date options between start and end date
  const dateOptions = formData.startDate && formData.endDate
    ? eachDayOfInterval({
        start: new Date(formData.startDate),
        end: new Date(formData.endDate),
      })
    : [];
  
  const addSubjectExam = () => {
    if (selectedSubject && examDate) {
      const newExam: SubjectExam = {
        subject: selectedSubject,
        date: examDate,
        duration,
        maxMarks,
      };
      
      setSubjectExams([...subjectExams, newExam]);
      setSelectedSubject('');
      setExamDate('');
      setDuration(180);
      setMaxMarks(100);
    }
  };
  
  const removeSubjectExam = (index: number) => {
    setSubjectExams(subjectExams.filter((_, i) => i !== index));
  };
  
  const toggleOffDay = (date: string) => {
    if (offDays.includes(date)) {
      setOffDays(offDays.filter(d => d !== date));
    } else {
      setOffDays([...offDays, date]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (subjectExams.length === 0 && formData.status !== 'draft') {
      alert('Please add at least one subject exam or save as draft');
      return;
    }
    
    const examGroupData = {
      ...formData,
      subjectExams,
      offDays,
      isTemplate: saveAsTemplate,
      templateName: saveAsTemplate ? formData.name : undefined,
      version: editingGroup ? (editingGroup.version || 0) + 1 : 1,
      lastModified: new Date().toISOString(),
    };
    
    // If editing, include the ID
    if (mode === 'edit' && editingGroup) {
      (examGroupData as any).id = editingGroup.id;
    }
    
    onSubmit(examGroupData);
  };
  
  const handleSaveAsDraft = () => {
    const examGroupData = {
      ...formData,
      status: 'draft',
      subjectExams,
      offDays,
      version: editingGroup ? (editingGroup.version || 0) + 1 : 1,
      lastModified: new Date().toISOString(),
    };
    
    if (mode === 'edit' && editingGroup) {
      (examGroupData as any).id = editingGroup.id;
    }
    
    onSubmit(examGroupData);
  };
  
  const quickAddAllSubjects = () => {
    const newExams: SubjectExam[] = [];
    let currentDate = new Date(formData.startDate);
    
    availableSubjects.forEach((subject) => {
      // Skip weekends
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate = addDays(currentDate, 1);
      }
      
      newExams.push({
        subject,
        date: format(currentDate, 'yyyy-MM-dd'),
        duration: 180,
        maxMarks: 100,
      });
      
      // Add a day gap between exams
      currentDate = addDays(currentDate, 2);
    });
    
    setSubjectExams(newExams);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'edit' ? 'Edit Exam Group' : mode === 'duplicate' ? 'Duplicate Exam Group' : 'Create Exam Group'}
            </h2>
            {editingGroup && mode === 'edit' && (
              <p className="text-sm text-gray-500 mt-1">
                Version {editingGroup.version || 1} • Last modified {format(new Date(editingGroup.lastModified || editingGroup.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Mid-Term Exams Grade 9"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ExamType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="weekly">Weekly Test</option>
                  <option value="monthly">Monthly Exam</option>
                  <option value="quarterly">Quarterly Exam</option>
                  <option value="mid-term">Mid-Term Exam</option>
                  <option value="final">Final Exam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
                placeholder="Any additional notes about this exam group..."
              />
            </div>
          </div>
          
          {/* Subject Exams */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Subject Exams
              </h3>
              <button
                type="button"
                onClick={quickAddAllSubjects}
                className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Quick Add All Subjects
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Subject</option>
                  {availableSubjects
                    .filter(s => !subjectExams.some(e => e.subject === s))
                    .map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>
                
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={formData.startDate}
                  max={formData.endDate}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Duration (min)"
                    min="30"
                    max="360"
                  />
                </div>
                
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Max Marks"
                  min="10"
                  max="200"
                />
                
                <button
                  type="button"
                  onClick={addSubjectExam}
                  disabled={!selectedSubject || !examDate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
            
            {/* List of added exams */}
            {subjectExams.length > 0 && (
              <div className="space-y-2">
                {subjectExams.map((exam, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-purple-700">{exam.subject}</span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(exam.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {exam.duration} mins | {exam.maxMarks} marks
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubjectExam(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Off Days */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Off Days (Optional)
            </h3>
            
            <div className="grid grid-cols-7 gap-2">
              {dateOptions.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isExamDay = subjectExams.some(e => e.date === dateStr);
                const isOffDay = offDays.includes(dateStr);
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isExamDay && toggleOffDay(dateStr)}
                    disabled={isExamDay}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isExamDay
                        ? 'bg-purple-100 text-purple-700 cursor-not-allowed'
                        : isOffDay
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{format(date, 'd')}</div>
                    <div className="text-xs">{format(date, 'EEE')}</div>
                    {isExamDay && <div className="text-xs mt-1">📝 Exam</div>}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="rounded"
                />
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Save as Template
                </span>
              </label>
              {formData.status === 'draft' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                  DRAFT
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {(mode === 'create' || mode === 'duplicate' || (mode === 'edit' && formData.status === 'draft')) && (
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save as Draft
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {mode === 'edit' ? (
                  <>
                    <Save size={16} />
                    Update Group
                  </>
                ) : mode === 'duplicate' ? (
                  <>
                    <Copy size={16} />
                    Create Copy
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamGroupForm;