import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle,
  SkipForward
} from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onComplete: () => void;
  hasNext?: boolean;
  onNext?: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  elapsedSeconds,
  onStart,
  onPause,
  onStop,
  onReset,
  onComplete,
  hasNext,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {!isRunning ? (
        <>
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-105 font-semibold"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onPause}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl hover:shadow-lg transform transition-all hover:scale-105 font-semibold ${
              isPaused 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            )}
          </button>

          <button
            onClick={onStop}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-105 font-semibold"
          >
            <Square className="w-5 h-5" />
            Stop
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-105 font-semibold"
          >
            <CheckCircle className="w-5 h-5" />
            Complete
          </button>

          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform transition-all hover:scale-105 font-semibold"
            >
              <SkipForward className="w-5 h-5" />
              Next Chapter
            </button>
          )}
        </>
      )}

      {!isRunning && elapsedSeconds > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 hover:shadow-md transform transition-all hover:scale-105 font-semibold"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      )}
    </div>
  );
};

export default TimerControls;