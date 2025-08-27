import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Calendar, Users, BarChart, Settings, Play, HelpCircle, Lightbulb, Zap } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  steps: {
    title: string;
    description: string;
    tips?: string[];
  }[];
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-study-hero',
    question: 'What is Study Hero and how does it help me?',
    answer: 'Study Hero is a smart study planner designed for grade 9 students. It helps you organize your subjects, create daily study schedules, track progress, and collaborate with friends. The app uses intelligent algorithms to prioritize your study tasks based on exam dates and chapter difficulty.',
    category: 'Getting Started'
  },
  {
    id: 'add-subjects',
    question: 'How do I add subjects and chapters?',
    answer: 'Go to the "Subjects" tab, click "Add Chapter", select your subject, enter the chapter name, and estimate study hours. You can also set difficulty levels to help with prioritization. The app will use this information to create your daily study plans.',
    category: 'Subjects'
  },
  {
    id: 'daily-plan',
    question: 'How does the daily study plan work?',
    answer: 'Every day, Study Hero creates a personalized schedule based on your upcoming exams, available study time, and chapter priorities. Use the built-in timer to stay focused, and mark tasks as complete when done. You can customize your daily hours (1-15) using the "New Plan" button.',
    category: 'Daily Planning'
  },
  {
    id: 'exam-scheduling',
    question: 'How do I schedule exams and holidays?',
    answer: 'Use the "Calendar" section to add exam dates, select exam types (Weekly, Monthly, Final), and mark holidays or off days. The app will automatically adjust your study schedule to avoid conflicts and ensure adequate preparation time.',
    category: 'Calendar'
  },
  {
    id: 'collaboration',
    question: 'How can I study with friends?',
    answer: 'Visit "Study Together" to create or join study rooms. You can chat with friends, share screenshots of notes, play brain games during breaks, and motivate each other. Study rooms help maintain accountability and make studying more fun.',
    category: 'Collaboration'
  },
  {
    id: 'progress-tracking',
    question: 'How do I track my study progress?',
    answer: 'The "Progress" section shows detailed analytics including weekly study patterns, chapter completion rates, subject-wise progress, and achievement milestones. Use these insights to identify areas needing more attention.',
    category: 'Progress'
  },
  {
    id: 'themes',
    question: 'Can I change the app\'s appearance?',
    answer: 'Yes! Go to "Settings" to choose from 7 beautiful themes including Spring Garden, Ocean Breeze, Sunset Glow, Forest Walk, Clean Minimal, and Candy Shop. You can also switch between light, dark, and system modes.',
    category: 'Customization'
  },
  {
    id: 'data-backup',
    question: 'How do I backup my study data?',
    answer: 'In "Settings", use the "Export Data" button to download a JSON backup of all your subjects, exams, schedules, and progress. You can import this data later or share it across devices.',
    category: 'Data Management'
  },
  {
    id: 'multiple-users',
    question: 'Can multiple students use the same device?',
    answer: 'Absolutely! Study Hero supports multiple user profiles. Each student (Ananya, Saanvi, Sara, Arshita, etc.) has completely separate data including subjects, exams, progress, and settings. Use the logout button to switch between users.',
    category: 'User Management'
  },
  {
    id: 'study-hours',
    question: 'Can I study more than 8 hours per day?',
    answer: 'Yes! You can set daily study hours anywhere from 1 to 15 hours. Adjust this in Settings or use the "New Plan" button on the Today page to customize your daily schedule.',
    category: 'Study Planning'
  }
];

