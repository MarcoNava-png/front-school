import { useCallback } from "react";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import { clearPermissionsCache } from "./use-permissions";

export function useLogout() {
  const router: AppRouterInstance = useRouter();

  return useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";

    clearPermissionsCache();

    router.replace("/auth/v2/login");
  }, [router]);
}
