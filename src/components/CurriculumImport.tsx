import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Download, CheckCircle, Clock, Brain, Zap, Globe, GraduationCap, ExternalLink, Shield, Plus, AlertTriangle } from 'lucide-react';
import { curricula, getChapterSuggestions, searchCurricula, Curriculum, CurriculumSubject } from '../data/curricula';
import { useStore } from '../store/useStore';
import SimpleCurriculumSourceManager from './SimpleCurriculumSourceManager';

interface CurriculumImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const CurriculumImport: React.FC<CurriculumImportProps> = ({ isOpen, onClose }) => {
  const { addChapter } = useStore();
  const [step, setStep] = useState<'select' | 'preview' | 'customize' | 'import'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [customizedSubjects, setCustomizedSubjects] = useState<CurriculumSubject[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [customCurricula, setCustomCurricula] = useState<Curriculum[]>([]);

  const allCurricula = [...curricula, ...customCurricula];
  const filteredCurricula = searchQuery 
    ? allCurricula.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.board.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCurricula;

  const handleSourceImport = async (curriculum: Curriculum) => {
    console.log('📥 Importing curriculum:', curriculum);
    console.log(`📊 Total subjects: ${curriculum.subjects.length}`);
    curriculum.subjects.forEach(subject => {
      console.log(`📖 ${subject.name}: ${subject.chapters.length} chapters`);
    });
    
    // Auto-import all subjects directly
    setStep('import');
    setImportProgress(0);
    
    let totalChapters = 0;
    let importedChapters = 0;
    
    // Count total chapters
    curriculum.subjects.forEach(subject => {
      totalChapters += subject.chapters.length;
    });
    
    console.log(`📊 Auto-importing ${totalChapters} chapters from ${curriculum.subjects.length} subjects`);
    
    // Import all chapters automatically
    for (const subject of curriculum.subjects) {
      console.log(`📖 Importing subject: ${subject.name} (${subject.chapters.length} chapters)`);
      
      for (const chapter of subject.chapters) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Quick import animation
        
        console.log(`✅ Adding chapter: ${chapter.name} (${chapter.estimatedHours}h, ${chapter.difficulty})`);
        
        addChapter({
          subject: subject.name,
          name: chapter.name,
          estimatedHours: chapter.estimatedHours
        });
        
        importedChapters++;
        setImportProgress((importedChapters / totalChapters) * 100);
      }
    }
    
    // Show completion
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`🎉 Successfully imported ${importedChapters} chapters!`);
    
