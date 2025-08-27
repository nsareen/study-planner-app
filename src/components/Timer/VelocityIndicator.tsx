import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VelocityIndicatorProps {
  status: 'ahead' | 'on-time' | 'behind';
  percentage: number;
  actualMinutes: number;
  plannedMinutes: number;
}

const VelocityIndicator: React.FC<VelocityIndicatorProps> = ({
  status,
  percentage,
  actualMinutes,
  plannedMinutes,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ahead':
        return {
          icon: <Zap className="w-5 h-5" />,
          color: 'text-green-600 bg-green-50',
          borderColor: 'border-green-200',
          message: 'Great pace! You\'re ahead of schedule',
          emoji: '🚀',
        };
      case 'on-time':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-blue-600 bg-blue-50',
          borderColor: 'border-blue-200',
          message: 'Perfect! You\'re right on track',
          emoji: '✨',
        };
      case 'behind':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600 bg-red-50',
          borderColor: 'border-red-200',
          message: 'Take your time, quality matters more than speed',
          emoji: '💪',
        };
    }
  };

  const config = getStatusConfig();
  const difference = actualMinutes - plannedMinutes;
  const differenceText = difference > 0 
    ? `+${difference} min` 
    : difference < 0 
    ? `${difference} min` 
    : 'On time';

  return (
    <div className={`rounded-xl p-4 mb-6 border-2 ${config.borderColor} ${config.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className="font-semibold text-lg">
              Velocity Status
            </span>
          </div>
          <span className="text-2xl">{config.emoji}</span>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">
            {Math.round(percentage)}%
          </div>
          <div className="text-sm opacity-75">
            {differenceText}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-sm font-medium">
        {config.message}
      </div>

      {/* Velocity Meter */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1 opacity-75">
          <span>Faster</span>
          <span>On Track</span>
          <span>Slower</span>
        </div>
        <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="w-1/3 bg-green-400"></div>
            <div className="w-1/3 bg-blue-400"></div>
            <div className="w-1/3 bg-red-400"></div>
          </div>
          {/* Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg"
            style={{ 
              left: `${Math.min(95, Math.max(5, percentage))}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="mt-4 pt-3 border-t border-white/30 grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="opacity-75">Planned</div>
          <div className="font-semibold">{plannedMinutes} min</div>
        </div>
        <div>
          <div className="opacity-75">Actual</div>
          <div className="font-semibold">{actualMinutes} min</div>
        </div>
        <div>
          <div className="opacity-75">Efficiency</div>
          <div className="font-semibold">
            {plannedMinutes > 0 
              ? Math.round((plannedMinutes / Math.max(actualMinutes, 1)) * 100) 
              : 100}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelocityIndicator;