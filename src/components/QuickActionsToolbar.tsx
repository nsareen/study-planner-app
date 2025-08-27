import React, { useState } from 'react';
import { 
  Clock, Zap, Copy, Settings, BookOpen, Trash2, 
  RefreshCw, Save, Upload, Download, Sparkles,
  Calculator, Users, Layout
} from 'lucide-react';

interface QuickActionsToolbarProps {
  onSetAllHours: (studyHours: number, revisionHours: number) => void;
  onApplyTemplate: (template: string) => void;
  onBulkDelete: () => void;
  onRecalibrate: () => void;
  onExport: () => void;
  onImport: (data: any) => void;
  totalChapters: number;
  selectedChapters: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const PRESET_TEMPLATES = [
  { id: 'quick', name: '⚡ Quick Prep', study: 1, revision: 0.5, desc: 'For weekly tests' },
  { id: 'standard', name: '📚 Standard', study: 2, revision: 1, desc: 'For monthly exams' },
  { id: 'intensive', name: '🎯 Intensive', study: 3, revision: 1.5, desc: 'For quarterly exams' },
  { id: 'comprehensive', name: '💪 Comprehensive', study: 4, revision: 2, desc: 'For finals' },
  { id: 'revision-focus', name: '🔄 Revision Focus', study: 1, revision: 2, desc: 'For practiced topics' },
];

const SUBJECT_TEMPLATES = [
  { id: 'math', name: 'Mathematics Template', subjects: { Mathematics: { study: 3, revision: 2 } } },
  { id: 'science', name: 'Science Template', subjects: { Physics: { study: 2.5, revision: 1.5 }, Chemistry: { study: 2.5, revision: 1.5 }, Biology: { study: 2, revision: 1 } } },
  { id: 'languages', name: 'Languages Template', subjects: { English: { study: 1.5, revision: 1 }, Hindi: { study: 1.5, revision: 1 } } },
  { id: 'social', name: 'Social Studies Template', subjects: { 'History & Civics': { study: 2, revision: 1.5 }, Geography: { study: 2, revision: 1 } } },
];

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onSetAllHours,
  onApplyTemplate,
  onBulkDelete,
  onRecalibrate,
  onExport,
  onImport,
  totalChapters,
  selectedChapters,
  onSelectAll,
  onClearSelection,
}) => {
  const [showCustomHours, setShowCustomHours] = useState(false);
  const [customStudy, setCustomStudy] = useState(2);
  const [customRevision, setCustomRevision] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);

  const handlePresetClick = (preset: typeof PRESET_TEMPLATES[0]) => {
    onSetAllHours(preset.study, preset.revision);
  };

  const handleCustomApply = () => {
    onSetAllHours(customStudy, customRevision);
    setShowCustomHours(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImport(data);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span className="font-semibold">{totalChapters} chapters</span>
          {selectedChapters.length > 0 && (
            <span className="text-purple-600 font-bold">
              ({selectedChapters.length} selected)
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          {/* Selection Controls */}
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Layout className="w-3.5 h-3.5" />
            Select All
          </button>

          {selectedChapters.length > 0 && (
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          )}

          {/* Recalibrate */}
          <button
            onClick={onRecalibrate}
            className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalibrate
          </button>

          {/* Export/Import */}
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <label className="px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Delete Selected */}
          {selectedChapters.length > 0 && (
            <button
              onClick={onBulkDelete}
              className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Section */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-gray-700">Quick Hour Presets</span>
          <span className="text-xs text-gray-500">(Click to apply to all chapters)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all transform hover:scale-105 group"
            >
              <div className="text-sm font-bold text-gray-800 mb-1">{preset.name}</div>
              <div className="text-xs text-gray-600 mb-2">{preset.desc}</div>
              <div className="flex justify-around text-xs">
                <span className="text-blue-600">📖 {preset.study}h</span>
                <span className="text-green-600">🔄 {preset.revision}h</span>
              </div>
            </button>
          ))}

          {/* Custom Hours Button */}
          <button
            onClick={() => setShowCustomHours(!showCustomHours)}
            className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg transition-all border-2 border-dashed border-gray-300"
          >
            <div className="text-sm font-bold text-gray-800 mb-1">⚙️ Custom</div>
            <div className="text-xs text-gray-600">Set your own</div>
            <Calculator className="w-4 h-4 mx-auto mt-1 text-gray-500" />
          </button>
        </div>

        {/* Custom Hours Input */}
        {showCustomHours && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Study Hours:</label>
              <input
                type="number"
                value={customStudy}
                onChange={(e) => setCustomStudy(parseFloat(e.target.value))}
                min="0.5"
                max="10"
                step="0.5"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Revision Hours:</label>
              <input
                type="number"
                value={customRevision}
                onChange={(e) => setCustomRevision(parseFloat(e.target.value))}
                min="0.5"
                max="10"
                step="0.5"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Apply to All
            </button>
            <button
              onClick={() => setShowCustomHours(false)}
              className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Subject Templates */}
        <div className="mt-4">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Users className="w-4 h-4" />
            Subject Templates
            <span className="text-xs text-gray-500">▼</span>
          </button>

          {showTemplates && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {SUBJECT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onApplyTemplate(template.id)}
                  className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <div className="text-xs font-semibold text-blue-700">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.keys(template.subjects).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
        <span className="text-xl">💡</span>
        <div className="text-xs text-gray-600">
          <strong>Pro Tips:</strong> Use presets for quick setup • Select multiple chapters for bulk operations • 
          Templates apply subject-specific hours • Changes auto-recalibrate your study plan
        </div>
      </div>
    </div>
  );
};

export default QuickActionsToolbar;