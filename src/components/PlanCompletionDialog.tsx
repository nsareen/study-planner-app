import React, { useState } from 'react';
import { 
  X, Trophy, CheckCircle, AlertCircle, ChevronRight,
  Calendar, Clock, Target, TrendingUp, Star, Archive,
  ArrowRight, XCircle, PlusCircle
} from 'lucide-react';
import type { StudyPlan, ChapterAssignment } from '../types';

interface PlanCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: StudyPlan | null;
  assignments: ChapterAssignment[];
  otherPlans: StudyPlan[];
  onCompletePlan: (planId: string, options: { 
    moveIncompleteTo?: string; 
    cancelIncomplete?: boolean;
  }) => void;
  canComplete: boolean;
}

const PlanCompletionDialog: React.FC<PlanCompletionDialogProps> = ({
  isOpen,
  onClose,
  plan,
  assignments,
  otherPlans,
  onCompletePlan,
  canComplete,
}) => {
  const [incompleteAction, setIncompleteAction] = useState<'move' | 'cancel' | 'extend'>('move');
  const [targetPlanId, setTargetPlanId] = useState<string>('');

  if (!isOpen || !plan) return null;

  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const incompleteAssignments = assignments.filter(a => a.status !== 'completed');
  
  const completionRate = assignments.length > 0 
    ? Math.round((completedAssignments.length / assignments.length) * 100)
    : 0;

  const totalPlannedHours = assignments.reduce((sum, a) => sum + (a.plannedMinutes / 60), 0);
  const totalActualHours = completedAssignments.reduce((sum, a) => 
    sum + ((a.actualMinutes || a.plannedMinutes) / 60), 0
  );

  const efficiency = totalPlannedHours > 0 
    ? Math.round((totalActualHours / totalPlannedHours) * 100)
    : 100;

  const getEfficiencyLabel = () => {
    if (efficiency < 80) return { text: 'Speed Learner 🚀', color: 'text-blue-600' };
    if (efficiency <= 120) return { text: 'On Track ✅', color: 'text-green-600' };
    return { text: 'Deep Diver 📚', color: 'text-purple-600' };
  };

  const efficiencyLabel = getEfficiencyLabel();

  const handleComplete = () => {
    const options: any = {};
    
    if (incompleteAssignments.length > 0) {
      if (incompleteAction === 'move' && targetPlanId) {
        options.moveIncompleteTo = targetPlanId;
      } else if (incompleteAction === 'cancel') {
        options.cancelIncomplete = true;
      }
      // 'extend' action would be handled by not completing the plan
      if (incompleteAction === 'extend') {
        onClose();
        return;
      }
    }
    
    onCompletePlan(plan.id, options);
    onClose();
  };

  const availablePlans = otherPlans.filter(p => 
    p.id !== plan.id && 
    p.status !== 'completed' && 
    p.status !== 'archived'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {completionRate === 100 ? '🎉 Plan Complete!' : 'Ready to Complete Plan?'}
                </h2>
                <p className="text-white/90 mt-1">{plan.name}</p>
              </div>
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
          {/* Progress Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Progress</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {completedAssignments.length}/{assignments.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  tasks completed ({completionRate}%)
                </div>
                <div className="w-full bg-white rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Time Spent</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalActualHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  planned: {totalPlannedHours.toFixed(1)}h
                </div>
                <div className={`text-sm font-medium mt-2 ${efficiencyLabel.color}`}>
                  {efficiencyLabel.text}
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            {completionRate >= 90 && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-700">Achievements Earned</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {completionRate === 100 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Perfect Completion! 🌟
                    </span>
                  )}
                  {completionRate >= 90 && completionRate < 100 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Excellent Progress! ⭐
                    </span>
                  )}
                  {efficiency < 80 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Speed Learner 🚀
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Incomplete Tasks Section */}
          {incompleteAssignments.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-800">
                  {incompleteAssignments.length} Incomplete Tasks
                </h3>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3">
                  What would you like to do with the incomplete tasks?
                </p>

                <div className="space-y-3">
                  {/* Move to another plan */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="incompleteAction"
                      value="move"
                      checked={incompleteAction === 'move'}
                      onChange={() => setIncompleteAction('move')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Move to Another Plan</span>
                      </div>
                      {incompleteAction === 'move' && availablePlans.length > 0 && (
                        <select
                          value={targetPlanId}
                          onChange={(e) => setTargetPlanId(e.target.value)}
                          className="mt-2 w-full p-2 border rounded-lg text-sm"
                        >
                          <option value="">Select a plan...</option>
                          {availablePlans.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.isDefault && '(Default)'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>

                  {/* Cancel tasks */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="incompleteAction"
                      value="cancel"
                      checked={incompleteAction === 'cancel'}
                      onChange={() => setIncompleteAction('cancel')}
                      className="mt-1"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Cancel Incomplete Tasks</span>
                    </div>
                  </label>

                  {/* Extend plan */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="incompleteAction"
                      value="extend"
                      checked={incompleteAction === 'extend'}
                      onChange={() => setIncompleteAction('extend')}
                      className="mt-1"
                    />
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Keep Plan Open (Add More Time)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* List incomplete tasks */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {incompleteAssignments.slice(0, 5).map(assignment => (
                  <div key={assignment.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span>
                      {assignment.activityType === 'study' ? '📖' : '🔄'} Task on {assignment.date}
                    </span>
                  </div>
                ))}
                {incompleteAssignments.length > 5 && (
                  <div className="text-sm text-gray-500 italic">
                    ...and {incompleteAssignments.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion Notice */}
          {!canComplete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Plan needs more progress to complete
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Complete at least 50% of tasks to mark this plan as done.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={!canComplete || (incompleteAction === 'move' && !targetPlanId && incompleteAssignments.length > 0)}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
              ${canComplete && !(incompleteAction === 'move' && !targetPlanId && incompleteAssignments.length > 0)
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {incompleteAction === 'extend' ? (
              <>Keep Plan Open</>
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Complete Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanCompletionDialog;