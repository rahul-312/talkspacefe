import { useEffect, useRef } from 'react';

const useChatWebSocket = (roomId, onMessageReceived) => {
  const processedMessageIds = useRef(new Set());

  useEffect(() => {
    const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);
    
    websocket.onopen = () => console.log('WebSocket connected for room:', roomId);
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const messageId = `${data.user_id || data.user}-${data.timestamp}`; // Handle user_id or user
      if (!processedMessageIds.current.has(messageId)) {
        processedMessageIds.current.add(messageId);
        onMessageReceived({
          id: Date.now(),
          message: data.message,
          first_name: data.first_name,
          last_name: data.last_name,
          user: data.user_id || data.user, // Ensure user field matches API
          profile_picture: data.profile_picture, // Include profile_picture
          timestamp: data.timestamp,
        });
      }
    };
    websocket.onerror = (error) => console.error('WebSocket error:', error);
    websocket.onclose = (e) => console.log('WebSocket disconnected, code:', e.code, 'reason:', e.reason);

    const currentProcessedIds = processedMessageIds.current;

    return () => {
      websocket.close();
      currentProcessedIds.clear();
    };
  }, [roomId, onMessageReceived]);
};

export default useChatWebSocket;