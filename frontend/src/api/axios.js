import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEYS = ["token", "inventoryToken"];
const USER_KEYS = ["user", "inventoryUser"];

function getStorageAreas() {
  if (typeof window === "undefined") return [];
  return [window.localStorage, window.sessionStorage];
}

function getStoredItem(keys) {
  for (const storage of getStorageAreas()) {
    for (const key of keys) {
      const value = storage.getItem(key);
      if (value) return value;
    }
  }

  return null;
}

export function getStoredToken() {
  return getStoredItem(TOKEN_KEYS);
}

export function getStoredUser() {
  for (const storage of getStorageAreas()) {
    for (const key of USER_KEYS) {
      const value = storage.getItem(key);
      if (!value) continue;

      try {
        return JSON.parse(value);
      } catch {
        storage.removeItem(key);
      }
    }
  }

  return null;
}

export function clearStoredAuth() {
  for (const storage of getStorageAreas()) {
    [...TOKEN_KEYS, ...USER_KEYS].forEach((key) => storage.removeItem(key));
  }
}

export function saveAuth(data, { remember = true } = {}) {
  clearStoredAuth();

  const storage = remember ? window.localStorage : window.sessionStorage;
  TOKEN_KEYS.forEach((key) => storage.setItem(key, data.token));
  USER_KEYS.forEach((key) => storage.setItem(key, JSON.stringify(data.user)));
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the auth token to every request automatically
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request comes back unauthorized, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
