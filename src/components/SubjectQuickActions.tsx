import React, { useState } from 'react';
import { Clock, Zap, Settings } from 'lucide-react';

interface SubjectQuickActionsProps {
  subject: string;
  onSetHours: (studyHours: number, revisionHours: number) => void;
  chapterCount: number;
}

const QUICK_PRESETS = [
  { label: 'Quick', study: 1, revision: 0.5 },
  { label: 'Standard', study: 2, revision: 1 },
  { label: 'Deep', study: 3, revision: 1.5 },
];

const SubjectQuickActions: React.FC<SubjectQuickActionsProps> = ({
  subject,
  onSetHours,
  chapterCount
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStudy, setCustomStudy] = useState(2);
  const [customRevision, setCustomRevision] = useState(1);

  const handlePresetClick = (preset: typeof QUICK_PRESETS[0]) => {
    onSetHours(preset.study, preset.revision);
    setShowMenu(false);
  };

  const handleCustomApply = () => {
    onSetHours(customStudy, customRevision);
    setShowCustom(false);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-all p-1 text-purple-600 hover:text-purple-700"
        title={`Set hours for all ${chapterCount} chapters in ${subject}`}
      >
        <Zap size={14} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Quick Set Hours</p>
            
            {/* Preset Options */}
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-purple-50 flex justify-between items-center"
              >
                <span>{preset.label}</span>
                <span className="text-gray-500">
                  {preset.study}h / {preset.revision}h
                </span>
              </button>
            ))}

            {/* Custom Option */}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-50 flex items-center gap-2 border-t mt-1 pt-2"
            >
              <Settings size={12} />
              Custom Hours
            </button>

            {showCustom && (
              <div className="mt-2 p-2 bg-gray-50 rounded space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Study:</label>
                  <input
                    type="number"
                    value={customStudy}
                    onChange={(e) => setCustomStudy(parseFloat(e.target.value))}
                    min="0.5"
                    max="10"
                    step="0.5"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Revision:</label>
                  <input
                    type="number"
                    value={customRevision}
                    onChange={(e) => setCustomRevision(parseFloat(e.target.value))}
                    min="0.5"
                    max="10"
                    step="0.5"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  className="w-full px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  Apply to All {chapterCount} Chapters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowMenu(false);
            setShowCustom(false);
          }}
        />
      )}
    </div>
  );
};

export default SubjectQuickActions;