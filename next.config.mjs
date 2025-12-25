/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Ignorar errores de ESLint durante el build (temporal)
    // TODO: Corregir todos los errores de linting y remover esta opción
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
}

export default nextConfig
