import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  RefreshCw,
  AlertCircle,
  Calendar,
  Timer,
  Trash2
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import type { ChapterAssignment, Chapter, ActivitySession } from '../types';

interface TodayActivitiesProps {
  assignments: ChapterAssignment[];
  chapters: Chapter[];
  activeSession?: ActivitySession;
  activitySessions?: ActivitySession[];
  onStartActivity: (assignmentId: string) => void;
  onPauseActivity: (sessionId: string) => void;
  onResumeActivity: (sessionId: string) => void;
  onCompleteActivity: (sessionId: string, actualMinutes: number) => void;
  getAssignmentsForDate: (date: string) => ChapterAssignment[];
  onDeleteAssignment?: (assignmentId: string) => void;
}

const TodayActivities: React.FC<TodayActivitiesProps> = ({
  assignments,
  chapters,
  activeSession,
  activitySessions = [],
  onStartActivity,
  onPauseActivity,
  onResumeActivity,
  onCompleteActivity,
  getAssignmentsForDate,
  onDeleteAssignment
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTimes, setElapsedTimes] = useState<Map<string, number>>(new Map());
  const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get today's assignments
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAssignments = getAssignmentsForDate(todayStr);
  

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time for active sessions
  useEffect(() => {
    if (!activeSession) return;
    
    const calculateElapsedTime = () => {
      // Calculate total time from completed pause intervals (ones that have been resumed)
      const completedPausedMs = activeSession.pausedIntervals
        .filter(interval => interval.resumedAt)
        .reduce((total, interval) => {
          return total + (new Date(interval.resumedAt!).getTime() - new Date(interval.pausedAt).getTime());
        }, 0);
      
      let activeTime;
      if (activeSession.isActive) {
        // Currently running - calculate time up to now minus pauses
        activeTime = Date.now() - new Date(activeSession.startTime).getTime() - completedPausedMs;
      } else {
        // Currently paused - calculate time up to when it was paused
        const currentPause = activeSession.pausedIntervals[activeSession.pausedIntervals.length - 1];
        if (currentPause && !currentPause.resumedAt) {
          // Use the pause time as the end point
          activeTime = new Date(currentPause.pausedAt).getTime() - new Date(activeSession.startTime).getTime() - completedPausedMs;
        } else {
          // Fallback calculation
          activeTime = Date.now() - new Date(activeSession.startTime).getTime() - completedPausedMs;
        }
      }
      
      return Math.floor(activeTime / 1000);
    };
    
    // Set initial elapsed time
    const elapsed = calculateElapsedTime();
    setElapsedTimes(prev => new Map(prev).set(activeSession.assignmentId, elapsed));
    
    // Only set up interval if session is active
    if (activeSession.isActive) {
      const interval = setInterval(() => {
        const elapsed = calculateElapsedTime();
        setElapsedTimes(prev => new Map(prev).set(activeSession.assignmentId, elapsed));
      }, 1000);
      
      timerRefs.current.set(activeSession.assignmentId, interval);
      
      return () => {
        clearInterval(interval);
        timerRefs.current.delete(activeSession.assignmentId);
      };
    }
  }, [activeSession]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getChapterInfo = (chapterId: string) => {
    return chapters.find(c => c.id === chapterId);
  };

  const getAssignmentStatus = (assignment: ChapterAssignment) => {
    if (assignment.status === 'completed') return 'completed';
    if (activeSession?.assignmentId === assignment.id) {
      return activeSession.isActive ? 'running' : 'paused';
    }
    // Check if assignment has a status already (might be in-progress or paused)
    if (assignment.status === 'in-progress') {
      // If there's no active session but assignment shows in-progress, it's paused
      return 'paused';
    }
    return assignment.status || 'scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'in-progress': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: 'study' | 'revision') => {
    return type === 'study' ? 
      <BookOpen className="w-4 h-4" /> : 
      <RefreshCw className="w-4 h-4" />;
  };

  const handleStart = (assignmentId: string) => {
    if (onStartActivity) {
      onStartActivity(assignmentId);
    }
  };

  const handlePause = () => {
    if (activeSession && onPauseActivity) {
      onPauseActivity(activeSession.sessionId);
    }
  };

  const handleResume = () => {
    console.log('Resume clicked - activeSession:', activeSession);
    if (activeSession && onResumeActivity) {
      console.log('Calling onResumeActivity with sessionId:', activeSession.sessionId);
      onResumeActivity(activeSession.sessionId);
    } else {
      console.error('Cannot resume - missing session or handler', { activeSession, hasHandler: !!onResumeActivity });
    }
  };

  const handleComplete = (assignmentId: string) => {
    // Find the session for this assignment
    let session = activeSession;
    if (!session || session.assignmentId !== assignmentId) {
      // Try to find the session in activitySessions
      session = activitySessions.find(s => s.assignmentId === assignmentId && !s.endTime);
    }
    
    const elapsedMinutes = Math.floor((elapsedTimes.get(assignmentId) || 0) / 60);
    const confirmMessage = `Are you sure you want to complete this task?\n\nTime spent: ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
    
    if (window.confirm(confirmMessage)) {
      if (session) {
        onCompleteActivity(session.sessionId, elapsedMinutes);
      }
    }
  };

  if (todayAssignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-800">Today's Activities</h2>
          <span className="ml-auto text-sm text-gray-500">
            {format(currentTime, 'EEEE, MMM d')}
          </span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No activities scheduled for today</p>
          <p className="text-sm mt-2">Schedule chapters from the matrix view to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-bold text-gray-800">Today's Activities</h2>
        <span className="ml-auto text-sm text-gray-500">
          {format(currentTime, 'EEEE, MMM d')}
        </span>
      </div>

      <div className="space-y-3">
        {todayAssignments.map((assignment) => {
          const chapter = getChapterInfo(assignment.chapterId);
          if (!chapter) return null;

          const status = getAssignmentStatus(assignment);
          const isActive = activeSession?.assignmentId === assignment.id;
          const elapsedSeconds = elapsedTimes.get(assignment.id) || 0;
          const plannedMinutes = assignment.plannedMinutes;
          const progress = (elapsedSeconds / 60 / plannedMinutes) * 100;

          return (
            <div
              key={assignment.id}
              className={`border rounded-lg p-4 transition-all ${
                isActive ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.activityType === 'study' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {getActivityIcon(assignment.activityType)}
                      {assignment.activityType === 'study' ? 'Study' : 'Revision'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                      {status === 'running' && <Clock className="w-3 h-3 animate-pulse" />}
                      {status === 'paused' && <PauseCircle className="w-3 h-3" />}
                      {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {status}
                    </span>
                    {onDeleteAssignment && status !== 'running' && status !== 'paused' && (
                      <button
                        onClick={() => onDeleteAssignment(assignment.id)}
                        className="ml-auto p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove this activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-800">{chapter.subject}</h3>
                  <p className="text-sm text-gray-600">{chapter.name}</p>
                </div>

                {/* Timer Display */}
                {isActive && (
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-blue-600">
                      {formatTime(elapsedSeconds)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Planned: {Math.floor(plannedMinutes / 60)}h {plannedMinutes % 60}m
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {(isActive || status === 'completed') && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        progress > 100 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  {progress > 100 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Overtime by {Math.round(progress - 100)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {status !== 'running' && status !== 'paused' && status !== 'completed' && (
                  <button
                    onClick={() => handleStart(assignment.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Start</span>
                  </button>
                )}

                {status === 'running' && (
                  <>
                    <button
                      onClick={handlePause}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Pause</span>
                    </button>
                    <button
                      onClick={() => handleComplete(assignment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Complete</span>
                    </button>
                  </>
                )}

                {status === 'paused' && (
                  <>
                    <button
                      onClick={handleResume}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Resume</span>
                    </button>
                    <button
                      onClick={() => handleComplete(assignment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Complete</span>
                    </button>
                  </>
                )}

                {status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Completed</span>
                    {assignment.actualMinutes && (
                      <span className="text-xs text-gray-500">
                        ({Math.floor(assignment.actualMinutes / 60)}h {assignment.actualMinutes % 60}m)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayActivities;