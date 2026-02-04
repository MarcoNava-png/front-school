"use client"

import { useEffect, ReactNode } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Shield, LogOut, Menu } from "lucide-react"

import { NotificationsBell } from "@/components/super-admin/notifications-bell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuperAdminAuth } from "@/hooks/use-super-admin-auth"

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, superAdmin, logout } = useSuperAdminAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/super-admin/login")
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/super-admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="border-b bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo y titulo */}
            <Link
              href="/dashboard/super-admin"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">SACI Admin</h1>
                <p className="text-xs text-muted-foreground">Panel Multi-Tenant</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard/super-admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/super-admin/tenants"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Escuelas
              </Link>
              <Link
                href="/dashboard/super-admin/reports"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Reportes
              </Link>
              <Link
                href="/dashboard/super-admin/azure-users"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Usuarios Azure
              </Link>
              <Link
                href="/dashboard/super-admin/azure-emails"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Correos
              </Link>
              <Link
                href="/dashboard/super-admin/tenants/import"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Importar
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1.5">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {superAdmin?.nombreCompleto}
                    </span>
                    <Menu className="h-4 w-4 md:hidden" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{superAdmin?.nombreCompleto}</p>
                      <p className="text-xs text-muted-foreground">{superAdmin?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mobile Navigation */}
                  <div className="md:hidden">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin/tenants">Escuelas</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin/reports">Reportes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin/azure-users">Usuarios Azure</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin/azure-emails">Correos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/super-admin/tenants/import">Importar</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>

                  {superAdmin?.accesoTotal && (
                    <DropdownMenuItem className="text-indigo-600">
                      Acceso Total
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          SACI Multi-Tenant v2.0 - Sistema de Administracion de Colegios Integrado
        </div>
      </footer>
    </div>
  )
}
