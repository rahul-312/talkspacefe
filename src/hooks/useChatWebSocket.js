import { useEffect, useRef } from 'react';
import { WS_BASE_URL, isAuthenticated } from '../api';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // Retry every 3 seconds
const KNOWN_ACTIONS = ['create', 'edit', 'delete', 'error'];

const useChatWebSocket = (roomId, onMessageReceived) => {
  const processedMessageIds = useRef(new Set());
  // Keep the latest callback without tearing down the socket when it changes.
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!roomId) return undefined;

    let websocket = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    // Set on unmount/room change so onclose doesn't schedule a reconnect.
    let closedByClient = false;
    const processedIds = processedMessageIds.current;

    const handleMessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.error('Ignoring malformed WebSocket frame');
        return;
      }
      if (!data || typeof data !== 'object') return;

      const action = data.action || 'create';
      if (!KNOWN_ACTIONS.includes(action)) return;

      const messageData = {
        id: data.id ?? Date.now(), // Use server-provided ID if available
        message: typeof data.message === 'string' ? data.message : '',
        first_name: data.first_name,
        last_name: data.last_name,
        user: data.user_id ?? data.user,
        profile_picture: data.profile_picture,
        timestamp: data.timestamp,
        action,
      };

      if (action === 'create') {
        // Only process new messages that haven't been processed before
        const messageId = data.id ?? `${messageData.user}-${data.timestamp}`;
        if (processedIds.has(messageId)) return;
        processedIds.add(messageId);
      } else if (action === 'error') {
        console.error('Chat error:', messageData.message);
      }
      onMessageRef.current(messageData);
    };

    const connect = () => {
      // Never (re)open a socket for a signed-out session.
      if (closedByClient || !isAuthenticated()) return;

      websocket = new WebSocket(`${WS_BASE_URL}/ws/chat/${encodeURIComponent(roomId)}/`);

      websocket.onopen = () => {
        reconnectAttempts = 0; // Reset attempts on successful connection
      };

      websocket.onmessage = handleMessage;

      websocket.onerror = () => {
        console.error('WebSocket error for room', roomId);
      };

      websocket.onclose = (e) => {
        if (closedByClient) return;
        // 4xxx codes are application-level rejections (e.g. unauthorized);
        // retrying won't help.
        if (e.code >= 4000 && e.code < 5000) return;
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts += 1;
          reconnectTimer = setTimeout(connect, RECONNECT_INTERVAL);
        } else {
          console.error('Max reconnect attempts reached. Giving up.');
        }
      };
    };

    connect();

    return () => {
      closedByClient = true;
      clearTimeout(reconnectTimer);
      // Close sockets that are still connecting too, not just open ones.
      if (websocket && websocket.readyState !== WebSocket.CLOSED) {
        websocket.close();
      }
      processedIds.clear();
    };
  }, [roomId]);
};

export default useChatWebSocket;
