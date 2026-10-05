import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getChatRooms,
  createChatRoom,
  getFriends,
  getUserProfileById,
  deleteChatRoom,
  getCurrentUserId,
  errorMessage,
  mediaUrl,
} from '../../api';
import { ROUTES, chatRoomPath } from '../../routes';
import { DEFAULT_GROUP_AVATAR, fallbackToDefaultAvatar } from '../../assets';
import './ChatRoomList.css';

function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

  // Add a ref for the friends dropdown
  const dropdownRef = useRef(null);

  // Function to close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFriends(false);
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await getChatRooms();
      const rooms = Array.isArray(response.data) ? response.data : [];
      setChatRooms(rooms);
      return rooms;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
      return [];
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await getFriends();
      const friendsData = Array.isArray(response.data.friends) ? response.data.friends : [];
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userProfiles[userId]) {
      try {
        const response = await getUserProfileById(userId);
        setUserProfiles((prev) => ({ ...prev, [userId]: response.data }));
      } catch (error) {
        console.error(`Error fetching profile for user ${userId}:`, error);
      }
    }
  }, [userProfiles]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setCurrentUserId(userId);

        await Promise.all([fetchChatRooms(), fetchFriends()]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        navigate(ROUTES.LOGIN, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, fetchChatRooms, fetchFriends]);

  useEffect(() => {
    if (!loading && chatRooms.length > 0) {
      const uniqueUserIds = new Set();
      chatRooms.forEach((room) => {
        if (!room.is_group_chat && room.other_users?.[0]?.id) {
          uniqueUserIds.add(room.other_users[0].id);
        }
      });
      Promise.all([...uniqueUserIds].map((id) => fetchUserProfile(id)));
    }
  }, [chatRooms, loading, fetchUserProfile]);

  const handleCreateOrJoinChat = async (friendId) => {
    if (creatingChat) return;

    const existingChat = chatRooms.find(
      (room) =>
        !room.is_group_chat &&
        room.users.includes(friendId) &&
        room.users.includes(currentUserId) &&
        room.users.length === 2
    );

    if (existingChat) {
      navigate(chatRoomPath(existingChat.id));
    } else {
      try {
        setCreatingChat(true);
        const response = await createChatRoom([friendId]);
        const chatRoom = response.data;

        setChatRooms((prev) => {
          const exists = prev.some((room) => room.id === chatRoom.id);
          if (exists) {
            return prev;
          }
          return [...prev.filter((room) => room.id !== chatRoom.id), chatRoom];
        });

        await fetchChatRooms();
        navigate(chatRoomPath(chatRoom.id));
      } catch (error) {
        console.error('Error creating/joining chat room:', error);
        console.error('Error details:', error.response?.data);
        const refreshedRooms = await fetchChatRooms();
        const refreshedChat = refreshedRooms.find(
          (room) =>
            !room.is_group_chat &&
            room.users.includes(friendId) &&
            room.users.includes(currentUserId) &&
            room.users.length === 2
        );
        if (refreshedChat) {
          navigate(chatRoomPath(refreshedChat.id));
        } else {
          alert('Failed to create or join chat room: ' + errorMessage(error, 'Unknown error'));
        }
      } finally {
        setCreatingChat(false);
      }
    }
    setShowFriends(false);
  };

  const toggleFriendSelection = (id) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleCreateGroupChat = async (e) => {
    e.preventDefault();
    if (selectedFriendIds.length === 0) return;
    if (!groupName.trim()) {
      alert("Group name is required for group chats.");
      return;
    }

    try {
      setCreatingChat(true);
      const response = await createChatRoom(selectedFriendIds, groupName);
      const newChat = response.data;
      setChatRooms((prev) => [...prev, newChat]);
      await fetchChatRooms();
      setSelectedFriendIds([]);
      setGroupName('');
      setShowFriends(false);
      navigate(chatRoomPath(newChat.id));
    } catch (error) {
      console.error('Error creating group chat:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to create group chat: ' + errorMessage(error, 'Unknown error'));
    } finally {
      setCreatingChat(false);
    }
  };

  const handleDeleteChatRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this chat room?')) {
      try {
        await deleteChatRoom(roomId);
        setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
        await fetchChatRooms();
      } catch (error) {
        console.error('Error deleting chat room:', error);
        alert('Failed to delete chat room: ' + errorMessage(error, 'Unknown error'));
      }
    }
  };

  const getChatProfileImage = (room) => {
    if (room.is_group_chat) {
      return mediaUrl(room.profile_image, DEFAULT_GROUP_AVATAR);
    } else {
      const otherUser = room.other_users?.[0];
      if (otherUser?.profile_picture) {
        return mediaUrl(otherUser.profile_picture);
      }
      return mediaUrl(userProfiles[otherUser?.id]?.profile_picture);
    }
  };

  const getChatDisplayName = (room) => {
    if (room.is_group_chat) {
      return room.name || 'Group Chat';
    } else {
      const otherUser = room.other_users?.[0];
      if (otherUser?.first_name && otherUser?.last_name) {
        return `${otherUser.first_name} ${otherUser.last_name}`;
      } else if (otherUser?.username) {
        return otherUser.username;
      } else {
        return 'Unknown User';
      }
    }
  };

  const friendName = (friend) =>
    friend.first_name && friend.last_name
      ? `${friend.first_name} ${friend.last_name}`
      : friend.username;

  if (loading || !currentUserId) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="page chat-room-list">
      <div className="chat-list-header">
        <h1>Chats</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowFriends(!showFriends)}
          disabled={creatingChat}
        >
          + New chat
        </button>
      </div>

      {showFriends && (
        <div className="modal-backdrop">
          <div className="card create-chat-modal" ref={dropdownRef} role="dialog" aria-label="Start a chat">
            <h2>Start a chat</h2>
            <form className="create-chat-form" onSubmit={handleCreateGroupChat}>
              <div className="friend-selection">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.id} className="friend-option">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedFriendIds.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                          disabled={creatingChat}
                        />
                        <span>{friendName(friend)}</span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCreateOrJoinChat(friend.id)}
                        disabled={creatingChat}
                      >
                        Chat
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-friends">No friends available</p>
                )}
              </div>
              <p className="create-chat-hint muted">
                Select two or more friends to create a group.
              </p>
              <label className="group-name-input">
                Group name
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={100}
                  placeholder="Enter group name"
                  required
                  disabled={creatingChat}
                />
              </label>
              <div className="create-chat-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowFriends(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={selectedFriendIds.length < 2 || creatingChat}
                >
                  Create group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {chatRooms.length === 0 ? (
        <div className="card chat-empty">
          <p>No chats yet. Start one with <strong>+ New chat</strong>.</p>
        </div>
      ) : (
        <ul className="room-list">
          {chatRooms.map((room) => (
            <li key={room.id} className="chat-room-item">
              <button
                type="button"
                className="chat-room-button"
                onClick={() => navigate(chatRoomPath(room.id))}
                disabled={creatingChat}
              >
                <img
                  src={getChatProfileImage(room)}
                  alt=""
                  className="room-avatar"
                  onError={fallbackToDefaultAvatar}
                />
                <span className="room-name">{getChatDisplayName(room)}</span>
                {room.is_group_chat && <span className="room-badge">Group</span>}
              </button>
              <button
                type="button"
                className="delete-chat-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChatRoom(room.id);
                }}
                title="Delete chat room"
                aria-label={`Delete ${getChatDisplayName(room)}`}
                disabled={creatingChat}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ChatRoomList;
