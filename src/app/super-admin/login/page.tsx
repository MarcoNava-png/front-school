"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, Globe } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSuperAdminAuth } from "@/hooks/use-super-admin-auth"
import { superAdminAuthService } from "@/services/super-admin-auth-service"

const FormSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un correo electronico valido." }),
  password: z.string().min(6, { message: "La contrasena debe tener al menos 6 caracteres." }),
})

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, refreshAuth } = useSuperAdminAuth()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard/super-admin")
    }
  }, [isAuthenticated, isLoading, router])

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await superAdminAuthService.login({
        email: data.email,
        password: data.password,
      })

      if (!res.exitoso) {
        throw new Error(res.mensaje ?? "Error al iniciar sesion")
      }

      refreshAuth()

      toast.success("Inicio de sesion exitoso", {
        description: `Bienvenido ${res.superAdmin?.nombreCompleto ?? ""}`,
      })

      router.push("/dashboard/super-admin")
    } catch (error: unknown) {
      let message = "Error desconocido"
      if (error instanceof Error) message = error.message
      toast.error("Error de autenticacion", { description: message })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] px-4">
        <div className="space-y-3 text-center">
          <div className="flex justify-center mb-4 lg:hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            SuperAdmin
          </h1>
          <p className="text-muted-foreground text-base">
            Acceso al panel de administracion multi-escuela
          </p>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 shadow-xl border-indigo-100 dark:border-indigo-900/30">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Correo Electronico</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="superadmin@ejemplo.com"
                          autoComplete="email"
                          className="h-11 focus-visible:ring-indigo-500"
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
                      <FormLabel className="text-sm font-medium">Contrasena</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="********"
                          autoComplete="current-password"
                          className="h-11 focus-visible:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full h-11 text-white font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Iniciando sesion..." : "Iniciar Sesion"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 flex w-full justify-between px-10 text-muted-foreground">
        <div className="text-xs">SACI Multi-Tenant</div>
        <div className="flex items-center gap-1.5 text-xs">
          <Globe className="size-3.5 text-indigo-600" />
          Espanol
        </div>
      </div>
    </>
  )
}
