import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMessages, sendMessage, getChatRoomDetails } from '../../api';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { jwtDecode } from 'jwt-decode';
import { FaPhone, FaVideo } from 'react-icons/fa';
import './MessageList.css';

function MessageList({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
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
      console.error('Error fetching messages:', error.response?.data || error.message);
    }
  }, [roomId]);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await getChatRoomDetails(roomId);
      console.log('Fetched room details:', response.data);
      setRoomDetails(response.data);
    } catch (error) {
      console.error('Error fetching room details:', error.response?.data || error.message);
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
    fetchRoomDetails();
  }, [fetchMessages, fetchRoomDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUserId) return <div>Please log in to view messages</div>;

  // Determine what to display in the header
  const isGroupChat = roomDetails?.chat_room?.is_group_chat;
  const groupName = roomDetails?.chat_room?.name;
  const otherUser = roomDetails?.other_users?.[0];

  return (
    <div className="message-list">
      <div className="chat-header">
        {/* Display group name for group chats, otherwise other user's name */}
        {isGroupChat ? (
          <h3>{groupName || ''}</h3> // Show group name or empty string if not yet loaded
        ) : (
          otherUser && (
            <h3>{`${otherUser.first_name} ${otherUser.last_name}`}</h3>
          ) // Show other user's name only when available
        )}
        <div className="button-group">
          <button className="call-button" title="Call">
            <FaPhone />
          </button>
          <button className="video-call-button" title="Video Call">
            <FaVideo />
          </button>
        </div>
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