import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, BookOpen, Calendar, Users, BarChart, Settings, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  tips: string[];
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  startStep?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Study Hero! 🚀',
    description: 'Your personal study companion designed to help you ace your exams and build amazing study habits.',
    icon: <Play className="w-8 h-8 text-primary-600" />,
    tips: [
      'Track your daily study progress',
      'Collaborate with friends',
      'Smart exam preparation',
      'Gamified learning experience'
    ]
  },
  {
    id: 'subjects',
    title: 'Add Your Subjects & Chapters',
    description: 'Start by adding all your subjects and the chapters you need to study. This helps the app create personalized study plans.',
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    tips: [
      'Click "Subjects" in the navigation',
      'Add each subject (Math, Science, etc.)',
      'Break down subjects into chapters',
      'Estimate hours needed for each chapter',
      'Mark difficulty level for better planning'
    ]
  },
  {
    id: 'calendar',
    title: 'Schedule Your Exams & Off Days',
    description: 'Add all your exam dates and holidays so the app can create smart study schedules that avoid conflicts.',
    icon: <Calendar className="w-8 h-8 text-blue-600" />,
    tips: [
      'Go to "Calendar" section',
      'Add exam dates with subjects',
      'Set exam types (Weekly, Monthly, Final)',
      'Mark holidays and off days',
      'The app will prioritize based on deadlines'
    ]
  },
  {
    id: 'daily-plan',
    title: 'Your Daily Study Plan',
    description: 'Every day, get a personalized study schedule based on your exams, available time, and chapter priorities.',
    icon: <Play className="w-8 h-8 text-purple-600" />,
    tips: [
      'Check "Today" page every morning',
      'Use the built-in timer for focus',
      'Mark tasks as complete when done',
      'Customize study hours using "New Plan"',
      'Focus on specific subjects if needed'
    ]
  },
  {
    id: 'collaboration',
    title: 'Study with Friends',
    description: 'Create study rooms, chat with friends, share notes, and take brain breaks with mini-games.',
    icon: <Users className="w-8 h-8 text-pink-600" />,
    tips: [
      'Visit "Study Together" section',
      'Create or join study rooms',
      'Chat with study buddies',
      'Share screenshots and notes',
      'Play brain games during breaks'
    ]
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    description: 'Monitor your study habits, see completion rates, and celebrate your achievements.',
    icon: <BarChart className="w-8 h-8 text-orange-600" />,
    tips: [
      'Check "Progress" for analytics',
      'See weekly study patterns',
      'Monitor chapter completion',
      'Track subject-wise progress',
      'Celebrate milestones and streaks'
    ]
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Personalize the app with different themes, adjust study preferences, and manage your data.',
    icon: <Settings className="w-8 h-8 text-gray-600" />,
    tips: [
      'Choose from 7 beautiful themes',
      'Adjust daily study hours (1-15)',
      'Set break and session durations',
      'Export/import your data',
      'Switch between light/dark modes'
    ]
  }
];

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, startStep = 'welcome' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (startStep !== 'welcome') {
      const stepIndex = tutorialSteps.findIndex(step => step.id === startStep);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [startStep]);

  const currentStep = tutorialSteps[currentStepIndex];
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }
    
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                {currentStep.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentStep.title}</h2>
                <p className="text-white/80 text-sm">Step {currentStepIndex + 1} of {tutorialSteps.length}</p>
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
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            {tutorialSteps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <button
                  onClick={() => handleStepClick(index)}
                  className={`w-full h-2 rounded-full transition-all ${
                    index <= currentStepIndex
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={step.title}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Getting Started</span>
            <span>Ready to Study!</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Here's how to get started:
              </h4>
              <ul className="space-y-3">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Special content for welcome step */}
            {currentStep.id === 'welcome' && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h5 className="font-semibold text-gray-800">Smart Planning</h5>
                  <p className="text-sm text-gray-600">AI-powered study schedules</p>
                </div>
                <div className="bg-white border-2 border-pink-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <h5 className="font-semibold text-gray-800">Study Together</h5>
                  <p className="text-sm text-gray-600">Collaborate with friends</p>
                </div>
                <div className="bg-white border-2 border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <h5 className="font-semibold text-gray-800">Track Progress</h5>
                  <p className="text-sm text-gray-600">Detailed analytics & insights</p>
                </div>
                <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <h5 className="font-semibold text-gray-800">Gamification</h5>
                  <p className="text-sm text-gray-600">Levels, streaks & achievements</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {completedSteps.length} of {tutorialSteps.length} steps completed
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {isLastStep ? 'Get Started!' : 'Next'}
              {!isLastStep && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;