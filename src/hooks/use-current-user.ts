import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function handleStorage() {
      const stored = localStorage.getItem("user");
      try {
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return user;
}
