import { ReactNode } from "react";

import Image from "next/image";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        {/* Panel izquierdo con gradiente azul */}
        <div className="relative order-2 hidden h-full rounded-3xl lg:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between w-full p-10">
            {/* Header con logo */}
            <div className="text-white space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative bg-white rounded-2xl p-3 shadow-2xl">
                  <Image
                    src="/Logousag.png"
                    alt="Logo USAG"
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">Colegio de San Andrés</h1>
                  <h2 className="text-xl font-semibold text-blue-100">de Guanajuato</h2>
                </div>
              </div>
              <p className="text-blue-100 text-sm font-medium">Sistema de Gestión Escolar</p>
            </div>

            {/* Contenido central */}
            <div className="text-white space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Bienvenido de vuelta</h2>
                <p className="text-blue-100 text-lg">
                  Gestiona tu institución educativa de manera eficiente y moderna
                </p>
              </div>

              <div className="grid gap-4 mt-8">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-blue-300 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">Gestión Académica</h3>
                    <p className="text-sm text-blue-100">Control total de estudiantes, grupos y calificaciones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-blue-300 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">Sistema de Cobros</h3>
                    <p className="text-sm text-blue-100">Administra colegiaturas y pagos de forma sencilla</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-blue-100 text-sm">
              <div>
                <p className="font-medium text-white">Versión 1.0.0</p>
                <p className="text-xs">© 2025 Colegio de San Andrés de Guanajuato</p>
                <p className="text-xs mt-0.5">Todos los derechos reservados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho con formulario */}
        <div className="relative order-1 flex h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          {children}
        </div>
      </div>
    </main>
  );
}
