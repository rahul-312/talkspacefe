import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ROUTES, isPublicPath } from './routes';
import { DEFAULT_AVATAR } from './assets';

// Configure per environment with REACT_APP_API_URL (see .env.example).
// Production builds should point this at an https:// origin.
const SERVER_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
const API_ORIGIN = new URL(SERVER_URL).origin;

export const BASE_URL = `${SERVER_URL}/users/`;
export const MEDIA_BASE_URL = SERVER_URL;
// http -> ws, https -> wss
export const WS_BASE_URL = SERVER_URL.replace(/^http/, 'ws');

export const API = {
  REGISTER: `${BASE_URL}register/`,
  LOGIN: `${BASE_URL}login/`,
  LOGOUT: `${BASE_URL}logout/`,
  FORGOT_PASSWORD: `${BASE_URL}forgot-password/`,
  RESET_PASSWORD: `${BASE_URL}reset-password/`,
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

// Escape a value before interpolating it into a URL path segment.
const seg = (value) => encodeURIComponent(String(value));

/* ---------- token storage ---------- */

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// True only for a well-formed JWT whose exp is still in the future.
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const isAuthenticated = () => isTokenValid(getRefreshToken());

export const getCurrentUserId = () => {
  try {
    const decoded = jwtDecode(getAccessToken());
    return decoded.user_id ?? decoded.sub ?? decoded.id ?? null;
  } catch {
    return null;
  }
};

/* ---------- axios instance ---------- */

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Requests can opt out with custom config flags:
//   skipAuth: public endpoint, never send a token (a stale one would 401)
//   skipAuthRedirect: send the token, but don't bounce to /login on 401
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  let sameOrigin = false;
  try {
    sameOrigin = new URL(api.getUri(config)).origin === API_ORIGIN;
  } catch {
    sameOrigin = false;
  }

  // Never leak the bearer token to any host other than our API.
  if (token && sameOrigin && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config?.skipAuth && !config?.skipAuthRedirect) {
      clearAuth();
      const base = process.env.PUBLIC_URL || '';
      const path = window.location.pathname.slice(base.length) || '/';
      if (!isPublicPath(path)) {
        // Full reload also drops any sensitive data held in React state.
        window.location.replace(`${base}${ROUTES.LOGIN}`);
      }
    }
    return Promise.reject(error);
  }
);

// Reduce a DRF-style error payload to one short display string.
export const errorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data || typeof data !== 'object') return fallback;
  const first = data.detail ?? data.message ?? data.error ?? Object.values(data)[0];
  const value = Array.isArray(first) ? first[0] : first;
  return typeof value === 'string' && value.length <= 300 ? value : fallback;
};

/* ---------- media ---------- */

// Resolve a server-supplied media path, allowing only http(s) URLs.
export const mediaUrl = (path, fallback = DEFAULT_AVATAR) => {
  if (!path || typeof path !== 'string') return fallback;
  try {
    const url = new URL(path, `${MEDIA_BASE_URL}/`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : fallback;
  } catch {
    return fallback;
  }
};

/* ---------- auth ---------- */

export const login = async (credentials) => {
  const response = await api.post(API.LOGIN, credentials, { skipAuth: true });
  const tokens = response.data?.tokens;
  if (!tokens?.access || !tokens?.refresh) {
    throw new Error('Login response did not include tokens');
  }
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  return response;
};

// Ask the server to revoke the refresh token while the access token is still
// attached, then always wipe local credentials, even if the request fails.
export const logout = async () => {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await api.post(API.LOGOUT, { refresh: refreshToken }, { skipAuthRedirect: true });
    }
  } finally {
    clearAuth();
  }
};

export const register = (formData) => api.post(API.REGISTER, formData, { skipAuth: true });

export const requestPasswordReset = (email) =>
  api.post(API.FORGOT_PASSWORD, { email }, { skipAuth: true });

export const resetPassword = (payload) =>
  api.post(API.RESET_PASSWORD, payload, { skipAuth: true });

/* ---------- chat ---------- */

export const getChatRooms = () => api.get(API.CHATROOM_LIST_CREATE);

export const createChatRoom = (userIds, groupName = '') => {
  const payload = {
    user_ids: userIds,
    is_group_chat: userIds.length > 1
  };

  if (groupName && userIds.length > 1) {
    payload.name = groupName;
  }

  return api.post(API.CHATROOM_LIST_CREATE, payload);
};

export const getChatRoomDetails = (id) => api.get(`${API.CHATROOM_DETAIL}${seg(id)}/`);
export const getMessages = (roomId) =>
  api.get(API.CHATMESSAGE_LIST_CREATE, { params: { room_id: roomId } });
export const sendMessage = (roomId, message) =>
  api.post(API.CHATMESSAGE_LIST_CREATE, { room_id: roomId, message });

export const editMessage = (roomId, messageId, message) =>
  api.put(API.CHATMESSAGE_LIST_CREATE, {
    message_id: messageId,
    message,
    room_id: roomId
  });

export const deleteMessage = (roomId, messageId) =>
  api.delete(API.CHATMESSAGE_LIST_CREATE, {
    data: {
      message_id: messageId,
      room_id: roomId
    }
  });

export const deleteChatRoom = (roomId) => api.delete(`${API.CHATROOM_DETAIL}${seg(roomId)}/`);

/* ---------- friends ---------- */

export const getFriends = (search = '') =>
  api.get(API.FRIENDLIST, { params: search ? { search } : undefined });

export const searchUsers = (query) => api.get(`${API.SEARCH_USER}${seg(query)}/`);

export const sendFriendRequest = (receiverUsername) =>
  api.post(API.SEND_FRIEND_REQUEST, { receiver: receiverUsername });

export const getPendingRequests = () => api.get(API.PENDING_REQUESTS);

export const respondToFriendRequest = (requestId, action) =>
  api.post(`${API.RESPOND_REQUEST}${seg(requestId)}/`, { action });

/* ---------- users ---------- */

export const getUserDetails = () => api.get(API.USER_DETAIL);
export const updateUserDetails = (formData) => api.put(API.USER_DETAIL, formData);
export const deactivateAccount = () => api.delete(API.USER_DETAIL);
export const getUserProfileById = (id) => api.get(`${API.USER_BY_ID}${seg(id)}/`);
