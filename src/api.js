// src/api.js

const BASE_URL = "http://127.0.0.1:8000/users/";

export const API = {
  REGISTER: `${BASE_URL}register/`,
  LOGIN: `${BASE_URL}login/`,
  LOGOUT: `${BASE_URL}logout/`,
  FRIENDLIST: `${BASE_URL}friend-list/`,
  SEND_FRIEND_REQUEST: `${BASE_URL}send-friend-request/`,
  SEARCH_USER: `${BASE_URL}user-search/` // Matches your path('user-search/<str:username>/')
};

export const apiConfig = {
  timeout: 10000, // 10-second timeout for all requests
};  