import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BookOpen, Clock, Target } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { getSubjectStats } from '../utils/prioritization';

const Progress: React.FC = () => {
  const { chapters, dailyLogs, currentDate } = useStore();
  
  const subjectStats = useMemo(() => getSubjectStats(chapters), [chapters]);
  
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(parseISO(currentDate), i), 'yyyy-MM-dd');
      const log = dailyLogs.find((l) => l.date === date);
      data.push({
        date: format(subDays(parseISO(currentDate), i), 'EEE'),
        planned: log ? Math.round(log.totalAllocatedMinutes / 60 * 10) / 10 : 0,
        actual: log ? Math.round(log.totalActualMinutes / 60 * 10) / 10 : 0,
      });
    }
    return data;
  }, [dailyLogs, currentDate]);
  
  const subjectProgressData = useMemo(() => {
    return Array.from(subjectStats.entries()).map(([subject, stats]) => ({
      subject,
      completed: stats.completedHours,
      remaining: stats.totalHours - stats.completedHours,
      percentage: Math.round((stats.completedHours / stats.totalHours) * 100),
    }));
  }, [subjectStats]);
  
  const chapterStatusData = useMemo(() => {
    const statusCounts = {
      'Not Started': chapters.filter((c) => c.status === 'not_started').length,
      'In Progress': chapters.filter((c) => c.status === 'in_progress').length,
      'Completed': chapters.filter((c) => c.status === 'complete').length,
    };
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [chapters]);
  
  const COLORS = ['#ef4444', '#3b82f6', '#10b981'];
  
  const totalStats = useMemo(() => {
    const totalHours = chapters.reduce((acc, ch) => acc + ch.estimatedHours, 0);
    const completedHours = chapters.reduce((acc, ch) => acc + (ch.studyProgress || 0), 0);
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.status === 'complete').length;
    
    return {
      totalHours,
      completedHours,
      totalChapters,
      completedChapters,
      progressPercentage: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0,
    };
  }, [chapters]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Progress</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.progressPercentage}%</p>
            </div>
            <TrendingUp className="text-primary-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chapters</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.completedChapters}/{totalStats.totalChapters}
              </p>
            </div>
            <BookOpen className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours Studied</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.completedHours.toFixed(1)}h
              </p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours Left</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalStats.totalHours - totalStats.completedHours).toFixed(1)}h
              </p>
            </div>
            <Target className="text-orange-500" size={32} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Chapter Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chapterStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chapterStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Subject Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectProgressData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="subject" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed Hours" />
            <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {subjectProgressData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Subject Completion</h3>
          <div className="space-y-4">
            {subjectProgressData.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <span className="text-sm text-gray-600">{subject.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;