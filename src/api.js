import axios from 'axios';

export const BASE_URL = "http://127.0.0.1:8000/users/";
export const MEDIA_BASE_URL = "http://127.0.0.1:8000";

export const API = {
  REGISTER: `${BASE_URL}register/`,
  LOGIN: `${BASE_URL}login/`,
  LOGOUT: `${BASE_URL}logout/`,
  FRIENDLIST: `${BASE_URL}friend-list/`,
  SEND_FRIEND_REQUEST: `${BASE_URL}send-friend-request/`,
  SEARCH_USER: `${BASE_URL}user-search/`,
  PENDING_REQUESTS: `${BASE_URL}pending-requests/`,
  RESPOND_REQUEST: `${BASE_URL}respond-to-friend-request/`,
  CHATROOM_LIST_CREATE: `${BASE_URL}chatrooms/`,
  CHATROOM_DETAIL: `${BASE_URL}chatrooms/`, 
  CHATMESSAGE_LIST_CREATE: `${BASE_URL}messages/`,
  USER_DETAIL: `${BASE_URL}user-detail/`,
  USER_BY_ID: `${BASE_URL}`,
};

export const apiConfig = {
  timeout: 10000,
};

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: apiConfig.timeout,
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  config.headers = { ...config.headers, ...headers };
  return config;
});

export const login = async (credentials) => {
  const response = await api.post(API.LOGIN, credentials);
  localStorage.setItem('access_token', response.data.tokens.access);
  localStorage.setItem('refresh_token', response.data.tokens.refresh);
  console.log('Login response:', response.data);
  return response;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return api.post(API.LOGOUT);
};

export const getChatRooms = () => api.get(API.CHATROOM_LIST_CREATE);

export const createChatRoom = (userIds, groupName = '') => {
  const payload = {
    user_ids: userIds,
    is_group_chat: userIds.length > 1
  };
  
  if (groupName && userIds.length > 1) {
    payload.name = groupName;
  }

  console.log('Sending payload to createChatRoom:', payload);
  return api.post(API.CHATROOM_LIST_CREATE, payload);
};

export const getChatRoomDetails = (id) => api.get(`${API.CHATROOM_DETAIL}${id}/`);
export const getMessages = (roomId) =>
  api.get(`${API.CHATMESSAGE_LIST_CREATE}?room_id=${roomId}`);
export const sendMessage = (roomId, message) =>
  api.post(API.CHATMESSAGE_LIST_CREATE, { room_id: roomId, message });

// Add edit and delete message functions
export const editMessage = async (roomId, messageId, message) => {
  try {
    const response = await api.put(API.CHATMESSAGE_LIST_CREATE, {
      message_id: messageId,
      message: message,
      room_id: roomId
    });
    return response;
  } catch (error) {
    console.error('Error editing message:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteMessage = async (roomId, messageId) => {
  try {
    const response = await api.delete(API.CHATMESSAGE_LIST_CREATE, {
      data: {
        message_id: messageId,
        room_id: roomId
      }
    });
    return response;
  } catch (error) {
    console.error('Error deleting message:', error.response?.data || error.message);
    throw error;
  }
};

export const getFriends = () => api.get(API.FRIENDLIST);

export const getUserDetails = () => api.get(API.USER_DETAIL);
export const getUserProfileById = (id) => api.get(`${API.USER_BY_ID}${id}/`);

export const deleteChatRoom = (roomId) => {
  return api.delete(`${API.CHATROOM_DETAIL}${roomId}/`);
};