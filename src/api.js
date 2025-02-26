import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/users/";

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
};

export const apiConfig = {
  timeout: 10000,
};

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
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
export const createChatRoom = (users) => api.post(API.CHATROOM_LIST_CREATE, { users });
export const getChatRoomDetails = (id) => api.get(`${API.CHATROOM_DETAIL}${id}/`);
export const getMessages = (roomId) =>
  api.get(`${API.CHATMESSAGE_LIST_CREATE}?room_id=${roomId}`);
export const sendMessage = (roomId, message) =>
  api.post(API.CHATMESSAGE_LIST_CREATE, { room_id: roomId, message });
export const getFriends = () => api.get(API.FRIENDLIST);