import React, { useState } from 'react';
import {
  Calendar, Clock, Trophy, Target, TrendingUp, Archive,
  Plus, Copy, Play, Pause, CheckCircle, XCircle,
  Eye, EyeOff, Star, AlertCircle, BarChart3,
  CalendarDays, History, Sparkles
} from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import type { StudyPlan, ExamGroup } from '../types';

interface StudyPlanManagerProps {
  plans: StudyPlan[];
  activeStudyPlanId?: string;
  examGroups: ExamGroup[];
  onCreatePlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePlan: (id: string, updates: Partial<StudyPlan>) => void;
  onDeletePlan: (id: string) => void;
  onSetActivePlan: (id: string) => void;
  onDuplicatePlan: (id: string) => void;
  onOpenPlan: (plan: StudyPlan) => void;
}

const StudyPlanManager: React.FC<StudyPlanManagerProps> = ({
  plans,
  activeStudyPlanId,
  examGroups,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onSetActivePlan,
  onDuplicatePlan,
  onOpenPlan
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [selectedExamGroup, setSelectedExamGroup] = useState<string>('');
  const [planName, setPlanName] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

  // Filter plans based on status
  const filteredPlans = plans.filter(plan => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return plan.status === 'active' || plan.id === activeStudyPlanId;
    return plan.status === filterStatus;
  });

  // Sort plans: active first, then by date
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (a.id === activeStudyPlanId) return -1;
    if (b.id === activeStudyPlanId) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreatePlan = () => {
    const examGroup = examGroups.find(eg => eg.id === selectedExamGroup);
    
    onCreatePlan({
      name: planName || `Study Plan ${plans.length + 1}`,
      examGroupId: selectedExamGroup || undefined,
      startDate,
      endDate: examGroup ? examGroup.endDate : endDate,
      days: [],
      chapterIds: [], // Will be populated when plan is activated
      totalStudyHours: 0,
      totalRevisionHours: 0,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      status: 'draft',
      notes: planNotes
    });
    
    // Reset form
    setShowCreateForm(false);
    setPlanName('');
    setPlanNotes('');
    setSelectedExamGroup('');
  };

  const getPlanStatusColor = (status: string, isActive: boolean) => {
    if (isActive) return 'border-green-500 bg-green-50';
    switch (status) {
      case 'draft': return 'border-yellow-300 bg-yellow-50';
      case 'active': return 'border-blue-300 bg-blue-50';
      case 'completed': return 'border-purple-300 bg-purple-50';
      case 'archived': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-200';
    }
  };

  const getPlanProgress = (plan: StudyPlan) => {
    const total = plan.totalStudyHours + plan.totalRevisionHours;
    const completed = plan.completedStudyHours + plan.completedRevisionHours;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getDaysRemaining = (plan: StudyPlan) => {
    return differenceInDays(parseISO(plan.endDate), new Date());
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-purple-500" />
            Study Plans
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage multiple study plans for different exams
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-purple-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === 'timeline' 
                  ? 'bg-white text-purple-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <History className="w-4 h-4 inline mr-1" />
              Timeline
            </button>
          </div>

          {/* Create New Plan */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed', 'archived'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${plans.length})`}
            {status === 'active' && ` (${plans.filter(p => p.status === 'active' || p.id === activeStudyPlanId).length})`}
            {status === 'completed' && ` (${plans.filter(p => p.status === 'completed').length})`}
            {status === 'archived' && ` (${plans.filter(p => p.status === 'archived').length})`}
          </button>
        ))}
      </div>

      {/* Create Plan Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Create New Study Plan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Mid-Term Preparation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Exam Group (Optional)
              </label>
              <select
                value={selectedExamGroup}
                onChange={(e) => setSelectedExamGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No exam group</option>
                {examGroups.map(eg => (
                  <option key={eg.id} value={eg.id}>
                    {eg.name} ({format(parseISO(eg.startDate), 'MMM d')} - {format(parseISO(eg.endDate), 'MMM d')})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="Any special notes or goals for this plan..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreatePlan}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Plan
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlans.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">No study plans found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first plan to get started</p>
            </div>
          ) : (
            sortedPlans.map(plan => {
              const isActive = plan.id === activeStudyPlanId;
              const progress = getPlanProgress(plan);
              const daysLeft = getDaysRemaining(plan);
              
              return (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-4 transition-all hover:shadow-lg cursor-pointer ${getPlanStatusColor(plan.status, isActive)}`}
                  onClick={() => onOpenPlan(plan)}
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {plan.name}
                        {isActive && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {format(parseISO(plan.startDate), 'MMM d')} - {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    {/* Status Icon */}
                    <div className="text-2xl">
                      {plan.status === 'completed' && '✅'}
                      {plan.status === 'archived' && '📦'}
                      {plan.status === 'draft' && '📝'}
                      {isActive && '🎯'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-white/50 rounded p-2">
                      <p className="text-gray-600">Study Hours</p>
                      <p className="font-bold text-blue-600">
                        {plan.completedStudyHours}/{plan.totalStudyHours}h
                      </p>
                    </div>
                    <div className="bg-white/50 rounded p-2">
                      <p className="text-gray-600">Revision Hours</p>
                      <p className="font-bold text-green-600">
                        {plan.completedRevisionHours}/{plan.totalRevisionHours}h
                      </p>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  {daysLeft > 0 && plan.status !== 'completed' && plan.status !== 'archived' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time left:</span>
                      <span className={`font-bold ${daysLeft <= 7 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {daysLeft} days
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-1 mt-3 pt-3 border-t">
                    {!isActive && plan.status !== 'archived' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetActivePlan(plan.id);
                        }}
                        className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Set Active
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePlan(plan.id);
                      }}
                      className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                    
                    {plan.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete plan "${plan.name}"?`)) {
                            onDeletePlan(plan.id);
                          }
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    )}
                    
                    {plan.status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePlan(plan.id, { status: 'archived' });
                        }}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Archive className="w-3 h-3" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {sortedPlans.map((plan, index) => {
              const isActive = plan.id === activeStudyPlanId;
              const progress = getPlanProgress(plan);
              const daysLeft = getDaysRemaining(plan);
              
              return (
                <div key={plan.id} className="relative flex items-start gap-4 mb-6">
                  {/* Timeline Node */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    isActive ? 'bg-green-500 text-white' : 
                    plan.status === 'completed' ? 'bg-purple-500 text-white' :
                    plan.status === 'archived' ? 'bg-gray-400 text-white' :
                    'bg-white border-4 border-purple-300'
                  }`}>
                    {isActive && '🎯'}
                    {!isActive && plan.status === 'completed' && '✅'}
                    {!isActive && plan.status === 'archived' && '📦'}
                    {!isActive && plan.status === 'draft' && '📝'}
                    {!isActive && plan.status === 'active' && '📚'}
                  </div>
                  
                  {/* Plan Card */}
                  <div
                    className={`flex-1 border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all ${getPlanStatusColor(plan.status, isActive)}`}
                    onClick={() => onOpenPlan(plan)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(plan.startDate), 'MMM d, yyyy')} - {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      {isActive && (
                        <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>
                    
                    {/* Progress and Stats */}
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Progress</p>
                        <p className="font-bold text-purple-600">{progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Study</p>
                        <p className="font-bold text-blue-600">{plan.completedStudyHours}/{plan.totalStudyHours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Revision</p>
                        <p className="font-bold text-green-600">{plan.completedRevisionHours}/{plan.totalRevisionHours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Days Left</p>
                        <p className={`font-bold ${daysLeft <= 7 ? 'text-orange-500' : 'text-gray-700'}`}>
                          {daysLeft > 0 ? `${daysLeft} days` : 'Ended'}
                        </p>
                      </div>
                    </div>
                    
                    {plan.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">{plan.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Pro Tips:</span>
        </p>
        <ul className="text-xs text-gray-600 mt-1 space-y-1">
          <li>• Create multiple plans for different exams or time periods</li>
          <li>• Set one plan as active to track your current progress</li>
          <li>• Completed plans show your achievement history</li>
          <li>• Archive old plans to keep your workspace clean</li>
        </ul>
      </div>
    </div>
  );
};

export default StudyPlanManager;