    // Close the modal after import
    onClose();
  };

  useEffect(() => {
    if (selectedCurriculum && step === 'customize') {
      setCustomizedSubjects(
        selectedCurriculum.subjects.filter(subject => 
          selectedSubjects.has(subject.name)
        )
      );
    }
  }, [selectedCurriculum, selectedSubjects, step]);

  const handleCurriculumSelect = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setSelectedSubjects(new Set(curriculum.subjects.slice(0, 3).map(s => s.name)));
    setStep('preview');
  };

  const handleSubjectToggle = (subjectName: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectName)) {
      newSelected.delete(subjectName);
    } else {
      newSelected.add(subjectName);
    }
    setSelectedSubjects(newSelected);
  };

  const handleChapterToggle = (subjectIndex: number, chapterIndex: number) => {
    const newSubjects = [...customizedSubjects];
    const chapter = newSubjects[subjectIndex].chapters[chapterIndex];
    // Toggle selection - we'll add a selected property
    (chapter as any).selected = !(chapter as any).selected;
    setCustomizedSubjects(newSubjects);
  };

  const handleEstimatedHoursChange = (subjectIndex: number, chapterIndex: number, hours: number) => {
    const newSubjects = [...customizedSubjects];
    newSubjects[subjectIndex].chapters[chapterIndex].estimatedHours = hours;
    setCustomizedSubjects(newSubjects);
  };

  const handleImport = async () => {
    setStep('import');
    setImportProgress(0);
    
    let totalChapters = 0;
    let importedChapters = 0;
    
    console.log('🚀 Starting chapter import process...');
    console.log(`📚 Subjects to process: ${customizedSubjects.length}`);
    
    // Count total chapters to import
    customizedSubjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        if ((chapter as any).selected !== false) {
          totalChapters++;
        }
      });
    });
    
    console.log(`📊 Total chapters to import: ${totalChapters}`);

    // Import chapters with progress
    for (const subject of customizedSubjects) {
      console.log(`📖 Processing subject: ${subject.name} (${subject.chapters.length} chapters)`);
      
      for (const chapter of subject.chapters) {
        if ((chapter as any).selected !== false) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
          
          console.log(`✅ Adding chapter: ${chapter.name} (${chapter.estimatedHours}h, ${chapter.difficulty})`);
          
          addChapter({
            subject: subject.name,
            name: chapter.name,
            estimatedHours: chapter.estimatedHours
          });
          
          importedChapters++;
          setImportProgress((importedChapters / totalChapters) * 100);
        }
      }
    }

    // Show completion for a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '🔥';
      default: return '📖';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Smart Curriculum Import</h2>
                <p className="text-white/80 text-sm">
                  {step === 'select' && 'Choose your curriculum'}
                  {step === 'preview' && 'Select subjects to import'}
                  {step === 'customize' && 'Customize chapters and hours'}
                  {step === 'import' && 'Importing your subjects...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            {['select', 'preview', 'customize', 'import'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === stepName 
                    ? 'bg-blue-500 text-white' 
                    : index < ['select', 'preview', 'customize', 'import'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['select', 'preview', 'customize', 'import'].indexOf(step) ? '✓' : index + 1}
                </div>
                {index < 3 && <div className="w-8 h-px bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Select Curriculum */}
          {step === 'select' && (
            <div>
              <div className="mb-6">
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search curricula by board, country, or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => {
                      console.log('Add Source clicked!');
                      setShowSourceManager(true);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Source Transparency</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    All curricula show their data sources. You can add custom sources from websites like BYJU's, official boards, or upload PDFs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCurricula.map((curriculum) => (
                  <button
                    key={curriculum.id}
                    onClick={() => handleCurriculumSelect(curriculum)}
                    className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-800">{curriculum.name}</h3>
                          {curriculum.accuracy && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                curriculum.accuracy >= 90 ? 'bg-green-500' :
                                curriculum.accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-xs text-gray-500">{curriculum.accuracy}%</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{curriculum.description}</p>
                        
                        {/* Source Attribution */}
                        {curriculum.sources && curriculum.sources.length > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500 font-medium">Sources:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {curriculum.sources.slice(0, 2).map((source, index) => (
                                <div key={index} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs">
                                  <ExternalLink className="w-2 h-2" />
                                  <span className="truncate max-w-20">{source.name}</span>
                                  <div className={`w-1 h-1 rounded-full ${
                                    source.reliability === 'high' ? 'bg-green-500' :
                                    source.reliability === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                </div>
                              ))}
                              {curriculum.sources.length > 2 && (
                                <span className="text-xs text-gray-500">+{curriculum.sources.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{curriculum.board}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {curriculum.country}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {curriculum.subjects.length} subjects
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preview and Select Subjects */}
          {step === 'preview' && selectedCurriculum && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedCurriculum.name}
                </h3>
                <p className="text-gray-600">Select the subjects you want to import:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCurriculum.subjects.map((subject) => (
                  <div
                    key={subject.name}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSubjects.has(subject.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSubjectToggle(subject.name)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className={`w-5 h-5 ${
                        selectedSubjects.has(subject.name) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                      {selectedSubjects.has(subject.name) && (
                        <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {subject.chapters.length} chapters
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-500">
                        {subject.chapters.reduce((sum, ch) => sum + ch.estimatedHours, 0)} hours total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customize Chapters */}
          {step === 'customize' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Customize Your Import</h3>
                <p className="text-gray-600">Review and adjust chapters and study hours:</p>
              </div>

              {customizedSubjects.map((subject, subjectIndex) => (
                <div key={subject.name} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    {subject.name}
                  </h4>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {subject.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={(chapter as any).selected !== false}
                          onChange={() => handleChapterToggle(subjectIndex, chapterIndex)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">{chapter.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(chapter.difficulty)}`}>
                              {getDifficultyIcon(chapter.difficulty)} {chapter.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={chapter.estimatedHours}
                            onChange={(e) => handleEstimatedHoursChange(subjectIndex, chapterIndex, parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Import Progress */}
          {step === 'import' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Importing Your Subjects...</h3>
                <p className="text-gray-600">Setting up your personalized study plan</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{Math.round(importProgress)}% complete</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'import' && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            <button
              onClick={() => {
                if (step === 'preview') setStep('select');
                else if (step === 'customize') setStep('preview');
              }}
              disabled={step === 'select'}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                step === 'select' 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              
              {step === 'preview' && (
                <button
                  onClick={() => setStep('customize')}
                  disabled={selectedSubjects.size === 0}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    selectedSubjects.size === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Continue ({selectedSubjects.size} subjects)
                </button>
              )}
              
              {step === 'customize' && (
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Import Subjects
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <SimpleCurriculumSourceManager 
        isOpen={showSourceManager}
        onClose={() => {
          console.log('Closing source manager');
          setShowSourceManager(false);
        }}
        onSourceImport={handleSourceImport}
      />
      
    </div>
  );
};

export default CurriculumImport;

// Note: CurriculumSourceManager should be added inside the return statement before the closing </div>