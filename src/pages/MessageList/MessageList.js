import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMessages, sendMessage } from '../../api';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { jwtDecode } from 'jwt-decode';
import './MessageList.css';

function MessageList({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Decode JWT token to get current user ID
  const token = localStorage.getItem('access_token');
  let currentUserId;
  try {
    const decoded = jwtDecode(token);
    currentUserId = decoded.user_id || decoded.sub;
    console.log('Decoded token:', decoded);
    console.log('Current user ID from token:', currentUserId);
  } catch (error) {
    console.error('Error decoding token:', error);
    currentUserId = null;
  }

  const handleMessageReceived = useCallback((newMsg) => {
    console.log('Received WebSocket message:', newMsg);
    setMessages((prev) => {
      const updatedMessages = [...prev, newMsg];
      console.log('Updated messages count:', updatedMessages.length);
      return updatedMessages;
    });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [setMessages]);

  useChatWebSocket(roomId, handleMessageReceived);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await getMessages(roomId);
      console.log('Fetched messages count:', response.data.length);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(roomId, newMessage);
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUserId) return <div>Please log in to view messages</div>;

  return (
    <div className="message-list">
      <div className="chat-header">
        <button className="call-button" title="Call">📞</button>
        <button className="video-call-button" title="Video Call">📹</button>
      </div>
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.map((msg) => {
          console.log(`Message ID: ${msg.id}, User ID: ${msg.user}, Current user ID: ${currentUserId}, Sent: ${msg.user === currentUserId}`);
          return (
            <div
              key={msg.id}
              className={`message ${msg.user === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <strong>{msg.first_name || 'Unknown'} {msg.last_name || ''}</strong>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <div>{msg.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <button type="button" className="plus-button" title="Add media">+</button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
}

export default MessageList;