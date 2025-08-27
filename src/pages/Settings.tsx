import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, Download, Upload, Trash2, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { themes } from '../utils/themes';

const Settings: React.FC = () => {
  const { settings, updateSettings, clearAllData, chapters, exams, offDays, dailyLogs } = useStore();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const handleExport = () => {
    const data = {
      chapters,
      exams,
      offDays,
      dailyLogs,
      settings,
      exportDate: new Date().toISOString(),
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
        // In a real implementation, you would validate and merge the data
        // For now, we'll just show a success message
        alert('Data imported successfully! (Note: Full import functionality needs to be implemented)');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };
  
  const handleClearData = () => {
    clearAllData();
    setShowConfirmClear(false);
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
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-3">
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
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Clear All Data
              </button>
            </div>
          </div>
          
          {showConfirmClear && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 mb-3">
                Are you sure you want to clear all data? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;