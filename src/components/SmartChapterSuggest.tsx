import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, BookOpen, Clock, Zap, ChevronRight } from 'lucide-react';
import { getChapterSuggestions, getPopularSubjects } from '../data/curricula';

interface SmartChapterSuggestProps {
  subjectValue: string;
  chapterValue: string;
  onSubjectChange: (subject: string) => void;
  onChapterChange: (chapter: string) => void;
  onChapterSelect: (chapter: { name: string; estimatedHours: number }) => void;
}

const SmartChapterSuggest: React.FC<SmartChapterSuggestProps> = ({
  subjectValue,
  chapterValue,
  onSubjectChange,
  onChapterChange,
  onChapterSelect
}) => {
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [chapterSuggestions, setChapterSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [showChapterSuggestions, setShowChapterSuggestions] = useState(false);
  const [popularSubjects] = useState(getPopularSubjects());
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false);

  // Update subject suggestions based on input
  useEffect(() => {
    if (subjectValue.length > 0) {
      const filtered = popularSubjects.filter(subject =>
        subject.toLowerCase().includes(subjectValue.toLowerCase())
      );
      setSubjectSuggestions(filtered.slice(0, 6));
      setShowSubjectSuggestions(filtered.length > 0 && subjectValue !== '');
    } else {
      setSubjectSuggestions(popularSubjects.slice(0, 8));
      setShowSubjectSuggestions(false);
    }
  }, [subjectValue, popularSubjects]);

  // Update chapter suggestions based on subject
  useEffect(() => {
    if (subjectValue.length > 2) {
      const suggestions = getChapterSuggestions(subjectValue);
      setChapterSuggestions(suggestions);
    } else {
      setChapterSuggestions([]);
    }
  }, [subjectValue]);

  // Filter chapter suggestions based on input
  const filteredChapterSuggestions = chapterSuggestions.filter(chapter =>
    chapter.toLowerCase().includes(chapterValue.toLowerCase())
  ).slice(0, 8);

  const handleSubjectSelect = (subject: string) => {
    onSubjectChange(subject);
    setShowSubjectSuggestions(false);
  };

  const handleChapterSelect = (chapter: string) => {
    // Estimate hours based on chapter name and subject
    const estimatedHours = estimateChapterHours(chapter, subjectValue);
    onChapterSelect({ name: chapter, estimatedHours });
  };

  const generateSmartChapters = async () => {
    if (!subjectValue || subjectValue.length < 3) return;

    setIsGeneratingChapters(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get suggestions and add some AI-generated ones
    const baseSuggestions = getChapterSuggestions(subjectValue);
    const aiSuggestions = generateAIChapters(subjectValue);
    
    const combinedSuggestions = [...new Set([...aiSuggestions, ...baseSuggestions])];
    setChapterSuggestions(combinedSuggestions.slice(0, 12));
    setIsGeneratingChapters(false);
  };

  const estimateChapterHours = (chapterName: string, subject: string): number => {
    // Simple heuristic for estimating hours
    const baseHours = 6;
    const nameLength = chapterName.length;
    
    // Subject-based multipliers
    const subjectMultipliers: Record<string, number> = {
      'mathematics': 1.2,
      'math': 1.2,
      'physics': 1.1,
      'chemistry': 1.1,
      'biology': 1.0,
      'english': 0.9,
      'history': 0.8,
      'geography': 0.8,
    };

    // Complexity keywords that increase hours
    const complexityKeywords = ['advanced', 'complex', 'theory', 'calculus', 'quantum', 'organic'];
    const hasComplexKeyword = complexityKeywords.some(keyword => 
      chapterName.toLowerCase().includes(keyword)
    );

    let multiplier = 1.0;
    for (const [subj, mult] of Object.entries(subjectMultipliers)) {
      if (subject.toLowerCase().includes(subj)) {
        multiplier = mult;
        break;
      }
    }

    if (hasComplexKeyword) multiplier += 0.3;
    if (nameLength > 30) multiplier += 0.2;

    return Math.max(2, Math.min(12, Math.round(baseHours * multiplier * 2) / 2));
  };

  const generateAIChapters = (subject: string): string[] => {
    const subjectLower = subject.toLowerCase();
    
    // AI-style chapter generation based on common patterns
    const patterns: Record<string, string[]> = {
      mathematics: [
        'Fundamentals of ' + subject,
        'Advanced Topics in ' + subject,
        'Problem Solving Techniques',
        'Applications and Real-world Examples',
        'Mathematical Reasoning and Proofs'
      ],
      science: [
        'Introduction to ' + subject,
        'Core Concepts and Principles',
        'Laboratory Techniques and Methods',
        'Modern Applications',
        'Environmental Impact and Ethics'
      ],
      language: [
        'Grammar and Syntax',
        'Literature Analysis',
        'Creative Writing Techniques',
        'Communication Skills',
        'Cultural Context and History'
      ]
    };

    // Determine category
    let category = 'general';
    if (subjectLower.includes('math') || subjectLower.includes('algebra') || subjectLower.includes('calculus')) {
      category = 'mathematics';
    } else if (subjectLower.includes('physics') || subjectLower.includes('chemistry') || subjectLower.includes('biology') || subjectLower.includes('science')) {
      category = 'science';
    } else if (subjectLower.includes('english') || subjectLower.includes('language') || subjectLower.includes('literature')) {
      category = 'language';
    }

    const relevantPatterns = patterns[category] || [
      'Introduction to ' + subject,
      'Core Concepts',
      'Advanced Topics',
      'Practical Applications',
      'Review and Assessment'
    ];

    return relevantPatterns.slice(0, 5);
  };

  const getSubjectEmoji = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('math')) return '🧮';
    if (subjectLower.includes('physics')) return '⚛️';
    if (subjectLower.includes('chemistry')) return '🧪';
    if (subjectLower.includes('biology')) return '🧬';
    if (subjectLower.includes('english')) return '📚';
    if (subjectLower.includes('history')) return '📜';
    if (subjectLower.includes('geography')) return '🌍';
    if (subjectLower.includes('computer')) return '💻';
    if (subjectLower.includes('art')) return '🎨';
    return '📖';
  };

  return (
    <div className="space-y-4">
      {/* Subject Input with Smart Suggestions */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={subjectValue}
            onChange={(e) => onSubjectChange(e.target.value)}
            onFocus={() => setShowSubjectSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Mathematics, Physics, Biology..."
          />
        </div>

        {/* Subject Suggestions Dropdown */}
        {(showSubjectSuggestions || (subjectValue === '' && subjectSuggestions.length > 0)) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4" />
                <span>Popular Subjects</span>
              </div>
            </div>
            <div className="py-2">
              {subjectSuggestions.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => handleSubjectSelect(subject)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">{getSubjectEmoji(subject)}</span>
                  <span className="font-medium text-gray-800">{subject}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapter Input with AI Suggestions */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Chapter Name
          </label>
          {subjectValue && (
            <button
              onClick={generateSmartChapters}
              disabled={isGeneratingChapters}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isGeneratingChapters ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  AI Suggest
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={chapterValue}
            onChange={(e) => onChapterChange(e.target.value)}
            onFocus={() => setShowChapterSuggestions(true)}
            onBlur={() => setTimeout(() => setShowChapterSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Quadratic Equations, Cell Biology..."
          />
        </div>

        {/* Chapter Suggestions Dropdown */}
        {showChapterSuggestions && filteredChapterSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4" />
                <span>Suggested Chapters for {subjectValue}</span>
              </div>
            </div>
            <div className="py-2">
              {filteredChapterSuggestions.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => handleChapterSelect(chapter)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{chapter}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimateChapterHours(chapter, subjectValue)}h
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add from Suggestions */}
      {subjectValue && chapterSuggestions.length > 0 && !showChapterSuggestions && (
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Quick Add Chapters
          </h4>
          <div className="flex flex-wrap gap-2">
            {chapterSuggestions.slice(0, 6).map((chapter, index) => (
              <button
                key={index}
                onClick={() => handleChapterSelect(chapter)}
                className="px-3 py-1.5 bg-white text-sm text-gray-700 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {chapter.length > 25 ? chapter.substring(0, 25) + '...' : chapter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartChapterSuggest;