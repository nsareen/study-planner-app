import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Calendar, Clock, Play, Target, CheckCircle, MousePointer, Move } from 'lucide-react';

interface PlannerTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlannerTutorial: React.FC<PlannerTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Smart Study Planner! 🎯",
      icon: <BookOpen className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Smart Study Planner helps you organize your exam preparation with intelligent scheduling and progress tracking.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Separate tracking for Study (first time) and Revision</li>
              <li>Drag and drop chapters to schedule</li>
              <li>Real-time progress tracking with timer</li>
              <li>Adaptive scheduling based on exam dates</li>
            </ul>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📚➡️📅➡️✅</div>
            <p className="text-gray-700 font-medium">Plan → Study → Succeed</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Select Your Exam 📝",
      icon: <Calendar className="w-12 h-12 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            First, select the exam you want to prepare for from the dropdown menu.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-800">
              <strong>Tip:</strong> If you don't see your exam, go to the Calendar page to add one first!
            </p>
          </div>
          <div className="border-2 border-purple-300 rounded-lg p-3 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📋 Select an exam:</span>
              <div className="bg-purple-100 px-3 py-1 rounded">Mid-Term Mathematics</div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="bg-white rounded-lg shadow-md p-4">
            <select className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg bg-purple-50">
              <option>Mid-Term Mathematics - Sep 10</option>
              <option>Quarterly Exam - Sep 26</option>
              <option>Weekly Test - Sep 03</option>
            </select>
          </div>
          <p className="text-center mt-4 text-purple-700 text-sm">
            The planner will create a schedule leading up to your exam date
          </p>
        </div>
      )
    },
    {
      title: "Step 2: Set Study & Revision Hours ⏰",
      icon: <Clock className="w-12 h-12 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Each chapter has two types of hours you can set:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📖 Study Hours</h4>
              <p className="text-blue-700 text-sm">
                Time needed to learn the chapter for the first time
              </p>
              <div className="mt-2 text-2xl font-bold text-blue-600">2-3 hours</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🔄 Revision Hours</h4>
              <p className="text-green-700 text-sm">
                Time needed to revise before exam
              </p>
              <div className="mt-2 text-2xl font-bold text-green-600">1-1.5 hours</div>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>💡 Pro Tip:</strong> Click on the hour values next to each chapter to edit them based on your speed!
            </p>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="bg-white rounded-lg shadow p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Rational Numbers</span>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">📖 2h</button>
                <button className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">🔄 1h</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Logarithms</span>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">📖 3h</button>
                <button className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">🔄 1.5h</button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Drag Chapters to Schedule 🗓️",
      icon: <Move className="w-12 h-12 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Now comes the fun part! Drag chapters from the left catalog to the calendar days:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Choose Study or Revision</p>
                <p className="text-sm text-gray-600">Click the blue Study button or green Revise button on a chapter</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Drag to a Day</p>
                <p className="text-sm text-gray-600">Drag the chapter to any day in the calendar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-medium">Drop to Schedule</p>
                <p className="text-sm text-gray-600">Release to add the task to that day</p>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="relative bg-gray-50 p-4 rounded-lg">
          <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg p-2 z-10 animate-bounce">
            <div className="text-sm font-medium">📖 Logarithms</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-8">
            <div className="bg-white rounded p-2 border-2 border-dashed border-blue-300">
              <div className="text-xs font-medium">Mon</div>
              <div className="text-xs text-gray-500">Sep 01</div>
            </div>
            <div className="bg-blue-50 rounded p-2 border-2 border-blue-400">
              <div className="text-xs font-medium">Tue</div>
              <div className="text-xs text-gray-500">Sep 02</div>
              <div className="text-xs bg-blue-200 rounded px-1 mt-1">Drop here!</div>
            </div>
            <div className="bg-white rounded p-2 border-2 border-dashed border-gray-300">
              <div className="text-xs font-medium">Wed</div>
              <div className="text-xs text-gray-500">Sep 03</div>
            </div>
          </div>
          <MousePointer className="absolute top-12 left-20 text-blue-500 animate-pulse" />
        </div>
      )
    },
    {
      title: "Step 4: Start Studying with Timer ⏱️",
      icon: <Play className="w-12 h-12 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            When you're ready to study, click the Start button on any scheduled task:
          </p>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Timer Features:</h4>
            <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
              <li>Tracks actual time spent vs planned time</li>
              <li>Pause and resume anytime</li>
              <li>Mark complete when finished</li>
              <li>Progress automatically saved</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Currently Studying</p>
                <p className="text-lg font-bold">Logarithms - Mathematics</p>
              </div>
              <div className="text-3xl font-mono">00:23:45</div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">📖 Logarithms</span>
              <span className="text-xs text-gray-500">Planned: 3h</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                <Play size={16} />
                Start
              </button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Track your progress!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Monitor Your Progress 📊",
      icon: <Target className="w-12 h-12 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The planner shows your overall progress with visual indicators:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Study Progress</span>
                <span className="text-blue-600">60%</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 font-medium">Revision Progress</span>
                <span className="text-green-600">30%</span>
              </div>
              <div className="h-2 bg-green-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="text-indigo-800 text-sm">
              <strong>Smart Scheduling:</strong> The planner automatically adjusts if you fall behind or get ahead!
            </p>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-2xl font-bold text-indigo-800 mb-2">You're Doing Great!</p>
            <div className="flex justify-center gap-4 text-sm">
              <div>
                <span className="text-2xl">12</span>
                <p className="text-gray-600">Chapters Done</p>
              </div>
              <div>
                <span className="text-2xl">8</span>
                <p className="text-gray-600">Days Left</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-white/80 text-sm">Step {currentStep + 1} of {tutorialSteps.length}</p>
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

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div 
            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>{currentStepData.content}</div>
            <div>{currentStepData.visual}</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Planning! 🚀
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(Math.min(tutorialSteps.length - 1, currentStep + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlannerTutorial;