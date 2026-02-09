"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Clock, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { logout, refreshToken } from "@/services/auth-service";

function getTokenExpiration(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

const INACTIVITY_WARNING_MS = 5 * 60 * 1000; // 5 min sin actividad → mostrar modal
const COUNTDOWN_SECONDS = 30; // 30 segundos para responder antes de cerrar sesión
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export function SessionExpirationModal() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silentRefreshDoneRef = useRef(false);
  const modalOpenedAtRef = useRef<number | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Escuchar actividad del usuario
  useEffect(() => {
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetActivity, { passive: true });
    }
    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetActivity);
      }
    };
  }, [resetActivity]);

  // Renovar silenciosamente si el usuario está activo y el token está por expirar
  const silentRefresh = useCallback(async () => {
    if (silentRefreshDoneRef.current) return;
    silentRefreshDoneRef.current = true;
    const result = await refreshToken();
    if (result.success) {
      silentRefreshDoneRef.current = false;
    }
  }, []);

  // Verificar cada segundo
  const check = useCallback(() => {
    const exp = getTokenExpiration();
    if (!exp) return;

    const tokenRemaining = exp - Date.now();
    const inactiveMs = Date.now() - lastActivityRef.current;

    // Token ya expiró
    if (tokenRemaining <= 0) {
      logout();
      router.push("/auth/v2/login");
      return;
    }

    // Si el usuario está ACTIVO y faltan menos de 10 min → renovar silenciosamente
    if (inactiveMs < INACTIVITY_WARNING_MS && tokenRemaining <= 10 * 60 * 1000) {
      silentRefresh();
      return;
    }

    // Si el usuario está INACTIVO por 5+ min → mostrar modal con 30s de cuenta regresiva
    if (inactiveMs >= INACTIVITY_WARNING_MS && !open) {
      modalOpenedAtRef.current = Date.now();
      setOpen(true);
    }

    // Cuenta regresiva de 30 segundos desde que se abrió el modal
    if (open && modalOpenedAtRef.current) {
      const elapsed = Math.floor((Date.now() - modalOpenedAtRef.current) / 1000);
      const left = Math.max(0, COUNTDOWN_SECONDS - elapsed);
      setRemaining(left);

      // Se acabó el tiempo → cerrar sesión
      if (left <= 0) {
        logout();
        router.push("/auth/v2/login");
      }
    }
  }, [open, router, silentRefresh]);

  useEffect(() => {
    intervalRef.current = setInterval(check, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await refreshToken();
    setRefreshing(false);

    if (result.success) {
      setOpen(false);
      modalOpenedAtRef.current = null;
      resetActivity();
      silentRefreshDoneRef.current = false;
      toast.success("Sesion renovada exitosamente");
    } else {
      toast.error("No se pudo renovar la sesion. Inicia sesion nuevamente.");
      logout();
      router.push("/auth/v2/login");
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/auth/v2/login");
  };

  const displaySeconds = remaining;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            Sesion inactiva
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block text-sm">
              No hemos detectado actividad reciente. Tu sesion se cerrara automaticamente en:
            </span>
            <span className="block text-center text-3xl font-bold text-amber-600 font-mono">
              {displaySeconds}s
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesion
          </Button>
          <AlertDialogAction
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto text-white"
            style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
          >
            {refreshing ? "Renovando..." : "Continuar trabajando"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
