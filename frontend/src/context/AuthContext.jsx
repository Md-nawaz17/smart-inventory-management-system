import { useState } from "react";
import api, { clearStoredAuth, getStoredUser, saveAuth } from "../api/axios";
import { AuthContext } from "./AuthContextObject";
import { useToast } from "./ToastContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const login = async (email, password, { remember = true } = {}) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data, { remember });
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid email or password.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveAuth(data);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || "Could not create account.";
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