const guides: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    icon: <Play className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    steps: [
      {
        title: 'Choose Your Profile',
        description: 'Select your student profile from the available options or create a new one.',
        tips: ['Each profile has separate data', 'Switch users anytime with the logout button']
      },
      {
        title: 'Add Your Subjects',
        description: 'Go to Subjects and add all your school subjects and chapters.',
        tips: ['Break subjects into individual chapters', 'Estimate hours realistically', 'Set difficulty levels for better planning']
      },
      {
        title: 'Schedule Your Exams',
        description: 'Use the Calendar to add all upcoming exam dates and holidays.',
        tips: ['Include exam types (Weekly, Monthly, Final)', 'Mark holidays and off days', 'The app will prioritize based on deadlines']
      },
      {
        title: 'Start Your Daily Routine',
        description: 'Check the Today page every morning for your personalized study plan.',
        tips: ['Use the built-in timer', 'Mark tasks complete when done', 'Celebrate daily achievements']
      }
    ]
  },
  {
    id: 'daily-planning',
    title: 'Daily Study Planning',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    steps: [
      {
        title: 'Morning Review',
        description: 'Start each day by checking your personalized study schedule on the Today page.',
        tips: ['Review your daily tasks', 'Check motivational messages', 'Plan your study environment']
      },
      {
        title: 'Using the Timer',
        description: 'Use the built-in focus timer for each study session.',
        tips: ['Click Play to start studying', 'Take breaks between sessions', 'Mark tasks complete when finished']
      },
      {
        title: 'Customizing Your Plan',
        description: 'Use "New Plan" to adjust your daily study hours and focus areas.',
        tips: ['Set daily hours (1-15)', 'Focus on specific subjects', 'Regenerate plans anytime']
      },
      {
        title: 'Evening Review',
        description: 'End your day by reviewing progress and celebrating achievements.',
        tips: ['Check completion percentage', 'Review what you learned', 'Plan for tomorrow']
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Study Together Guide',
    icon: <Users className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    steps: [
      {
        title: 'Create Study Rooms',
        description: 'Set up virtual study spaces for you and your friends.',
        tips: ['Choose descriptive room names', 'Set study topics', 'Invite friends to join']
      },
      {
        title: 'Share and Collaborate',
        description: 'Use chat and screenshot sharing to help each other learn.',
        tips: ['Share notes and solutions', 'Ask questions in chat', 'Explain concepts to others']
      },
      {
        title: 'Take Brain Breaks',
        description: 'Play mini-games together during study breaks.',
        tips: ['Try Tic-Tac-Toe battles', 'Keep breaks short (5-15 minutes)', 'Return to studying refreshed']
      },
      {
        title: 'Motivate Each Other',
        description: 'Support your study buddies and celebrate achievements together.',
        tips: ['Share daily progress', 'Encourage struggling friends', 'Celebrate milestones together']
      }
    ]
  }
];

const Help: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', ...Array.from(new Set(faqData.map(faq => faq.category)))];
  const filteredFAQs = activeCategory === 'All' 
    ? faqData 
    : faqData.filter(faq => faq.category === activeCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const toggleGuide = (id: string) => {
    setOpenGuide(openGuide === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Help Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know to master Study Hero and ace your exams. 
          From basic setup to advanced features, we've got you covered!
        </p>
      </div>

      {/* Quick Start Guides */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Quick Start Guides</h2>
        </div>
        
        <div className="space-y-4">
          {guides.map((guide) => (
            <div key={guide.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleGuide(guide.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-r ${guide.color} rounded-xl text-white`}>
                    {guide.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{guide.title}</h3>
                    <p className="text-sm text-gray-600">Step-by-step instructions</p>
                  </div>
                </div>
                {openGuide === guide.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {openGuide === guide.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="space-y-4">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                          <p className="text-gray-600 mb-2">{step.description}</p>
                          {step.tips && (
                            <ul className="text-sm text-gray-500 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-yellow-400" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{faq.question}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {faq.category}
                  </span>
                </div>
                {openFAQ === faq.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openFAQ === faq.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Still Need Help?</h3>
        <p className="text-gray-600 mb-4">
          Can't find what you're looking for? We're here to help you succeed!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
            📧 Contact Support
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
            💬 Join Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;