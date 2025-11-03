"use client";
import { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Globe } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";
import { useAuth } from "@/hooks/use-auth";

import { LoginForm } from "../../_components/login-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function LoginV2() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Accede a tu cuenta</h1>
          <p className="text-muted-foreground text-sm">Introduzca sus datos para iniciar sesión.</p>
        </div>
        <div className="space-y-4">
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="text-muted-foreground size-4" />
          ENG
        </div>
      </div>
    </>
  );
}
