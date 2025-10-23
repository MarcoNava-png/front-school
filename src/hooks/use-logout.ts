import { useCallback } from "react";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  return useCallback(() => {
    localStorage.removeItem("access_token");
    router.replace("/auth/v2/login");
  }, [router]);
}
