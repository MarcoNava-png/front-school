import { useState } from "react";

import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  forgotPassword as forgotPasswordService,
} from "@/services/auth-service";

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginService(data);
      setLoading(false);
      if (!res.success) setError(res.error ?? "Login failed");
      return res;
    } catch (err: unknown) {
      setLoading(false);
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    logoutService();
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerService(data);
      setLoading(false);
      if (!res.success) setError(res.error ?? "Registration failed");
      return res;
    } catch (err: unknown) {
      setLoading(false);
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (data: { email: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPasswordService(data);
      setLoading(false);
      if (!res.success) setError(res.error ?? "Forgot password failed");
      return res;
    } catch (err: unknown) {
      setLoading(false);
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      return { success: false, error: message };
    }
  };

  return { login, logout, register, forgotPassword, loading, error };
}
