import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMessages, sendMessage, getChatRoomDetails, MEDIA_BASE_URL } from '../../api';
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

  const token = localStorage.getItem('access_token');
  let currentUserId;
  try {
    const decoded = jwtDecode(token);
    currentUserId = decoded.user_id || decoded.sub;
  } catch (error) {
    currentUserId = null;
    console.error('Error decoding JWT:', error);
  }

  const handleMessageReceived = useCallback((newMsg) => {
    const profilePictureUrl = newMsg.profile_picture
      ? `${MEDIA_BASE_URL}${newMsg.profile_picture.startsWith('/') ? '' : '/'}${newMsg.profile_picture}`
      : '/default-profile.png'; // Updated to use public directory

    const updatedMsg = {
      ...newMsg,
      profile_picture: profilePictureUrl
    };

    setMessages((prev) => [...prev, updatedMsg]);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [setMessages]);

  useChatWebSocket(roomId, handleMessageReceived);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await getMessages(roomId);
      const updatedMessages = response.data.map(msg => {
        const profilePictureUrl = msg.profile_picture
          ? `${MEDIA_BASE_URL}${msg.profile_picture.startsWith('/') ? '' : '/'}${msg.profile_picture}`
          : '/default-profile.png'; // Updated to use public directory
        return {
          ...msg,
          profile_picture: profilePictureUrl
        };
      });
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
    }
  }, [roomId]);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await getChatRoomDetails(roomId);
      if (response.data.other_users && response.data.other_users.length > 0) {
        response.data.other_users = response.data.other_users.map(user => {
          const profilePictureUrl = user.profile_picture
            ? `${MEDIA_BASE_URL}${user.profile_picture.startsWith('/') ? '' : '/'}${user.profile_picture}`
            : '/default-profile.png'; // Updated to use public directory
          return {
            ...user,
            profile_picture: profilePictureUrl
          };
        });
      }
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
      await fetchRoomDetails();
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
    }
  };

  const handleImageError = (e, retries = 2, delay = 1000) => {
    console.error(`Failed to load image: ${e.target.src}`);
    fetch(e.target.src, { method: 'HEAD' })
      .then(response => {
        if (response.status === 404 || response.status === 403) {
          e.target.src = '/default-profile.png'; // Updated to use public directory
        } else if (retries > 0) {
          console.log(`Retrying image load (${retries} attempts left)...`);
          setTimeout(() => {
            e.target.src = `${e.target.src}&retry=${retries}`;
          }, delay);
        } else {
          e.target.src = '/default-profile.png'; // Updated to use public directory
        }
      })
      .catch(err => {
        console.error('Failed to fetch image headers:', err);
        if (retries > 0) {
          console.log(`Retrying image load (${retries} attempts left)...`);
          setTimeout(() => {
            e.target.src = `${e.target.src}&retry=${retries}`;
          }, delay);
        } else {
          e.target.src = '/default-profile.png'; // Updated to use public directory
        }
      });
  };

  useEffect(() => {
    fetchMessages();
    fetchRoomDetails();
  }, [fetchMessages, fetchRoomDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUserId) return <div>Please log in to view messages</div>;

  const isGroupChat = roomDetails?.chat_room?.is_group_chat;
  const groupName = roomDetails?.chat_room?.name;
  const otherUser = roomDetails?.other_users?.[0];

  const profilePictureUrl = otherUser?.profile_picture || '/default-profile.png'; // Updated to use public directory

  return (
    <div className="message-list">
      <div className="chat-header">
        {isGroupChat ? (
          <h3>{groupName || ''}</h3>
        ) : (
          otherUser && (
            <div className="user-header">
              <img
                src={profilePictureUrl}
                alt={`${otherUser.first_name} ${otherUser.last_name}`}
                className="chat-profile-pic"
                onError={(e) => handleImageError(e)}
              />
              <h3>{`${otherUser.first_name} ${otherUser.last_name}`}</h3>
            </div>
          )
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.user === currentUserId ? 'sent' : 'received'}`}
          >
            {msg.user !== currentUserId && (
              <img
                src={msg.profile_picture}
                alt={`${msg.first_name} ${msg.last_name}`}
                className="message-profile-pic"
                onError={(e) => handleImageError(e)}
              />
            )}
            <div className="message-content">
              <strong>{msg.first_name || 'Unknown'} {msg.last_name || ''}</strong>
              <span className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <div>{msg.message}</div>
            </div>
            {msg.user === currentUserId && (
              <img
                src={msg.profile_picture}
                alt={`${msg.first_name} ${msg.last_name}`}
                className="message-profile-pic"
                onError={(e) => handleImageError(e)}
              />
            )}
          </div>
        ))}
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