import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      });
    };

    const handleOnline = () => {
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
      }));
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    // Initial status
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return networkStatus;
}

export function getConnectionQuality(networkStatus: NetworkStatus): 'excellent' | 'good' | 'poor' | 'offline' {
  if (!networkStatus.isOnline) return 'offline';
  
  if (!networkStatus.effectiveType) return 'good';
  
  switch (networkStatus.effectiveType) {
    case '4g':
      return 'excellent';
    case '3g':
      return 'good';
    case '2g':
    case 'slow-2g':
      return 'poor';
    default:
      return 'good';
  }
}

export function getConnectionSpeed(networkStatus: NetworkStatus): string {
  if (!networkStatus.isOnline) return 'Offline';
  
  if (networkStatus.downlink) {
    if (networkStatus.downlink >= 10) return 'Fast';
    if (networkStatus.downlink >= 1.5) return 'Good';
    return 'Slow';
  }
  
  if (networkStatus.effectiveType) {
    switch (networkStatus.effectiveType) {
      case '4g': return 'Fast';
      case '3g': return 'Good';
      case '2g':
      case 'slow-2g': return 'Slow';
      default: return 'Unknown';
    }
  }
  
  return 'Unknown';
}