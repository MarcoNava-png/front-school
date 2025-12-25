import { useEffect, useState, useCallback } from "react";

interface User {
  userId: string;
  email: string;
  nombres: string;
  apellidos: string | null;
  role: string;
  photoUrl: string | null;
}

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
}

// Función para obtener el usuario del localStorage
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

  // Función para actualizar el estado de autenticación
  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const accessToken = localStorage.getItem("access_token");
    const storedUser = getStoredUser();

    // Verificar si hay token y si no ha expirado
    if (accessToken && !isTokenExpired(accessToken)) {
      setIsAuthenticated(true);
      setToken(accessToken);
      setUser(storedUser);
    } else {
      // Token expirado o no existe
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);

      // Limpiar el storage si el token está expirado
      if (accessToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
      }
    }

    setIsLoading(false);
  }, []);

  // Verificar autenticación al montar y configurar listeners
  useEffect(() => {
    checkAuth();

    // Escuchar cambios en localStorage (para sincronizar entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Verificar expiración del token periódicamente (cada minuto)
    const interval = setInterval(() => {
      checkAuth();
    }, 60000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth]);

  // Función para forzar actualización del estado
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
