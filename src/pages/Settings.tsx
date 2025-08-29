import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Download, Upload, Trash2, Moon, Sun, Monitor, Palette, Lock, Shield, AlertTriangle, CheckCircle, RefreshCw, Activity, Clock } from 'lucide-react';
import { themes } from '../utils/themes';
import ConfirmDialog, { useConfirmDialog } from '../components/ConfirmDialog';
import { prepareExportData, validateImportData } from '../store/dataSync';

const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    clearAllData, 
    importData, 
    chapters, 
    exams, 
    examGroups, 
    offDays, 
    dailyLogs, 
    studyPlans, 
    cleanupOrphanedData, 
    validateDataIntegrity,
    resetActiveSessionsAndTimers,
    validateAndFixSessionState,
    cleanupSessions,
    activitySessions,
    activeTimer
  } = useStore();
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [integrityCheckResult, setIntegrityCheckResult] = useState<{ isValid: boolean; issues: string[] } | null>(null);
  
  const handleExport = () => {
    // Use the comprehensive export utility
    const exportData = prepareExportData(useStore.getState());
    const data = {
      ...exportData,
      exportDate: new Date().toISOString(),
      version: '2.1', // Updated version for new data structure
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure using utility
        const validation = validateImportData(data);
        if (!validation.isValid) {
          alert(`Invalid file format: ${validation.error || 'Unknown error'}`);
          return;
        }
        
        const validatedData = validation.data;
        
        // Show confirmation dialog
        const itemCounts = {
          chapters: validatedData.chapters?.length || 0,
          exams: validatedData.exams?.length || 0,
          examGroups: validatedData.examGroups?.length || 0,
          offDays: validatedData.offDays?.length || 0,
          studyPlans: validatedData.studyPlans?.length || 0,
          assignments: validatedData.chapterAssignments?.length || 0,
          sessions: validatedData.activitySessions?.length || 0,
        };
        
        const confirmMessage = `This will import:
• ${itemCounts.chapters} chapters
• ${itemCounts.exams} exams
• ${itemCounts.examGroups} exam groups
• ${itemCounts.offDays} off days
• ${itemCounts.studyPlans} study plans
• ${itemCounts.assignments} scheduled activities
• ${itemCounts.sessions} activity sessions

Your current data will be replaced. Continue?`;
        
        if (confirm(confirmMessage)) {
          const success = importData(validatedData);
          
          if (success) {
            alert('✅ Data imported successfully! All your data has been restored.');
          } else {
            alert('❌ Import failed. Please check the file and try again.');
          }
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };
  
  const handleClearData = () => {
    clearAllData();
  };
  
  const handleDataIntegrityCheck = () => {
    const result = validateDataIntegrity();
    setIntegrityCheckResult(result);
    if (!result.isValid) {
      // Show issues and offer to clean up
      setTimeout(() => {
        if (confirm('Data integrity issues found. Would you like to clean up orphaned data?')) {
          cleanupOrphanedData();
          setIntegrityCheckResult(null);
          alert('Data cleaned up successfully!');
        }
      }, 100);
    }
  };
  
  const handlePinChange = () => {
    // Validate current PIN
    if (currentPin !== settings.parentModePIN) {
      setPinChangeError('Current PIN is incorrect');
      return;
    }
    
    // Validate new PIN
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinChangeError('New PIN must be 4 digits');
      return;
    }
    
    // Validate confirmation
    if (newPin !== confirmNewPin) {
      setPinChangeError('PINs do not match');
      return;
    }
    
    // Update PIN
    updateSettings({ parentModePIN: newPin });
    setShowPinChange(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setPinChangeError('');
    alert('Parent Mode PIN has been updated successfully!');
  };
  
  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'dark':
        return <Moon size={20} />;
      case 'light':
        return <Sun size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Study Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Study Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={settings.dailyStudyHours}
                  onChange={(e) => updateSettings({ dailyStudyHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum hours you plan to study per day (1-15 hours)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={settings.studySessionMinutes}
                  onChange={(e) => updateSettings({ studySessionMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Duration of each study session before taking a break
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  step="5"
                  value={settings.breakMinutes}
                  onChange={(e) => updateSettings({ breakMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Duration of breaks between study sessions
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Theme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ colorTheme: theme.id })}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      settings.colorTheme === theme.id
                        ? 'border-primary-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{theme.emoji}</span>
                      {settings.colorTheme === theme.id && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-gray-800">{theme.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
                    <div className="flex gap-1 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    settings.theme === 'light'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Sun size={18} />
                  Light
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Moon size={18} />
                  Dark
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'system' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    settings.theme === 'system'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Monitor size={18} />
                  System
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Parent Mode
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800 mb-3">
                  Parent Mode provides detailed analytics and performance metrics that are hidden from the student view.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      settings.parentModeEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {settings.parentModeEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setShowPinChange(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Lock size={18} />
                    Change Parent PIN
                  </button>
                  
                  <p className="text-xs text-gray-600">
                    Access Parent Mode from the Progress page by clicking the lock icon in the top-right corner.
                  </p>
                </div>
              </div>
              
              {/* PIN Change Modal */}
              {showPinChange && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Change Parent PIN
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current PIN
                        </label>
                        <input
                          type="password"
                          value={currentPin}
                          onChange={(e) => {
                            setCurrentPin(e.target.value);
                            setPinChangeError('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter current PIN"
                          maxLength={4}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New PIN
                        </label>
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => {
                            setNewPin(e.target.value);
                            setPinChangeError('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter new 4-digit PIN"
                          maxLength={4}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New PIN
                        </label>
                        <input
                          type="password"
                          value={confirmNewPin}
                          onChange={(e) => {
                            setConfirmNewPin(e.target.value);
                            setPinChangeError('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Confirm new PIN"
                          maxLength={4}
                        />
                      </div>
                      
                      {pinChangeError && (
                        <p className="text-red-500 text-sm">{pinChangeError}</p>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPinChange(false);
                            setCurrentPin('');
                            setNewPin('');
                            setConfirmNewPin('');
                            setPinChangeError('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePinChange}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Update PIN
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={handleDataIntegrityCheck}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <AlertTriangle size={18} />
                Check Data Integrity
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('This will clean up any corrupted timer sessions and remove old data. Continue?')) {
                    // Use the comprehensive reset function
                    useStore.getState().resetActiveSessionsAndTimers();
                    useStore.getState().cleanupSessions();
                    alert('Sessions cleaned up successfully! If you had a stuck timer, it should be fixed now.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <AlertTriangle size={18} />
                Fix Stuck Timers
              </button>
              
              {integrityCheckResult && (
                <div className={`p-4 rounded-lg ${
                  integrityCheckResult.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {integrityCheckResult.isValid ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Data integrity verified - No issues found!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Data integrity issues found:</span>
                      </>
                    )}
                  </div>
                  {!integrityCheckResult.isValid && (
                    <ul className="mt-2 text-sm space-y-1">
                      {integrityCheckResult.issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Export Data
              </button>
              
              <div>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload size={18} />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                onClick={() => showConfirm(
                  'Clear All Data',
                  'Are you sure you want to delete ALL your study data? This includes all chapters, exams, study plans, and progress. This action cannot be undone!',
                  handleClearData,
                  'danger'
                )}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Session Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Session Management
            </h3>
            
            <div className="space-y-4">
              {/* Session Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Sessions</span>
                  <span className="text-sm text-gray-600">
                    {activitySessions?.filter(s => s.isActive).length || 0} active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Timer Status</span>
                  <span className={`text-sm font-medium ${activeTimer?.isRunning ? 'text-green-600' : 'text-gray-600'}`}>
                    {activeTimer?.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>

              {/* Reset Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    validateAndFixSessionState();
                    alert('✅ Session state validated and fixed successfully!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full justify-center"
                >
                  <RefreshCw size={18} />
                  Validate & Fix Sessions
                </button>

                <button
                  onClick={() => showConfirm(
                    'Reset Active Sessions',
                    'This will stop all running timers and end all active study sessions. Are you sure?',
                    () => {
                      resetActiveSessionsAndTimers();
                      alert('✅ All sessions and timers have been reset!');
                    },
                    'warning'
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors w-full justify-center"
                >
                  <Clock size={18} />
                  Reset All Timers
                </button>

                <button
                  onClick={() => showConfirm(
                    'Clean Up Sessions',
                    'This will remove all corrupted or orphaned sessions. Continue?',
                    () => {
                      cleanupSessions();
                      alert('✅ Sessions cleaned up successfully!');
                    },
                    'info'
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors w-full justify-center"
                >
                  <Trash2 size={18} />
                  Clean Up Sessions
                </button>
              </div>

              {/* Help Text */}
              <div className="text-xs text-gray-500 space-y-1 mt-4">
                <p>• <strong>Validate & Fix:</strong> Checks and fixes inconsistencies between sessions and activities</p>
                <p>• <strong>Reset Timers:</strong> Stops all running timers and ends active sessions</p>
                <p>• <strong>Clean Up:</strong> Removes corrupted or orphaned session data</p>
              </div>
            </div>
          </div>
          
        </div>
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

export default Settings;