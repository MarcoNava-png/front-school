"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/services/auth-service";

const FormSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await login({ email: data.email, password: data.password });
      if (!res.success) throw new Error(res.error ?? "Error al iniciar sesión");

      refreshAuth();

      toast.success("Inicio de sesión exitoso", {
        description: "Bienvenido " + (res.user?.nombres ?? ""),
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      let message = "Error desconocido";
      if (error instanceof Error) message = error.message;
      toast.error("Error de autenticación", { description: message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="h-11 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">Contraseña</FormLabel>
                <Link
                  href="/auth/v2/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </Form>
  );
}
