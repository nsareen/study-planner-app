import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import SimpleAnalytics from '../components/SimpleAnalytics';
import DetailedAnalytics from '../components/DetailedAnalytics';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';

const Progress: React.FC = () => {
  const { 
    chapters, 
    exams,
    chapterAssignments,
    activitySessions,
    dailyLogs,
    getCurrentUser,
    settings,
    updateSettings
  } = useStore();
  
  const currentUser = getCurrentUser();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Calculate streak from user profile or daily activity
  const currentStreak = currentUser?.streak || 0;
  const level = currentUser?.level || 1;
  
  const handleParentModeToggle = () => {
    if (settings.parentModeEnabled) {
      // Turning off parent mode
      updateSettings({ parentModeEnabled: false });
    } else {
      // Show PIN dialog to turn on parent mode
      setShowPinDialog(true);
      setPinError(false);
      setEnteredPin('');
    }
  };
  
  const handlePinSubmit = () => {
    if (enteredPin === settings.parentModePIN) {
      updateSettings({ parentModeEnabled: true });
      setShowPinDialog(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        {/* Parent Mode Toggle - Hidden in corner */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleParentModeToggle}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all"
            title={settings.parentModeEnabled ? 'Exit Parent Mode' : 'Enter Parent Mode'}
          >
            {settings.parentModeEnabled ? (
              <Unlock className="w-5 h-5 text-indigo-600" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Analytics View */}
        {settings.parentModeEnabled ? (
          <DetailedAnalytics
            chapters={chapters}
            assignments={chapterAssignments}
            exams={exams}
            activitySessions={activitySessions || []}
            dailyLogs={dailyLogs}
            currentStreak={currentStreak}
            level={level}
          />
        ) : (
          <SimpleAnalytics
            chapters={chapters}
            assignments={chapterAssignments}
            exams={exams}
            currentStreak={currentStreak}
            level={level}
          />
        )}
        
        {/* PIN Entry Dialog */}
        {showPinDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
              <h3 className="text-lg font-bold mb-4">Enter Parent PIN</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please enter the PIN to access detailed analytics.
              </p>
              <input
                type="password"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  pinError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
              />
              {pinError && (
                <p className="text-red-500 text-xs mt-1">Incorrect PIN. Please try again.</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowPinDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Default PIN: 1234 (Change in Settings)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;