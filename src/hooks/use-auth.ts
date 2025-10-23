import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setIsAuthenticated(!!accessToken);
    setToken(accessToken);
  }, []);

  return { isAuthenticated, token };
}
