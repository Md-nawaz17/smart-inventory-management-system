export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getStoredAuth = () => {
  const token = localStorage.getItem("inventoryToken");
  const user = localStorage.getItem("inventoryUser");

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

export const storeAuth = ({ token, user }) => {
  localStorage.setItem("inventoryToken", token);
  localStorage.setItem("inventoryUser", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("inventoryToken");
  localStorage.removeItem("inventoryUser");
};

export const apiRequest = async (path, options = {}, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};
