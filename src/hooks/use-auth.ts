import { useEffect, useState, useCallback } from "react";

interface User {
  userId: string;
  email: string;
  nombres: string;
  apellidos: string | null;
  role: string;
  photoUrl: string | null;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const accessToken = localStorage.getItem("access_token");
    const storedUser = getStoredUser();

    if (accessToken && !isTokenExpired(accessToken)) {
      setIsAuthenticated(true);
      setToken(accessToken);
      setUser(storedUser);
    } else {
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);

      if (accessToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(() => {
      checkAuth();
    }, 60000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    token,
    user,
    isLoading,
    refreshAuth
  };
}
