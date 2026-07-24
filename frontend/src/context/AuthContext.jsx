import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { getSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
      getSocket().connect();
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.data.user);
    getSocket().connect();
    return data.data.user;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    setUser(data.data.user);
    getSocket().connect();
    return data.data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updated) => setUser(updated);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
