import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Calendar, Clock, BookOpen, Target, Award, TrendingUp,
  Play, Plus, Edit2, BarChart3, Users, Brain,
  CheckCircle, AlertTriangle, Sparkles, Zap, Star,
  Grid3x3, CalendarDays, FolderPlus, Rocket, Trophy
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    chapters,
    exams,
    examGroups,
    studyPlans,
    activeStudyPlanId,
    currentUserId,
    users
  } = useStore();

  const currentUser = users.find(u => u.id === currentUserId);
  const activePlan = studyPlans?.find(p => p.id === activeStudyPlanId);
  
  // Calculate statistics
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => c.studyStatus === 'done').length;
  const inProgressChapters = chapters.filter(c => c.studyStatus === 'in-progress').length;
  const totalStudyHours = chapters.reduce((sum, c) => sum + (c.studyHours || 2), 0);
  const completedHours = chapters.reduce((sum, c) => sum + (c.completedStudyHours || 0), 0);
  const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  
  // Get upcoming exams
  const upcomingExams = exams
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  // Get active exam groups
  const activeExamGroups = examGroups?.filter(eg => eg.status === 'applied') || [];

  const quickActions = [
    {
      title: 'Study Plans',
      description: 'Manage multiple study plans',
      icon: CalendarDays,
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/planner'),
      stats: `${studyPlans?.length || 0} plans`,
      highlight: activePlan ? `Active: ${activePlan.name}` : 'No active plan'
    },
    {
      title: 'Chapter Editor',
      description: 'Edit subjects & chapters',
      icon: Edit2,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => navigate('/planner?view=editor'),
      stats: `${totalChapters} chapters`,
      highlight: `${Object.keys(chapters.reduce((acc, c) => ({ ...acc, [c.subject]: true }), {})).length} subjects`
    },
    {
      title: 'Matrix View',
      description: 'Visual study planner',
      icon: Grid3x3,
      color: 'from-green-500 to-emerald-500',
      onClick: () => navigate('/planner?view=matrix'),
      stats: `${inProgressChapters} active`,
      highlight: 'Quick hour setup'
    },
    {
      title: 'Exam Groups',
      description: 'Manage exam schedules',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      onClick: () => navigate('/calendar'),
      stats: `${examGroups?.length || 0} groups`,
      highlight: `${activeExamGroups.length} active`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Welcome back, {currentUser?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              {activePlan && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <Play className="w-4 h-4" />
                  <span className="font-semibold">Active Plan: {activePlan.name}</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-6xl mb-2">{currentUser?.avatar || '🎓'}</div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-700">Level {currentUser?.level || 1}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                🔥 {currentUser?.streak || 0} day streak
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{totalChapters}</span>
            </div>
            <p className="text-gray-600">Total Chapters</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{completedChapters} done</span>
              <Clock className="w-4 h-4 text-orange-500 ml-2" />
              <span>{inProgressChapters} active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{Math.round(totalStudyHours)}h</span>
            </div>
            <p className="text-gray-600">Study Hours</p>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(completedHours / totalStudyHours) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{Math.round(completedHours)}h completed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{progressPercentage}%</span>
            </div>
            <p className="text-gray-600">Overall Progress</p>
            <div className="mt-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Keep going!</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{upcomingExams.length}</span>
            </div>
            <p className="text-gray-600">Upcoming Exams</p>
            {upcomingExams[0] && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Next: </span>
                <span className="text-orange-600">
                  {differenceInDays(parseISO(upcomingExams[0].date), new Date())} days
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Smart Planner Quick Access */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-purple-500" />
              Smart Study Planner
            </h2>
            <button
              onClick={() => navigate('/planner')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 font-semibold"
            >
              <Brain className="w-5 h-5" />
              Open Smart Planner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} opacity-10 rounded-bl-full`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${action.color} rounded-lg text-white`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-500">{action.stats}</span>
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                
                {action.highlight && (
                  <div className="text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg px-2 py-1 inline-block">
                    {action.highlight}
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
              Upcoming Exams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingExams.map(exam => {
                const daysLeft = differenceInDays(parseISO(exam.date), new Date());
                return (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-lg border-2 ${
                      daysLeft <= 7 ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'
                    }`}
                  >
                    <h3 className="font-bold text-gray-800">{exam.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(parseISO(exam.date), 'MMMM d, yyyy')}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-2xl font-bold ${
                        daysLeft <= 7 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {daysLeft} days
                      </span>
                      <span className="text-sm bg-white px-2 py-1 rounded">
                        {exam.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Pro Tips for Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-bold">📚 Multiple Plans:</span> Create different study plans for each exam period
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-bold">✏️ Live Editing:</span> Changes in Editor update everywhere instantly
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-bold">🎯 Quick Setup:</span> Use presets to set hours for all chapters at once
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;