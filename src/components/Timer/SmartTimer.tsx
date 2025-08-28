import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react';
import type { Chapter } from '../../types';
import TimerControls from './TimerControls';
import VelocityIndicator from './VelocityIndicator';

interface SmartTimerProps {
  chapter?: Chapter;
  chapters?: Chapter[];
  mode: 'single' | 'subject' | 'daily';
  sessionType: 'study' | 'revision';
  plannedMinutes: number;
  onComplete?: (actualMinutes: number, chapterId?: string) => void;
  onProgress?: (minutes: number) => void;
  onStart?: () => void;
}

const SmartTimer: React.FC<SmartTimerProps> = ({
  chapter,
  chapters = [],
  mode,
  sessionType,
  plannedMinutes,
  onComplete,
  onProgress,
  onStart,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [breaks, setBreaks] = useState<{ start: Date; end?: Date }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate velocity (actual vs planned)
  const actualMinutes = Math.floor(elapsedSeconds / 60);
  const velocityPercentage = plannedMinutes > 0 
    ? ((actualMinutes / plannedMinutes) * 100) 
    : 0;
  
  const getVelocityStatus = () => {
    if (velocityPercentage < 80) return 'ahead';
    if (velocityPercentage <= 120) return 'on-time';
    return 'behind';
  };

  // Get current chapter based on mode
  const getCurrentChapter = () => {
    if (mode === 'single') return chapter;
    if (chapters.length > 0) return chapters[currentChapterIndex];
    return undefined;
  };

  const currentChapter = getCurrentChapter();

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const newElapsed = prev + 1;
          // Report progress every minute
          if (newElapsed % 60 === 0) {
            onProgress?.(Math.floor(newElapsed / 60));
          }
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onProgress]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
    onStart?.();
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      setBreaks([...breaks, { start: new Date() }]);
    } else if (isPaused) {
      setIsPaused(false);
      // Update the last break with end time
      const updatedBreaks = [...breaks];
      if (updatedBreaks.length > 0) {
        updatedBreaks[updatedBreaks.length - 1].end = new Date();
      }
      setBreaks(updatedBreaks);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onComplete?.(actualMinutes, currentChapter?.id);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setSessionStartTime(null);
    setBreaks([]);
  };

  const handleNextChapter = () => {
    if (mode !== 'single' && currentChapterIndex < chapters.length - 1) {
      // Save progress for current chapter
      if (currentChapter) {
        onComplete?.(actualMinutes, currentChapter.id);
      }
      // Move to next chapter
      setCurrentChapterIndex(prev => prev + 1);
      setElapsedSeconds(0);
      setSessionStartTime(new Date());
    }
  };

  const handleComplete = () => {
    if (mode === 'single' || currentChapterIndex === chapters.length - 1) {
      handleStop();
    } else {
      handleNextChapter();
    }
  };

  // Calculate planned time for current session
  const getCurrentPlannedMinutes = () => {
    if (!currentChapter) return plannedMinutes;
    
    if (sessionType === 'study') {
      return currentChapter.studyHours * 60;
    } else {
      return currentChapter.revisionHours * 60;
    }
  };

  const currentPlannedMinutes = getCurrentPlannedMinutes();
  const plannedSeconds = currentPlannedMinutes * 60;
  const remainingSeconds = Math.max(0, plannedSeconds - elapsedSeconds);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Smart Timer
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'single' && 'Single Chapter Session'}
            {mode === 'subject' && `Subject: ${currentChapter?.subject || 'All'}`}
            {mode === 'daily' && 'Daily Study Plan'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sessionType === 'study' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {sessionType === 'study' ? '📖 Study' : '🔄 Revision'}
          </span>
        </div>
      </div>

      {/* Current Chapter Info */}
      {currentChapter && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{currentChapter.name}</h3>
              <p className="text-sm text-gray-600">{currentChapter.subject}</p>
            </div>
            {mode !== 'single' && (
              <div className="text-sm text-gray-500">
                Chapter {currentChapterIndex + 1} of {chapters.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-gray-800 mb-2">
          {formatTime(elapsedSeconds)}
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-1000 ${
              getVelocityStatus() === 'ahead' 
                ? 'bg-green-500' 
                : getVelocityStatus() === 'on-time'
                ? 'bg-blue-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, velocityPercentage)}%` }}
          />
        </div>

        {/* Time Stats */}
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <span className="text-gray-500">Planned:</span>
            <span className="ml-2 font-semibold text-gray-700">
              {currentPlannedMinutes} min
            </span>
          </div>
          <div>
            <span className="text-gray-500">Actual:</span>
            <span className="ml-2 font-semibold text-gray-700">
              {actualMinutes} min
            </span>
          </div>
          <div>
            <span className="text-gray-500">Remaining:</span>
            <span className="ml-2 font-semibold text-gray-700">
              {Math.floor(remainingSeconds / 60)} min
            </span>
          </div>
        </div>
      </div>

      {/* Velocity Indicator */}
      <VelocityIndicator
        status={getVelocityStatus()}
        percentage={velocityPercentage}
        actualMinutes={actualMinutes}
        plannedMinutes={currentPlannedMinutes}
      />

      {/* Timer Controls */}
      <TimerControls
        isRunning={isRunning}
        isPaused={isPaused}
        elapsedSeconds={elapsedSeconds}
        onStart={handleStart}
        onPause={handlePause}
        onStop={handleStop}
        onReset={handleReset}
        onComplete={handleComplete}
        hasNext={mode !== 'single' && currentChapterIndex < chapters.length - 1}
        onNext={handleNextChapter}
      />

      {/* Session Stats */}
      {isRunning && (
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {breaks.length}
            </div>
            <div className="text-xs text-gray-500">Breaks Taken</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((elapsedSeconds / (elapsedSeconds + breaks.reduce((acc, b) => {
                const duration = b.end ? (b.end.getTime() - b.start.getTime()) / 1000 : 0;
                return acc + duration;
              }, 0))) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Focus Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {sessionStartTime ? 
                format(sessionStartTime, 'HH:mm') : 
                '--:--'
              }
            </div>
            <div className="text-xs text-gray-500">Started At</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function - should be imported from date-fns
function format(date: Date, formatStr: string): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default SmartTimer;