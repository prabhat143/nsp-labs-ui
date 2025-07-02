import { useEffect, useRef, useState } from 'react';

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onUpdate?: () => void;
}

/**
 * Custom hook for real-time updates using polling
 * Can be extended to use WebSockets in the future
 */
export const useRealTimeUpdates = ({
  enabled = true,
  interval = 30000, // 30 seconds default
  onUpdate
}: UseRealTimeUpdatesOptions) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !onUpdate) {
      return;
    }

    // Set up polling interval
    intervalRef.current = window.setInterval(() => {
      onUpdate();
    }, interval);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, onUpdate]);

  // Cleanup function
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { cleanup };
};

/**
 * Hook for page visibility detection to pause/resume updates
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
