import { Wifi, WifiOff, Signal, AlertTriangle } from "lucide-react";
import { useNetworkStatus, getConnectionQuality, getConnectionSpeed } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface NetworkStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function NetworkStatusIndicator({ 
  className, 
  showDetails = false, 
  compact = false 
}: NetworkStatusIndicatorProps) {
  const networkStatus = useNetworkStatus();
  const quality = getConnectionQuality(networkStatus);
  const speed = getConnectionSpeed(networkStatus);
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusColor = () => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    switch (quality) {
      case 'excellent':
        return <Wifi className="h-4 w-4" />;
      case 'good':
        return <Signal className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    return speed;
  };

  const getDetailedStatus = () => {
    if (!networkStatus.isOnline) {
      return 'No internet connection';
    }

    const details = [];
    if (networkStatus.effectiveType) {
      details.push(`Network: ${networkStatus.effectiveType.toUpperCase()}`);
    }
    if (networkStatus.downlink) {
      details.push(`Speed: ${networkStatus.downlink} Mbps`);
    }
    if (networkStatus.rtt) {
      details.push(`Latency: ${networkStatus.rtt}ms`);
    }
    
    return details.length > 0 ? details.join(' • ') : 'Connected';
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200",
          getStatusColor(),
          !networkStatus.isOnline && "bg-red-50 dark:bg-red-900/20",
          quality === 'poor' && "bg-yellow-50 dark:bg-yellow-900/20",
          className
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getStatusIcon()}
        {showTooltip && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
            {getDetailedStatus()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
      !networkStatus.isOnline && "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
      quality === 'poor' && "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
      quality === 'good' && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
      quality === 'excellent' && "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
      className
    )}>
      <div className={cn("flex-shrink-0", getStatusColor())}>
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={cn("font-medium text-sm", getStatusColor())}>
          {getStatusText()}
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {getDetailedStatus()}
          </div>
        )}
      </div>
    </div>
  );
}

export function NetworkStatusBanner() {
  const networkStatus = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [lastOnlineState, setLastOnlineState] = useState(networkStatus.isOnline);

  useEffect(() => {
    // Show banner when going offline
    if (lastOnlineState && !networkStatus.isOnline) {
      setShowBanner(true);
    }
    
    // Hide banner when coming back online after a delay
    if (!lastOnlineState && networkStatus.isOnline) {
      setTimeout(() => setShowBanner(false), 3000);
    }

    setLastOnlineState(networkStatus.isOnline);
  }, [networkStatus.isOnline, lastOnlineState]);

  if (!showBanner || networkStatus.isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>No internet connection. Some features may not work properly.</span>
      </div>
    </div>
  );
}

export function useNetworkStatusToast() {
  const networkStatus = useNetworkStatus();
  const [lastOnlineState, setLastOnlineState] = useState(networkStatus.isOnline);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // When going offline
    if (lastOnlineState && !networkStatus.isOnline) {
      // Could integrate with toast system here
      console.log('Network: Connection lost');
    }
    
    // When coming back online
    if (!lastOnlineState && networkStatus.isOnline) {
      console.log('Network: Connection restored');
    }

    setLastOnlineState(networkStatus.isOnline);
  }, [networkStatus.isOnline, lastOnlineState]);

  return networkStatus;
}