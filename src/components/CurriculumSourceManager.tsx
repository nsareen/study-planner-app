import React, { useState } from 'react';
import { X, Plus, Globe, FileText, Upload, ExternalLink, AlertCircle, CheckCircle, RefreshCw, Download } from 'lucide-react';

interface CurriculumSource {
  id: string;
  name: string;
  url: string;
  type: 'url' | 'pdf' | 'official';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastUpdated?: string;
  extractedData?: {
    subjects: number;
    chapters: number;
  };
}

interface CurriculumSourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceImport: (curriculum: any) => void;
}

const CurriculumSourceManager: React.FC<CurriculumSourceManagerProps> = ({
  isOpen,
  onClose,
  onSourceImport
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [importMethod, setImportMethod] = useState<'url' | 'pdf'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sources, setSources] = useState<CurriculumSource[]>([
    {
      id: '1',
      name: 'BYJU\'S ICSE Class 9 Syllabus',
      url: 'https://byjus.com/icse/class-9-syllabus/',
      type: 'url',
      status: 'completed',
      lastUpdated: '2024-01-15',
      extractedData: { subjects: 7, chapters: 89 }
    },
    {
      id: '2',
      name: 'CBSE Official Syllabus PDF',
      url: 'cbse_grade9_syllabus.pdf',
      type: 'pdf',
      status: 'completed',
      lastUpdated: '2024-01-10',
      extractedData: { subjects: 6, chapters: 94 }
    }
  ]);

  const popularSources = [
    {
      name: 'BYJU\'S ICSE Class 9',
      url: 'https://byjus.com/icse/class-9-syllabus/',
      description: 'Comprehensive ICSE Class 9 syllabus with all subjects'
    },
    {
      name: 'BYJU\'S CBSE Class 9',
      url: 'https://byjus.com/cbse/class-9-syllabus/',
      description: 'Complete CBSE Class 9 curriculum'
    },
    {
      name: 'Vedantu ICSE Syllabus',
      url: 'https://www.vedantu.com/icse/class-9-syllabus',
      description: 'ICSE Class 9 subject-wise syllabus breakdown'
    },
    {
      name: 'Unacademy CBSE',
      url: 'https://unacademy.com/content/cbse-class-9/',
      description: 'CBSE Grade 9 detailed curriculum'
    }
  ];

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    const newSource: CurriculumSource = {
      id: Date.now().toString(),
      name: `Import from ${new URL(urlInput).hostname}`,
      url: urlInput,
      type: 'url',
      status: 'processing'
    };

    setSources(prev => [...prev, newSource]);

    try {
      // Simulate API call to scrape curriculum data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted curriculum data
      const mockCurriculum = {
        id: `scraped-${Date.now()}`,
        name: `Curriculum from ${new URL(urlInput).hostname}`,
        board: 'Custom',
        grade: '9',
        country: 'Custom',
        description: `Curriculum imported from ${urlInput}`,
        sources: [{
          name: newSource.name,
          url: urlInput,
          type: 'scraped' as const,
          lastUpdated: new Date().toISOString(),
          reliability: 'medium' as const
        }],
        lastVerified: new Date().toISOString(),
        accuracy: 85,
        subjects: generateMockSubjects(urlInput)
      };

      // Update source status
      setSources(prev => prev.map(s => 
        s.id === newSource.id 
          ? { ...s, status: 'completed', lastUpdated: new Date().toISOString(), extractedData: { subjects: mockCurriculum.subjects.length, chapters: mockCurriculum.subjects.reduce((sum, s) => sum + s.chapters.length, 0) } }
          : s
      ));

      onSourceImport(mockCurriculum);
      setUrlInput('');
    } catch (error) {
      setSources(prev => prev.map(s => 
        s.id === newSource.id 
          ? { ...s, status: 'failed' }
          : s
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const newSource: CurriculumSource = {
      id: Date.now().toString(),
      name: selectedFile.name,
      url: selectedFile.name,
      type: 'pdf',
      status: 'processing'
    };

    setSources(prev => [...prev, newSource]);

    try {
      // Simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Mock extracted curriculum data
      const mockCurriculum = {
        id: `pdf-${Date.now()}`,
        name: `Curriculum from ${selectedFile.name}`,
        board: 'Custom',
        grade: '9',
        country: 'Custom',
        description: `Curriculum imported from ${selectedFile.name}`,
        sources: [{
          name: selectedFile.name,
          url: selectedFile.name,
          type: 'user_uploaded' as const,
          lastUpdated: new Date().toISOString(),
          reliability: 'medium' as const
        }],
        lastVerified: new Date().toISOString(),
        accuracy: 80,
        subjects: generateMockSubjectsFromPDF(selectedFile.name)
      };

      setSources(prev => prev.map(s => 
        s.id === newSource.id 
          ? { ...s, status: 'completed', lastUpdated: new Date().toISOString(), extractedData: { subjects: mockCurriculum.subjects.length, chapters: mockCurriculum.subjects.reduce((sum, s) => sum + s.chapters.length, 0) } }
          : s
      ));

      onSourceImport(mockCurriculum);
      setSelectedFile(null);
    } catch (error) {
      setSources(prev => prev.map(s => 
        s.id === newSource.id 
          ? { ...s, status: 'failed' }
          : s
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockSubjects = (url: string) => {
    // Generate subjects based on URL content (simplified)
    const baseSubjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];
    return baseSubjects.map(subject => ({
      name: subject,
      chapters: generateChaptersForSubject(subject, url)
    }));
  };

  const generateMockSubjectsFromPDF = (filename: string) => {
    // Generate subjects based on PDF content (simplified)
    const baseSubjects = ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi'];
    return baseSubjects.map(subject => ({
      name: subject,
      chapters: generateChaptersForSubject(subject, filename)
    }));
  };

  const generateChaptersForSubject = (subject: string, source: string) => {
    const chapterCounts = { Mathematics: 12, English: 8, Physics: 10, Chemistry: 9, Biology: 11, Science: 15, 'Social Studies': 13, Hindi: 10 };
    const count = chapterCounts[subject as keyof typeof chapterCounts] || 10;
    
    return Array.from({ length: count }, (_, i) => ({
      name: `${subject} Chapter ${i + 1}`,
      estimatedHours: Math.floor(Math.random() * 8) + 4,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard'
    }));
  };

  const getStatusIcon = (status: CurriculumSource['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Curriculum Source Manager</h2>
                <p className="text-white/80 text-sm">Import from websites, PDFs, and official sources</p>
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Import New Source
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'manage'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Manage Sources ({sources.length})
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'add' && (
            <div className="space-y-6">
              {/* Import Method Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setImportMethod('url')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    importMethod === 'url'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Import from URL</h3>
                  <p className="text-sm text-gray-600">Scrape curriculum from websites</p>
                </button>
                
                <button
                  onClick={() => setImportMethod('pdf')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    importMethod === 'pdf'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <h3 className="font-semibold">Upload PDF</h3>
                  <p className="text-sm text-gray-600">Extract from PDF syllabus</p>
                </button>
              </div>

              {/* URL Import */}
              {importMethod === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://byjus.com/icse/class-9-syllabus/"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleUrlImport}
                        disabled={!urlInput.trim() || isProcessing}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {isProcessing ? 'Importing...' : 'Import'}
                      </button>
                    </div>
                  </div>

                  {/* Popular Sources */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Popular Sources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {popularSources.map((source, index) => (
                        <button
                          key={index}
                          onClick={() => setUrlInput(source.url)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-800">{source.name}</span>
                          </div>
                          <p className="text-xs text-gray-600">{source.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Import */}
              {importMethod === 'pdf' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Syllabus PDF
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        {selectedFile ? (
                          <div>
                            <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">Ready to import</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-gray-800">Click to upload PDF</p>
                            <p className="text-sm text-gray-600">Supports official syllabus documents</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {selectedFile && (
                      <button
                        onClick={handleFileImport}
                        disabled={isProcessing}
                        className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 font-semibold"
                      >
                        {isProcessing ? 'Processing PDF...' : 'Import from PDF'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Imported Sources</h3>
                <p className="text-sm text-gray-600">{sources.length} sources available</p>
              </div>

              <div className="space-y-3">
                {sources.map((source) => (
                  <div key={source.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(source.status)}
                          <h4 className="font-semibold text-gray-800">{source.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            source.type === 'official' ? 'bg-green-100 text-green-700' :
                            source.type === 'url' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {source.type === 'official' ? 'Official' : source.type === 'url' ? 'Website' : 'PDF'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            {source.url}
                          </p>
                          {source.lastUpdated && (
                            <p>Last updated: {new Date(source.lastUpdated).toLocaleDateString()}</p>
                          )}
                          {source.extractedData && (
                            <p className="text-green-600">
                              ✓ {source.extractedData.subjects} subjects, {source.extractedData.chapters} chapters
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {source.status === 'completed' && (
                          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            View Data
                          </button>
                        )}
                        {source.status === 'failed' && (
                          <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurriculumSourceManager;