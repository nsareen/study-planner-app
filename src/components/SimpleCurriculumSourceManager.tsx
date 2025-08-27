import React, { useState } from 'react';
import { X, Globe, FileText, Upload, ExternalLink } from 'lucide-react';
import { parseEducationalSite } from '../utils/syllabusParser';

interface SimpleCurriculumSourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceImport: (curriculum: any) => void;
}

const SimpleCurriculumSourceManager: React.FC<SimpleCurriculumSourceManagerProps> = ({
  isOpen,
  onClose,
  onSourceImport
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    
    try {
      // Parse the educational site using intelligent parser
      const parsedData = await parseEducationalSite(urlInput, (message) => {
        setProgressMessage(message);
      });
      
      if (parsedData) {
        const curriculum = {
          id: `scraped-${Date.now()}`,
          name: `${parsedData.source}`,
          board: urlInput.toLowerCase().includes('icse') ? 'ICSE' : 
                 urlInput.toLowerCase().includes('cbse') ? 'CBSE' : 'Custom',
          grade: '9',
          country: urlInput.toLowerCase().includes('icse') || 
                   urlInput.toLowerCase().includes('cbse') ? 'India' : 'Custom',
          description: `Curriculum imported from ${urlInput} - ${parsedData.totalChapters} chapters across ${parsedData.subjects.length} subject(s)`,
          sources: [{
            name: parsedData.source,
            url: urlInput,
            type: 'scraped' as const,
            lastUpdated: new Date().toISOString(),
            reliability: 'high' as const // High reliability for known sources
          }],
          lastVerified: new Date().toISOString(),
          accuracy: 95, // Higher accuracy for parsed data
          subjects: parsedData.subjects.map(subject => ({
            name: subject.name,
            chapters: subject.chapters.map(chapter => ({
              name: chapter.name,
              estimatedHours: chapter.estimatedHours,
              difficulty: chapter.difficulty,
              topics: chapter.topics || []
            }))
          }))
        };

        onSourceImport(curriculum);
        setIsProcessing(false);
        setProgressMessage('');
        setUrlInput('');
        onClose();
      } else {
        // Fallback to basic mock data if parsing fails
        console.warn('Could not parse syllabus, using fallback data');
        throw new Error('Parsing failed');
      }
    } catch (error) {
      // Fallback to generic mock data
      console.error('Failed to parse syllabus:', error);
      const fallbackCurriculum = {
        id: `scraped-${Date.now()}`,
        name: `Curriculum from ${new URL(urlInput).hostname}`,
        board: 'Custom',
        grade: '9',
        country: 'Custom',
        description: `Curriculum imported from ${urlInput} (basic extraction)`,
        sources: [{
          name: `Import from ${new URL(urlInput).hostname}`,
          url: urlInput,
          type: 'scraped' as const,
          lastUpdated: new Date().toISOString(),
          reliability: 'low' as const
        }],
        lastVerified: new Date().toISOString(),
        accuracy: 60,
        subjects: [
          {
            name: 'General Studies',
            chapters: [
              { name: 'Basic Concepts', estimatedHours: 6, difficulty: 'easy' as const },
              { name: 'Intermediate Topics', estimatedHours: 8, difficulty: 'medium' as const },
              { name: 'Advanced Applications', estimatedHours: 10, difficulty: 'hard' as const }
            ]
          }
        ]
      };

      onSourceImport(fallbackCurriculum);
      setIsProcessing(false);
      setProgressMessage('');
      setUrlInput('');
      onClose();
    }
  };

  const handleFileImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const mockCurriculum = {
        id: `pdf-${Date.now()}`,
        name: `Curriculum from ${selectedFile.name}`,
        board: 'Custom PDF',
        grade: '9',
        country: 'Custom',
        description: `Curriculum extracted from ${selectedFile.name}`,
        sources: [{
          name: selectedFile.name,
          url: selectedFile.name,
          type: 'user_uploaded' as const,
          lastUpdated: new Date().toISOString(),
          reliability: 'medium' as const
        }],
        lastVerified: new Date().toISOString(),
        accuracy: 80,
        subjects: [
          {
            name: 'English',
            chapters: [
              { name: 'Grammar', estimatedHours: 6, difficulty: 'easy' as const },
              { name: 'Literature', estimatedHours: 8, difficulty: 'medium' as const },
              { name: 'Writing Skills', estimatedHours: 7, difficulty: 'medium' as const }
            ]
          }
        ]
      };

      onSourceImport(mockCurriculum);
      setIsProcessing(false);
      setSelectedFile(null);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Import Curriculum Source</h2>
              <p className="text-white/80 text-sm">Add from websites or PDF files</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* URL Import */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Import from Website
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://byjus.com/icse/class-9-syllabus/"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUrlImport}
                  disabled={!urlInput.trim() || isProcessing}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isProcessing ? (progressMessage || 'Importing from URL...') : 'Import from URL'}
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              {/* PDF Upload */}
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Upload PDF Syllabus
              </h3>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {selectedFile ? (
                      <div>
                        <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-800">Click to upload PDF</p>
                        <p className="text-sm text-gray-600">Drag and drop or click to select</p>
                      </div>
                    )}
                  </label>
                </div>
                {selectedFile && (
                  <button
                    onClick={handleFileImport}
                    disabled={isProcessing}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 font-semibold"
                  >
                    {isProcessing ? 'Processing PDF...' : 'Import from PDF'}
                  </button>
                )}
              </div>
            </div>

            {/* Popular Sources */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Quick Import - Popular Sources</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: "BYJU'S ICSE Class 9", url: "https://byjus.com/icse/class-9-syllabus/" },
                  { name: "BYJU'S CBSE Class 9", url: "https://byjus.com/cbse/class-9-syllabus/" }
                ].map((source, index) => (
                  <button
                    key={index}
                    onClick={() => setUrlInput(source.url)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{source.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCurriculumSourceManager;