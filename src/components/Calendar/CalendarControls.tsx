import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CalendarDays,
  Grid3x3,
  List,
  ZoomIn,
  ZoomOut,
  Home
} from 'lucide-react';
import { format } from 'date-fns';

interface CalendarControlsProps {
  currentDate: Date;
  viewMode: 'daily' | 'weekly' | 'monthly';
  zoomLevel: 'small' | 'medium' | 'large';
  onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly') => void;
  onZoomChange: (level: 'small' | 'medium' | 'large') => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  viewMode,
  zoomLevel,
  onViewModeChange,
  onZoomChange,
  onNavigatePrevious,
  onNavigateNext,
  onNavigateToday,
}) => {
  const getDateDisplay = () => {
    switch (viewMode) {
      case 'daily':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'monthly':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel === 'small') onZoomChange('medium');
    else if (zoomLevel === 'medium') onZoomChange('large');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'large') onZoomChange('medium');
    else if (zoomLevel === 'medium') onZoomChange('small');
  };

  return (
    <div className="flex items-center justify-between">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNavigatePrevious}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={onNavigateToday}
          className="px-3 py-1.5 hover:bg-white/20 rounded-lg transition-colors font-medium text-sm"
          title="Go to Today"
        >
          Today
        </button>
        
        <button
          onClick={onNavigateNext}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="ml-4 font-semibold text-lg">
          {getDateDisplay()}
        </div>
      </div>

      {/* View Mode and Zoom Controls */}
      <div className="flex items-center gap-4">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-white/20 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('daily')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'daily' ? 'bg-white text-purple-600' : 'hover:bg-white/20'
            }`}
            title="Daily View"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onViewModeChange('weekly')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'weekly' ? 'bg-white text-purple-600' : 'hover:bg-white/20'
            }`}
            title="Weekly View"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onViewModeChange('monthly')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'monthly' ? 'bg-white text-purple-600' : 'hover:bg-white/20'
            }`}
            title="Monthly View"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            disabled={zoomLevel === 'small'}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs px-2 font-medium">
            {zoomLevel === 'small' ? '50%' : zoomLevel === 'medium' ? '100%' : '150%'}
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            disabled={zoomLevel === 'large'}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;