import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatRooms, createChatRoom, getFriends } from '../../api';
import './ChatRoomList.css';

function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [showFriends, setShowFriends] = useState(false); // Toggle friend list visibility
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatRooms();
    fetchFriends();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await getChatRooms();
      console.log('Chat rooms response:', response.data);
      setChatRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
    }
  };

  const fetchFriends = async () => {
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
  };

  const handleCreateOrJoinChat = async (friendId) => {
    const existingChat = chatRooms.find((room) => 
      !room.is_group_chat && 
      room.users.includes(friendId) && 
      room.users.length === 2 && 
      room.users.includes(/* current user ID, e.g., from auth */ 5) // Placeholder
    );

    if (existingChat) {
      navigate(`/chatrooms/${existingChat.id}`);
    } else {
      try {
        const response = await createChatRoom([friendId]);
        setChatRooms([...chatRooms, response.data]);
        navigate(`/chatrooms/${response.data.id}`);
      } catch (error) {
        console.error('Error creating chat room:', error);
      }
    }
    setShowFriends(false); // Close friends list after selection
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
      setChatRooms([...chatRooms, response.data]);
      setSelectedFriendIds([]);
      setShowFriends(false);
      navigate(`/chatrooms/${response.data.id}`);
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };

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
              {Array.isArray(friends) && friends.length > 0 ? (
                friends.map((friend) => (
                  <label key={friend.id}>
                    <input
                      type="checkbox"
                      checked={selectedFriendIds.includes(friend.id)}
                      onChange={() => toggleFriendSelection(friend.id)}
                    />
                    {friend.username}
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
              {room.name} {room.is_group_chat ? '(Group)' : '(DM)'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatRoomList;