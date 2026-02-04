import { useEffect, useState, useCallback, useRef } from "react";

import { getCurrentUserProfile } from "@/services/users-service";
import { UserAuth } from "@/types/user-auth";

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

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user || hasFetched.current || profileLoaded) return;

    const loadProfile = async () => {
      hasFetched.current = true;
      try {
        const profile = await getCurrentUserProfile();

        const updatedUser: UserAuth = {
          ...user,
          nombres: profile.nombres || user.nombres,
          apellidos: profile.apellidos || user.apellidos,
          telefono: profile.telefono ?? user.telefono,
          biografia: profile.biografia ?? user.biografia,
          photoUrl: profile.photoUrl ?? user.photoUrl,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileLoaded(true);
      } catch {
        console.warn("No se pudo cargar el perfil del backend");
        setProfileLoaded(true);
      }
    };

    loadProfile();
  }, [user, profileLoaded]);

  useEffect(() => {
    const handleStorage = () => {
      const stored = getStoredUser();
      setUser(stored);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
      // silently ignore profile refresh errors
    }
  }, []);

  return { user, isLoading, refreshProfile };
}
