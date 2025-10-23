import { useCallback } from "react";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  return useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem("access_token");

    // Limpiar cookie
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";

    router.replace("/auth/v2/login");
  }, [router]);
}
