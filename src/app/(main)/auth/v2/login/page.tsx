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
          <h1
            className="text-4xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(to right, #14356F, #1e4a8f)',
            }}
          >
            Accede a tu cuenta
          </h1>
          <p className="text-muted-foreground text-base">
            Introduzca sus datos para iniciar sesión en el sistema.
          </p>
        </div>
        <div className="space-y-6">
          <div
            className="rounded-2xl border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 shadow-xl"
            style={{ borderColor: 'rgba(20, 53, 111, 0.2)' }}
          >
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 flex w-full justify-between px-10 text-muted-foreground">
        <div className="text-xs">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1.5 text-xs">
          <Globe className="size-3.5 text-[#14356F]" />
          Español
        </div>
      </div>
    </>
  );
}
