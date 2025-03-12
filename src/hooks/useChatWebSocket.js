import { useEffect, useRef, useCallback } from 'react';

const useChatWebSocket = (roomId, onMessageReceived) => {
  const processedMessageIds = useRef(new Set());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // Retry every 3 seconds

  const connectWebSocket = useCallback(() => {
    const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    websocket.onopen = () => {
      console.log('WebSocket connected for room:', roomId);
      reconnectAttempts.current = 0; // Reset attempts on successful connection
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const messageId = `${data.user_id || data.user}-${data.timestamp}`;
      
      // Get the action type, default to 'create'
      const action = data.action || 'create';
      
      // Prepare the message data
      const messageData = {
        id: data.id || Date.now(), // Use server-provided ID if available
        message: data.message,
        first_name: data.first_name,
        last_name: data.last_name,
        user: data.user_id || data.user,
        profile_picture: data.profile_picture,
        timestamp: data.timestamp,
        action: action // Include action type
      };

      // Handle different action types
      if (action === 'create') {
        // Only process new messages that haven't been processed before
        if (!processedMessageIds.current.has(messageId)) {
          processedMessageIds.current.add(messageId);
          onMessageReceived(messageData);
        }
      } else if (action === 'edit') {
        // For edit actions, always process (don't check processedMessageIds)
        // This allows updates to existing messages
        onMessageReceived(messageData);
      } else if (action === 'delete') {
        // For delete actions, always process
        onMessageReceived(messageData);
      } else if (action === 'error') {
        console.error('Chat error:', data.message);
        onMessageReceived(messageData);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = (e) => {
      console.log('WebSocket disconnected, code:', e.code, 'reason:', e.reason);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(`Reconnecting attempt ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
        setTimeout(connectWebSocket, reconnectInterval);
      } else {
        console.error('Max reconnect attempts reached. Giving up.');
      }
    };

    return websocket;
  }, [roomId, onMessageReceived]);

  useEffect(() => {
    const websocket = connectWebSocket();
    const currentProcessedIds = processedMessageIds.current;

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
      currentProcessedIds.clear();
    };
  }, [connectWebSocket]);
};

export default useChatWebSocket;