import { useEffect, useState, useCallback, useRef } from "react";

import { UserAuth } from "@/types/user-auth";
import { getCurrentUserProfile } from "@/services/users-service";

// Función para obtener el usuario del localStorage
function getStoredUser(): UserAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const hasFetched = useRef(false);

  // Cargar usuario del localStorage al montar (solo en cliente)
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  // Cargar perfil del backend una sola vez
  useEffect(() => {
    if (!user || hasFetched.current || profileLoaded) return;

    const loadProfile = async () => {
      hasFetched.current = true;
      try {
        const profile = await getCurrentUserProfile();

        // Actualizar con datos del backend
        const updatedUser: UserAuth = {
          ...user,
          nombres: profile.nombres || user.nombres,
          apellidos: profile.apellidos || user.apellidos,
          telefono: profile.telefono ?? user.telefono,
          biografia: profile.biografia ?? user.biografia,
          photoUrl: profile.photoUrl ?? user.photoUrl,
        };

        // Actualizar localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileLoaded(true);
      } catch (err) {
        console.warn("No se pudo cargar el perfil del backend");
        setProfileLoaded(true);
      }
    };

    loadProfile();
  }, [user, profileLoaded]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorage = () => {
      const stored = getStoredUser();
      setUser(stored);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Función para refrescar manualmente
  const refreshProfile = useCallback(async () => {
    const stored = getStoredUser();
    if (!stored) return;

    try {
      const profile = await getCurrentUserProfile();
      const updatedUser: UserAuth = {
        ...stored,
        nombres: profile.nombres || stored.nombres,
        apellidos: profile.apellidos || stored.apellidos,
        telefono: profile.telefono ?? stored.telefono,
        biografia: profile.biografia ?? stored.biografia,
        photoUrl: profile.photoUrl ?? stored.photoUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      // Mantener datos locales
    }
  }, []);

  return { user, isLoading, refreshProfile };
}
