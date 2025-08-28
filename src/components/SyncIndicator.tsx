import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

const SyncIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { validateDataIntegrity, cleanupOrphanedData } = useStore();
  
  // Auto-check data integrity periodically
  useEffect(() => {
    const checkIntegrity = () => {
      setSyncStatus('syncing');
      
      const result = validateDataIntegrity();
      
      if (!result.isValid) {
        // Auto-cleanup orphaned data
        cleanupOrphanedData();
        setSyncStatus('synced');
        console.log('Data integrity issues fixed automatically:', result.issues);
      } else {
        setSyncStatus('synced');
      }
      
      setLastSyncTime(new Date());
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSyncStatus('idle'), 2000);
    };
    
    // Check on mount
    checkIntegrity();
    
    // Check every 30 seconds
    const interval = setInterval(checkIntegrity, 30000);
    
    // Also check when localStorage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'study-planner-storage') {
        checkIntegrity();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [validateDataIntegrity, cleanupOrphanedData]);
  
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'synced':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4 opacity-50" />;
    }
  };
  
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600 bg-blue-100';
      case 'synced':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };
  
  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync Error';
      default:
        return lastSyncTime 
          ? `Last sync: ${lastSyncTime.toLocaleTimeString()}`
          : 'Ready';
    }
  };
  
  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-md transition-all duration-300 ${getStatusColor()}`}
      title={`Data sync status: ${getStatusText()}`}
    >
      {getStatusIcon()}
      <span className="text-xs font-medium">
        {getStatusText()}
      </span>
    </div>
  );
};

export default SyncIndicator;