import React, { useState } from 'react';
import { X, Plus, Target, BookOpen, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import type { StudyPlan, Chapter } from '../types';

interface PlanSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  plans: StudyPlan[];
  activeStudyPlanId?: string;
  chapter?: Chapter;
  onCreateNewPlan?: () => void;
}

const PlanSelectionDialog: React.FC<PlanSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  plans,
  activeStudyPlanId,
  chapter,
  onCreateNewPlan,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(activeStudyPlanId || '');

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedPlanId) {
      onSelectPlan(selectedPlanId);
      onClose();
    }
  };

  const getCompletionPercentage = (plan: StudyPlan) => {
    const total = plan.totalStudyHours + plan.totalRevisionHours;
    const completed = plan.completedStudyHours + plan.completedRevisionHours;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getPlanTaskCount = (plan: StudyPlan) => {
    return plan.assignmentIds?.length || 0;
  };

  const getSuggestedPlan = () => {
    // If chapter has a subject, try to find a plan with matching subject chapters
    if (chapter?.subject) {
      // This could be enhanced with more sophisticated matching logic
      const activePlan = plans.find(p => p.id === activeStudyPlanId);
      if (activePlan) return activePlan;
    }
    
    // Otherwise return the default plan
    return plans.find(p => p.isDefault) || plans.find(p => p.status === 'active');
  };

  const suggestedPlan = getSuggestedPlan();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Add to Study Plan</h2>
              <p className="text-white/90">Select a plan for this chapter</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Chapter Info */}
          {chapter && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-800">{chapter.subject}</p>
                  <p className="text-sm text-gray-600">{chapter.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Options */}
          <div className="space-y-3">
            {plans
              .filter(plan => plan.status !== 'completed' && plan.status !== 'archived')
              .map(plan => {
                const isActive = plan.id === activeStudyPlanId;
                const isDefault = plan.isDefault;
                const isSuggested = suggestedPlan?.id === plan.id;
                const completion = getCompletionPercentage(plan);
                const taskCount = getPlanTaskCount(plan);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedPlanId === plan.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="radio"
                            checked={selectedPlanId === plan.id}
                            onChange={() => setSelectedPlanId(plan.id)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="font-semibold text-gray-800">
                            {plan.name}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Active
                            </span>
                          )}
                          {isDefault && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Default
                            </span>
                          )}
                          {isSuggested && !isActive && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Suggested
                            </span>
                          )}
                        </div>
                        
                        <div className="ml-6 space-y-1">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Progress: {taskCount} tasks</span>
                            <span className="text-purple-600 font-medium">
                              {completion}%
                            </span>
                          </div>
                          
                          {completion > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          )}
                          
                          {/* Plan Description */}
                          {plan.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              {plan.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Create New Plan Option */}
            {onCreateNewPlan && (
              <div
                onClick={onCreateNewPlan}
                className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg group-hover:bg-purple-100">
                    <Plus className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 group-hover:text-purple-700">
                      Create New Plan
                    </p>
                    <p className="text-sm text-gray-500">
                      Start a fresh study plan for new goals
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedPlanId}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all
              ${selectedPlanId
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionDialog;