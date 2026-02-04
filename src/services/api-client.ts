import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000
    return Date.now() >= expirationTime
  } catch {
    return true
  }
}

function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
  }
}

axiosInstance.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')

      if (token != null && token != undefined) {
        if (isTokenExpired(token)) {
          clearSession()
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

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearSession()

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/v2/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
