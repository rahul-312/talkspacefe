// src/api.js

const BASE_URL = "http://127.0.0.1:8000/users/";

export const API = {
  REGISTER: `${BASE_URL}register/`,
  LOGIN: `${BASE_URL}login/`,
  LOGOUT: `${BASE_URL}logout/`,
};

export const apiConfig = {
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
};