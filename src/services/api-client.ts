import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convertir a milisegundos
    return Date.now() >= expirationTime
  } catch {
    return true // Si hay error al parsear, consideramos el token como expirado
  }
}

// Función para limpiar la sesión
function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
  }
}

// Interceptor de peticiones - agrega el token
axiosInstance.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')

      if (token != null && token != undefined) {
        // Verificar si el token ha expirado antes de enviarlo
        if (isTokenExpired(token)) {
          clearSession()
          // Redirigir al login si no estamos ya en esa página
          if (!window.location.pathname.includes('/auth/')) {
            window.location.href = '/auth/v2/login'
          }
          return Promise.reject(new Error('Token expirado'))
        }

        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor de respuestas - maneja errores 401
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      clearSession()

      // Solo redirigir si no estamos ya en la página de login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/v2/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
