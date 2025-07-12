// Enhanced WebSocket Hook with improved error handling and performance
import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketHookProps {
  user: { id: string } | null;
  addNotification: (notification: any) => void;
  setIsRealtime: (isRealtime: boolean) => void;
  setSamples: (samples: any) => void;
  setSamplesLoading: (loading: boolean) => void;
  setSamplesError: (error: string | null) => void;
  apiService: any;
}

export const useWebSocket = ({
  user,
  addNotification,
  setIsRealtime,
  setSamples,
  setSamplesLoading,
  setSamplesError,
  apiService
}: WebSocketHookProps) => {
  const stompClientRef = useRef<Client | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectionAttemptsRef = useRef(0);
  const isManuallyDisconnectedRef = useRef(false);
  const lastHeartbeatRef = useRef(Date.now());
  const previousSamplesRef = useRef<any[]>([]);
  const subscriptionsRef = useRef<any[]>([]);
  const connectionMonitorRef = useRef<number | null>(null);
  
  // Add state to track actual connection status
  const [isConnected, setIsConnected] = useState(false);
  const isServerShuttingDownRef = useRef(false);

  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;
  const connectionCheckInterval = 5000; // Check connection every 5 seconds

  // Connection monitoring function
  const startConnectionMonitor = useCallback(() => {
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
    }

    connectionMonitorRef.current = window.setInterval(() => {
      const client = stompClientRef.current;
      const isCurrentlyConnected = client && client.connected;
      
      if (!isCurrentlyConnected && !isManuallyDisconnectedRef.current) {
        console.warn('[WebSocket] Connection lost detected by monitor');
        setIsConnected(false);
        setIsRealtime(false);
        
        // Trigger reconnection if not already in progress
        if (!reconnectTimeoutRef.current) {
          scheduleReconnect();
        }
      }
    }, connectionCheckInterval);
  }, []);

  const stopConnectionMonitor = useCallback(() => {
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
    }
  }, []);

  const getReconnectDelay = useCallback((attempts: number): number => {
    const delay = Math.min(30000, baseReconnectDelay * Math.pow(2, attempts));
    return delay + Math.random() * 1000;
  }, []);

  const handleSampleUpdate = useCallback((update: any) => {
    const previousSamples = previousSamplesRef.current;
    const previousSample = previousSamples.find((p) => p.id === update.id);
    
    setSamples((prevSamples: any[]) => {
      const updatedSamples = prevSamples.map(sample =>
        sample.id === update.id ? { ...sample, ...update } : sample
      );
      previousSamplesRef.current = updatedSamples;
      return updatedSamples;
    });

    // Generate notifications for sample changes
    if (previousSample) {
      if (previousSample.status !== update.status) {
        addNotification({
          type: 'sample_status_change',
          title: 'Sample Status Updated',
          message: `Sample [ID: ${update.id}] status changed from ${previousSample.status.toUpperCase()} to ${update.status.toUpperCase()}`,
          sampleId: update.id,
          data: { previousStatus: previousSample.status, newStatus: update.status }
        });
      }
      
      if (previousSample.assigned !== update.assigned) {
        if (update.assigned && !previousSample.assigned) {
          addNotification({
            type: 'sample_assigned',
            title: 'Agent Assigned',
            message: `Agent ${update.assigned} has been assigned to your sample [ID: ${update.id}]`,
            sampleId: update.id,
            data: { agent: update.assigned }
          });
        } else if (!update.assigned && previousSample.assigned) {
          addNotification({
            type: 'sample_status_change',
            title: 'Agent Unassigned',
            message: `Agent ${previousSample.assigned} has been unassigned from your sample [ID: ${update.id}]`,
            sampleId: update.id,
            data: { previousAgent: previousSample.assigned }
          });
        } else if (update.assigned && previousSample.assigned && update.assigned !== previousSample.assigned) {
          addNotification({
            type: 'sample_assigned',
            title: 'Agent Changed',
            message: `Agent changed from ${previousSample.assigned} to ${update.assigned} for sample [ID: ${update.id}]`,
            sampleId: update.id,
            data: { previousAgent: previousSample.assigned, newAgent: update.assigned }
          });
        }
      }
      
      if (previousSample.status !== 'COMPLETED' && update.status === 'COMPLETED') {
        addNotification({
          type: 'sample_completed',
          title: 'Sample Completed',
          message: `Your sample [ID: ${update.id}] testing has been completed. Report is now available.`,
          sampleId: update.id,
          data: { completedAt: new Date() }
        });
      }
    }
  }, [setSamples, addNotification]);

  const scheduleReconnect = useCallback(() => {
    if (isManuallyDisconnectedRef.current || connectionAttemptsRef.current >= maxReconnectAttempts) {
      if (connectionAttemptsRef.current >= maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached. Giving up.');
        stopConnectionMonitor();
        addNotification({
          type: 'system_error',
          title: 'Connection Lost',
          message: 'Unable to maintain real-time connection. Please refresh the page.',
          data: { severity: 'high' }
        });
      }
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    connectionAttemptsRef.current++;
    const delay = getReconnectDelay(connectionAttemptsRef.current - 1);
    
    console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${connectionAttemptsRef.current}/${maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectWebSocket();
    }, delay);
  }, [addNotification, getReconnectDelay, stopConnectionMonitor]);

  // Enhanced WebSocket connection with proper state management
  const connectWebSocket = useCallback(() => {
    if (isManuallyDisconnectedRef.current) {
      console.log('[WebSocket] Connection attempt aborted - manually disconnected');
      return;
    }

    console.log(`[WebSocket] Connecting... (attempt ${connectionAttemptsRef.current + 1}/${maxReconnectAttempts})`);

    // Clean up existing connection first
    if (stompClientRef.current) {
      console.log('[WebSocket] Cleaning up existing connection');
      try {
        // Unsubscribe from all subscriptions
        subscriptionsRef.current.forEach(subscription => {
          try {
            subscription.unsubscribe();
          } catch (e) {
            console.warn('[WebSocket] Error unsubscribing:', e);
          }
        });
        subscriptionsRef.current = [];
        
        if (stompClientRef.current.connected) {
          stompClientRef.current.deactivate();
        }
      } catch (e) {
        console.warn('[WebSocket] Error deactivating previous client:', e);
      }
      stompClientRef.current = null;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Use import.meta.env for Vite/React projects
    const apiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
    const wsUrl = `${apiUrl}/ws`;
    console.log(`[WebSocket] Attempting to connect to: ${wsUrl}`);
    
    const socket = new SockJS(wsUrl);
    stompClientRef.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0, // We handle reconnection manually
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.MODE === 'development') {
          console.log('[WebSocket Debug]', str);
        }
      },
      onConnect: (frame) => {
        console.log('[WebSocket] Connected successfully', frame);
        setIsConnected(true);
        setIsRealtime(true);
        connectionAttemptsRef.current = 0; // Reset attempts on successful connection
        isServerShuttingDownRef.current = false; // Reset shutdown flag
        
        // Start connection monitoring
        startConnectionMonitor();

        // Clear any existing subscriptions
        subscriptionsRef.current = [];

        // Subscribe to system shutdown notifications
        const shutdownSub = stompClientRef.current?.subscribe('/topic/system/shutdown', (message: any) => {
          console.warn('[WebSocket] Server shutdown notification received');
          isServerShuttingDownRef.current = true;
          setIsConnected(false);
          setIsRealtime(false);
          
          addNotification({
            type: 'system_shutdown',
            title: 'Server Maintenance',
            message: 'Server is shutting down. Connection will be restored automatically.',
            data: { severity: 'warning' }
          });
          
          // Force disconnect and schedule reconnect after shutdown
          setTimeout(() => {
            if (stompClientRef.current) {
              stompClientRef.current.deactivate();
              stompClientRef.current = null;
            }
            // Start reconnecting after server shutdown
            if (!isManuallyDisconnectedRef.current) {
              scheduleReconnect();
            }
          }, 1000);
        });
        if (shutdownSub) subscriptionsRef.current.push(shutdownSub);

        // Subscribe to sample updates
        const sampleSub = stompClientRef.current?.subscribe('/topic/sample-submissions/updates', (message: any) => {
          try {
            const update = JSON.parse(message.body);
            handleSampleUpdate(update);
          } catch (error) {
            console.error('[WebSocket] Error parsing sample update:', error);
          }
        });
        if (sampleSub) subscriptionsRef.current.push(sampleSub);

        // Subscribe to user-specific notifications
        if (user?.id) {
          const userSub = stompClientRef.current?.subscribe(`/user/${user.id}/notifications`, (message: any) => {
            try {
              const notification = JSON.parse(message.body);
              addNotification(notification);
            } catch (error) {
              console.error('[WebSocket] Error parsing notification:', error);
            }
          });
          if (userSub) subscriptionsRef.current.push(userSub);
        }
      },
      onDisconnect: (frame) => {
        console.warn('[WebSocket] Disconnected', frame);
        setIsConnected(false);
        setIsRealtime(false);
        stopConnectionMonitor();
        
        // Only attempt to reconnect if not manually disconnected
        if (!isManuallyDisconnectedRef.current) {
          console.log('[WebSocket] Scheduling reconnect after disconnect');
          scheduleReconnect();
        }
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message']);
        setIsConnected(false);
        setIsRealtime(false);
        stopConnectionMonitor();
        
        if (!isManuallyDisconnectedRef.current) {
          scheduleReconnect();
        }
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket error:', error);
        setIsConnected(false);
        setIsRealtime(false);
        stopConnectionMonitor();
        
        if (!isManuallyDisconnectedRef.current) {
          scheduleReconnect();
        }
      },
      onWebSocketClose: (event) => {
        console.warn('[WebSocket] WebSocket closed:', event);
        setIsConnected(false);
        setIsRealtime(false);
        stopConnectionMonitor();
        
        if (!isManuallyDisconnectedRef.current) {
          console.log('[WebSocket] Scheduling reconnect after WebSocket close');
          scheduleReconnect();
        }
      }
    });

    try {
      console.log('[WebSocket] Activating client...');
      stompClientRef.current.activate();
    } catch (error) {
      console.error('[WebSocket] Error activating client:', error);
      setIsConnected(false);
      setIsRealtime(false);
      if (!isManuallyDisconnectedRef.current) {
        scheduleReconnect();
      }
    }
  }, [
    user?.id,
    addNotification,
    setIsRealtime,
    handleSampleUpdate,
    scheduleReconnect,
    startConnectionMonitor,
    stopConnectionMonitor
  ]);

  const fetchSamplesForNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setSamplesError(null);
      setSamplesLoading(true);
      const sampleSubmissions = await apiService.getSampleSubmissions(user.id);
      setSamples(sampleSubmissions);
      setSamplesLoading(false);
      previousSamplesRef.current = sampleSubmissions;
    } catch (err) {
      setSamplesError('Failed to fetch sample data');
      setSamplesLoading(false);
    }
  }, [user?.id, apiService, setSamples, setSamplesLoading, setSamplesError]);

  const disconnect = useCallback(() => {
    console.log('[WebSocket] Manual disconnect requested');
    isManuallyDisconnectedRef.current = true;
    
    // Stop connection monitoring
    stopConnectionMonitor();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        console.warn('[WebSocket] Error unsubscribing:', e);
      }
    });
    subscriptionsRef.current = [];
    
    if (stompClientRef.current) {
      console.log('[WebSocket] Deactivating client');
      try {
        stompClientRef.current.deactivate();
      } catch (e) {
        console.warn('[WebSocket] Error deactivating client:', e);
      }
      stompClientRef.current = null;
    }
    
    setIsConnected(false);
    setIsRealtime(false);
  }, [setIsRealtime, stopConnectionMonitor]);

  const connect = useCallback(() => {
    console.log('[WebSocket] Manual connect requested');
    isManuallyDisconnectedRef.current = false;
    connectionAttemptsRef.current = 0;
    isServerShuttingDownRef.current = false;
    
    // Clear any existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('[WebSocket] Initializing WebSocket connection for user:', user.id);
    
    // Reset state
    isManuallyDisconnectedRef.current = false;
    connectionAttemptsRef.current = 0;
    isServerShuttingDownRef.current = false;

    // Initial fetch
    fetchSamplesForNotifications();

    // Start WebSocket connection
    connectWebSocket();

    // Cleanup function
    return () => {
      console.log('[WebSocket] Cleanup: Component unmounting');
      stopConnectionMonitor();
      disconnect();
    };
  }, [user?.id, fetchSamplesForNotifications, connectWebSocket, disconnect, stopConnectionMonitor]);

  return {
    connect,
    disconnect,
    isConnected // Now returns the actual state-managed connection status
  };
};