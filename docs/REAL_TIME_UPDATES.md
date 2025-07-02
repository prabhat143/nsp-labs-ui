# Real-Time Updates Implementation Guide

## Current Implementation: Polling

### How it works:
- Dashboard and SampleHistory components automatically refresh data every 30 seconds
- Visual indicators show when data is being updated
- Updates only occur when user is logged in and has a valid user ID

### Benefits:
- ✅ Simple to implement and understand
- ✅ Works with existing REST API
- ✅ No additional backend changes required
- ✅ Reliable and predictable

### Limitations:
- ⚠️ May cause unnecessary API calls
- ⚠️ 30-second delay before users see updates
- ⚠️ Uses more bandwidth than event-driven approaches

## Future Enhancement Options

### Option 1: WebSocket Implementation (Recommended)

```typescript
// Backend: Add WebSocket support
io.on('connection', (socket) => {
  socket.on('subscribe-to-samples', (userId) => {
    socket.join(`user-${userId}`);
  });
});

// When sample status changes in DB:
io.to(`user-${userId}`).emit('sample-updated', updatedSample);

// Frontend: WebSocket hook
const useWebSocketUpdates = (userId: string) => {
  useEffect(() => {
    const socket = io();
    
    socket.emit('subscribe-to-samples', userId);
    
    socket.on('sample-updated', (sample) => {
      // Update local state immediately
      setSamples(prev => prev.map(s => 
        s.id === sample.id ? sample : s
      ));
    });

    return () => socket.disconnect();
  }, [userId]);
};
```

### Option 2: Server-Sent Events (SSE)

```typescript
// Backend: SSE endpoint
app.get('/api/samples/events/:userId', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // When sample updates, send event
  res.write(\`data: \${JSON.stringify(updatedSample)}\\n\\n\`);
});

// Frontend: SSE hook
const useSSEUpdates = (userId: string) => {
  useEffect(() => {
    const eventSource = new EventSource(\`/api/samples/events/\${userId}\`);
    
    eventSource.onmessage = (event) => {
      const updatedSample = JSON.parse(event.data);
      setSamples(prev => prev.map(s => 
        s.id === updatedSample.id ? updatedSample : s
      ));
    };

    return () => eventSource.close();
  }, [userId]);
};
```

### Option 3: Database Change Streams (Advanced)

```typescript
// Backend: MongoDB Change Streams
const changeStream = db.collection('sampleSubmissions').watch([
  { $match: { 'fullDocument.consumerId': userId } }
]);

changeStream.on('change', (change) => {
  if (change.operationType === 'update') {
    // Notify connected clients
    notifyClients(change.fullDocument);
  }
});
```

### Option 4: Push Notifications

```typescript
// For mobile apps or PWA
// Send push notifications when status changes
if ('serviceWorker' in navigator && 'PushManager' in window) {
  // Register for push notifications
  // Send notification when sample status changes
}
```

## Implementation Priority

1. **Phase 1 (Current)**: Polling every 30 seconds ✅
2. **Phase 2**: WebSocket real-time updates
3. **Phase 3**: Push notifications for mobile
4. **Phase 4**: Database change streams for enterprise

## Configuration Options

```typescript
// Environment-based polling intervals
const POLLING_INTERVALS = {
  development: 10000, // 10 seconds for testing
  staging: 15000,     // 15 seconds for staging
  production: 30000   // 30 seconds for production
};

// Feature flags for different update methods
const REAL_TIME_CONFIG = {
  enablePolling: true,
  enableWebSockets: false,
  enableSSE: false,
  pollingInterval: POLLING_INTERVALS[process.env.NODE_ENV]
};
```

## Performance Considerations

- **Polling**: Pause when tab is not visible using Page Visibility API
- **WebSockets**: Implement connection pooling and automatic reconnection
- **SSE**: Handle connection drops gracefully
- **Caching**: Use optimistic updates for better UX

## Security Considerations

- Validate user permissions for real-time updates
- Rate limit update requests
- Use secure WebSocket connections (WSS) in production
- Implement authentication for WebSocket connections
