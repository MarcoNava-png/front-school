"use client";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/v2/login");
    }
  }, [isAuthenticated, router]);

  return null;
}
