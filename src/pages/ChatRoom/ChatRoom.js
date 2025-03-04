import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from '../MessageList/MessageList';
import { getChatRoomDetails } from '../../api';
import './ChatRoom.css';

function ChatRoom() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await getChatRoomDetails(id);
      setRoom(response.data.chat_room);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  if (!room) return <div className="loading">Loading...</div>;

  return (
    <div className="chat-room">
      {/* <h2>{room.name} {room.is_group_chat ? '(Group Chat)' : '(Direct Message)'}</h2> */}
      <MessageList roomId={id} />
    </div>
  );
}

export default ChatRoom;