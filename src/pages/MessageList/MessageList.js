import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  getMessages,
  sendMessage,
  getChatRoomDetails,
  editMessage,
  deleteMessage,
  getCurrentUserId,
  mediaUrl,
} from '../../api';
import useChatWebSocket from '../../hooks/useChatWebSocket';
import { FaPhone, FaVideo, FaEdit, FaTrash } from 'react-icons/fa';
import { DEFAULT_AVATAR, fallbackToDefaultAvatar } from '../../assets';
import './MessageList.css';

function MessageList({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [showOptions, setShowOptions] = useState(null); // For three-dots menu
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const currentUserId = getCurrentUserId();

  // Close the options menu on clicks outside any message's actions. (A single
  // shared ref only ever pointed at the last message, which swallowed clicks
  // on every other menu.)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.message-actions')) {
        setShowOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMessageReceived = useCallback((newMsg) => {
    const updatedMsg = {
      ...newMsg,
      profile_picture: mediaUrl(newMsg.profile_picture)
    };

    if (newMsg.action === 'create') {
      setMessages((prev) => [...prev, updatedMsg]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (newMsg.action === 'edit') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMsg.id ? { ...msg, message: newMsg.message } : msg
        )
      );
    } else if (newMsg.action === 'delete') {
      setMessages((prev) => prev.filter((msg) => msg.id !== newMsg.id));
    } else if (newMsg.action === 'error') {
      console.error('Chat error:', newMsg.message);
    }
  }, [setMessages]);

  useChatWebSocket(roomId, handleMessageReceived);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await getMessages(roomId);
      const data = Array.isArray(response.data) ? response.data : [];
      const updatedMessages = data.map((msg) => ({
        ...msg,
        profile_picture: mediaUrl(msg.profile_picture)
      }));
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
    }
  }, [roomId]);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await getChatRoomDetails(roomId);
      if (response.data.other_users && response.data.other_users.length > 0) {
        response.data.other_users = response.data.other_users.map((user) => ({
          ...user,
          profile_picture: mediaUrl(user.profile_picture)
        }));
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

  const handleEditMessage = async (messageId) => {
    try {
      await editMessage(roomId, messageId, editMessageContent);
      setEditingMessageId(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('Error editing message:', error.response?.data || error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(roomId, messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId)); // Local state update
    } catch (error) {
      console.error('Error deleting message:', error.response?.data || error.message);
    }
  };

  const startEditing = (message) => {
    setEditingMessageId(message.id);
    setEditMessageContent(message.message);
    setShowOptions(null); // Close menu when editing starts
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditMessageContent('');
  };

  useEffect(() => {
    fetchMessages();
    fetchRoomDetails();
  }, [fetchMessages, fetchRoomDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUserId) return <div className="loading-container">Please log in to view messages</div>;

  const isGroupChat = roomDetails?.chat_room?.is_group_chat;
  const groupName = roomDetails?.chat_room?.name;
  const otherUser = roomDetails?.other_users?.[0];
  const otherUserName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : '';

  return (
    <div className="message-list">
      <div className="chat-header">
        {isGroupChat ? (
          <h2 className="chat-title">{groupName || ''}</h2>
        ) : (
          otherUser && (
            <div className="user-header">
              <img
                src={otherUser.profile_picture || DEFAULT_AVATAR}
                alt=""
                className="chat-header-avatar"
                onError={fallbackToDefaultAvatar}
              />
              <h2 className="chat-title">{otherUserName}</h2>
            </div>
          )
        )}
        <div className="chat-header-actions">
          <button type="button" className="icon-button" title="Call" aria-label="Call">
            <FaPhone />
          </button>
          <button type="button" className="icon-button" title="Video Call" aria-label="Video call">
            <FaVideo />
          </button>
        </div>
      </div>
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <p className="messages-empty">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.user === currentUserId;
          return (
            <div key={msg.id} className={`message ${isMine ? 'sent' : 'received'}`}>
              <img
                src={msg.profile_picture}
                alt=""
                className="message-avatar"
                onError={fallbackToDefaultAvatar}
              />
              <div className="message-bubble">
                <div className="message-header">
                  <strong>{msg.first_name || 'Unknown'} {msg.last_name || ''}</strong>
                  <span className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {editingMessageId === msg.id ? (
                  <div className="edit-message-form">
                    <input
                      type="text"
                      value={editMessageContent}
                      onChange={(e) => setEditMessageContent(e.target.value)}
                      placeholder="Edit message..."
                      aria-label="Edit message"
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditMessage(msg.id)}
                      disabled={!editMessageContent.trim()}
                    >
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="message-body">
                    <p className="message-text">{msg.message}</p>
                    {isMine && (
                      <div className="message-actions">
                        <button
                          type="button"
                          className="more-options-button"
                          onClick={() => setShowOptions(msg.id === showOptions ? null : msg.id)}
                          title="More options"
                          aria-label="More options"
                          aria-expanded={showOptions === msg.id}
                        >
                          ⋮
                        </button>
                        {showOptions === msg.id && (
                          <div className="more-options-menu" role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className="edit-option"
                              onClick={() => startEditing(msg)}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="delete-option"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              <FaTrash /> Unsend
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <button type="button" className="icon-button attach-button" title="Add media" aria-label="Add media">
          +
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
        />
        <button type="submit" className="btn btn-primary send-button" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageList;
