"use client";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { Globe } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";
import { useAuth } from "@/hooks/use-auth";

import { LoginForm } from "../../_components/login-form";

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
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] px-4">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Accede a tu cuenta
          </h1>
          <p className="text-muted-foreground text-base">
            Introduzca sus datos para iniciar sesión en el sistema.
          </p>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 shadow-xl">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 flex w-full justify-between px-10 text-muted-foreground">
        <div className="text-xs">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1.5 text-xs">
          <Globe className="size-3.5" />
          Español
        </div>
      </div>
    </>
  );
}
