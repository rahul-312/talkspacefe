import axios from 'axios';

export const BASE_URL = "http://127.0.0.1:8000/users/";
export const MEDIA_BASE_URL = "http://127.0.0.1:8000"; // Added for media files

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
  USER_BY_ID: `${BASE_URL}`, // For user/<id>/
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
  // Remove static Content-Type here
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  
  // Dynamically set Content-Type based on data type
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  config.headers = { ...config.headers, ...headers };
  return config;
});

// Login function
export const login = async (credentials) => {
  const response = await api.post(API.LOGIN, credentials);
  localStorage.setItem('access_token', response.data.tokens.access);
  localStorage.setItem('refresh_token', response.data.tokens.refresh);
  console.log('Login response:', response.data);
  return response;
};

// Logout function
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return api.post(API.LOGOUT);
};

// Chat-related functions
export const getChatRooms = () => api.get(API.CHATROOM_LIST_CREATE);
export const createChatRoom = (users) => api.post(API.CHATROOM_LIST_CREATE, { users });
export const getChatRoomDetails = (id) => api.get(`${API.CHATROOM_DETAIL}${id}/`);
export const getMessages = (roomId) =>
  api.get(`${API.CHATMESSAGE_LIST_CREATE}?room_id=${roomId}`);
export const sendMessage = (roomId, message) =>
  api.post(API.CHATMESSAGE_LIST_CREATE, { room_id: roomId, message });

// Friend-related function
export const getFriends = () => api.get(API.FRIENDLIST);

// User detail functions
export const getUserDetails = () => api.get(API.USER_DETAIL);
export const getUserProfileById = (id) => api.get(`${API.USER_BY_ID}${id}/`);