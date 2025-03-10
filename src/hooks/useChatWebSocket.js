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
      if (!processedMessageIds.current.has(messageId)) {
        processedMessageIds.current.add(messageId);
        onMessageReceived({
          id: Date.now(),
          message: data.message,
          first_name: data.first_name,
          last_name: data.last_name,
          user: data.user_id || data.user,
          profile_picture: data.profile_picture,
          timestamp: data.timestamp,
        });
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