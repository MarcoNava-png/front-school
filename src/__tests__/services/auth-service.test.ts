import apiClient from '@/services/api-client'
import { login, logout, register, forgotPassword } from '@/services/auth-service'

jest.mock('@/services/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('login', () => {
    it('debe retornar error si email esta vacio', async () => {
      const result = await login({ email: '', password: 'password123' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('debe retornar error si password esta vacio', async () => {
      const result = await login({ email: 'test@test.com', password: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('debe hacer login exitoso con credenciales validas', async () => {
      const mockResponse = {
        data: {
          isSuccess: true,
          data: {
            token: 'mock-jwt-token',
            nombre: 'Test User',
            email: 'test@test.com',
          },
        },
      }
      mockedApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await login({ email: 'test@test.com', password: 'password123' })

      expect(result.success).toBe(true)
      expect(result.token).toBe('mock-jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'mock-jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.data))
    })

    it('debe retornar error cuando el servidor rechaza las credenciales', async () => {
      const mockResponse = {
        data: {
          isSuccess: false,
          messageError: 'Usuario o contrasena incorrectos',
        },
      }
      mockedApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await login({ email: 'test@test.com', password: 'wrongpassword' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuario o contrasena incorrectos')
    })

    it('debe manejar errores de red', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network Error'))

      const result = await login({ email: 'test@test.com', password: 'password123' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('logout', () => {
    it('debe limpiar localStorage y cookies al hacer logout', () => {
      logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('register', () => {
    it('debe registrar exitosamente con datos validos', async () => {
      const result = await register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
    })

    it('debe fallar si falta el nombre', async () => {
      const result = await register({
        name: '',
        email: 'test@test.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid registration data')
    })

    it('debe fallar si falta el email', async () => {
      const result = await register({
        name: 'Test User',
        email: '',
        password: 'password123',
      })

      expect(result.success).toBe(false)
    })

    it('debe fallar si falta el password', async () => {
      const result = await register({
        name: 'Test User',
        email: 'test@test.com',
        password: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('forgotPassword', () => {
    it('debe enviar email de recuperacion exitosamente', async () => {
      const result = await forgotPassword({ email: 'test@test.com' })

      expect(result.success).toBe(true)
    })

    it('debe fallar si el email esta vacio', async () => {
      const result = await forgotPassword({ email: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email required')
    })
  })
})
