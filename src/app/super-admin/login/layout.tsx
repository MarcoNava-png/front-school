import { ReactNode } from "react"

import { Shield } from "lucide-react"

export default function SuperAdminLoginLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        {/* Panel izquierdo */}
        <div
          className="relative order-2 hidden h-full rounded-3xl lg:flex overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)',
          }}
        >
          {/* Decoracion de fondo */}
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(99, 102, 241, 0.15)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}
          />

          <div className="relative z-10 flex flex-col justify-between w-full p-10">
            {/* Header */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl mb-8">
                <Shield className="w-24 h-24 text-white" />
              </div>
              <div className="text-center text-white space-y-3">
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                  Panel de SuperAdmin
                </h1>
                <h2 className="text-2xl xl:text-3xl font-semibold text-indigo-300">
                  SACI Multi-Tenant
                </h2>
                <p className="text-sm font-medium mt-4 text-indigo-400">
                  Administracion Centralizada de Escuelas
                </p>
              </div>
            </div>

            {/* Caracteristicas */}
            <div className="text-white space-y-4 mt-8">
              <div className="grid gap-3">
                <div
                  className="flex items-center gap-3 backdrop-blur-sm p-4 rounded-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h3 className="font-medium text-sm">Gestion de Multiples Escuelas</h3>
                </div>
                <div
                  className="flex items-center gap-3 backdrop-blur-sm p-4 rounded-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h3 className="font-medium text-sm">Provisionamiento Automatico</h3>
                </div>
                <div
                  className="flex items-center gap-3 backdrop-blur-sm p-4 rounded-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h3 className="font-medium text-sm">Reportes y Metricas Globales</h3>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center text-sm mt-8 pt-6 border-t"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="text-center">
                <p className="font-medium text-white">SACI v2.0</p>
                <p className="text-xs text-indigo-300">
                  Sistema de Administracion de Colegios Integrado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho con formulario */}
        <div className="relative order-1 flex h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
          {children}
        </div>
      </div>
    </main>
  )
}
