import axios from 'axios'

export interface SuperAdminInfo {
  idSuperAdmin: number
  email: string
  nombreCompleto: string
  accesoTotal: boolean
  tenantsAcceso: number[]
}

export interface LoginSuperAdminRequest {
  email: string
  password: string
}

export interface LoginSuperAdminResponse {
  exitoso: boolean
  token?: string
  mensaje: string
  superAdmin?: SuperAdminInfo
}

export interface CreateSuperAdminRequest {
  email: string
  nombreCompleto: string
  password: string
  accesoTotal: boolean
}

const SUPER_ADMIN_TOKEN_KEY = 'super_admin_token'
const SUPER_ADMIN_USER_KEY = 'super_admin_user'

const superAdminAxios = axios.create({
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

function clearSuperAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY)
    localStorage.removeItem(SUPER_ADMIN_USER_KEY)
  }
}

superAdminAxios.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY)

      if (token) {
        if (isTokenExpired(token)) {
          clearSuperAdminSession()
          if (!window.location.pathname.includes('/super-admin/login')) {
            window.location.href = '/super-admin/login'
          }
          return Promise.reject(new Error('Token expirado'))
        }

        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  error => Promise.reject(error)
)

superAdminAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearSuperAdminSession()
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/super-admin/login')) {
        window.location.href = '/super-admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export const superAdminAuthService = {
  login: async (data: LoginSuperAdminRequest): Promise<LoginSuperAdminResponse> => {
    const response = await superAdminAxios.post('/superadmin/auth/login', data)
    const result = response.data as LoginSuperAdminResponse

    if (result.exitoso && result.token && result.superAdmin) {
      localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, result.token)
      localStorage.setItem(SUPER_ADMIN_USER_KEY, JSON.stringify(result.superAdmin))
    }

    return result
  },

  verify: async (): Promise<SuperAdminInfo> => {
    const response = await superAdminAxios.get('/superadmin/auth/verify')
    return response.data
  },

  create: async (data: CreateSuperAdminRequest): Promise<{ mensaje: string; idSuperAdmin: number }> => {
    const response = await superAdminAxios.post('/superadmin/auth/create', data)
    return response.data
  },

  logout: () => {
    clearSuperAdminSession()
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY)
  },

  getUser: (): SuperAdminInfo | null => {
    if (typeof window === 'undefined') return null
    try {
      const userStr = localStorage.getItem(SUPER_ADMIN_USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  isAuthenticated: (): boolean => {
    const token = superAdminAuthService.getToken()
    if (!token) return false
    return !isTokenExpired(token)
  },
}

export { superAdminAxios }
export default superAdminAuthService
