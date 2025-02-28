import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getChatRooms, createChatRoom, getFriends } from '../../api';
import './ChatRoomList.css';

function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Memoize fetch functions to prevent recreation on every render
  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await getChatRooms();
      console.log('Chat rooms response:', response.data);
      setChatRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await getFriends();
      console.log('Friends API response:', response.data);
      const friendsData = Array.isArray(response.data.friends) ? response.data.friends : [];
      console.log('Setting friends to:', friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id || decodedToken.id;
        console.log('Decoded token:', decodedToken);
        setCurrentUserId(userId);

        await Promise.all([fetchChatRooms(), fetchFriends()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, fetchChatRooms, fetchFriends]); // Include all dependencies

  const handleCreateOrJoinChat = async (friendId) => {
    const existingChat = chatRooms.find(
      (room) =>
        !room.is_group_chat &&
        room.users.includes(friendId) &&
        room.users.includes(currentUserId) && // Use currentUserId instead of hardcoded value
        room.users.length === 2
    );

    if (existingChat) {
      navigate(`/chatrooms/${existingChat.id}`);
    } else {
      try {
        const response = await createChatRoom([friendId]);
        setChatRooms((prev) => [...prev, response.data]);
        navigate(`/chatrooms/${response.data.id}`);
      } catch (error) {
        console.error('Error creating chat room:', error);
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
    try {
      const response = await createChatRoom(selectedFriendIds);
      setChatRooms((prev) => [...prev, response.data]);
      setSelectedFriendIds([]);
      setShowFriends(false);
      navigate(`/chatrooms/${response.data.id}`);
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };

  const getChatDisplayName = (room) => {
    console.log('getChatDisplayName - room:', room, 'currentUserId:', currentUserId, 'friends:', friends);
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

  if (loading || !currentUserId) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="chat-room-list">
      <h1>Chat Rooms</h1>
      <div className="chat-actions">
        <button className="add-chat-button" onClick={() => setShowFriends(!showFriends)}>
          +
        </button>
      </div>

      {showFriends && (
        <div className="friends-dropdown">
          <h3>Create Chat</h3>
          <form className="create-chat-form" onSubmit={handleCreateGroupChat}>
            <div className="friend-selection">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <label key={friend.id}>
                    <input
                      type="checkbox"
                      checked={selectedFriendIds.includes(friend.id)}
                      onChange={() => toggleFriendSelection(friend.id)}
                    />
                    {friend.first_name && friend.last_name ? `${friend.first_name} ${friend.last_name}` : friend.username}
                    <button
                      type="button"
                      className="direct-chat-button"
                      onClick={() => handleCreateOrJoinChat(friend.id)}
                    >
                      Chat
                    </button>
                  </label>
                ))
              ) : (
                <p className="no-friends">No friends available</p>
              )}
            </div>
            <button type="submit" className="create-chat-button" disabled={selectedFriendIds.length < 2}>
              Create Group Chat
            </button>
          </form>
        </div>
      )}

      <h3>Your Chats</h3>
      <ul className="room-list">
        {chatRooms.map((room) => (
          <li key={room.id}>
            <button onClick={() => navigate(`/chatrooms/${room.id}`)}>
              <span className="chat-icon">💬</span>
              {getChatDisplayName(room)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatRoomList;