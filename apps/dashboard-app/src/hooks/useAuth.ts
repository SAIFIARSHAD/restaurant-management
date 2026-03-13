import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints/authApi";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setAuth, logout, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login({ email, password });
    console.log("FULL RES:", res);           
    console.log("RES.DATA:", res.data); 
      const { user, token } = res.data;
      setAuth(user, token);
      navigate("/dashboard");
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Invalid credentials");
    }finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return { login, handleLogout, loading, error, user, isAuthenticated };
};
