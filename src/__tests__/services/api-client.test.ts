
describe('API Client Utils', () => {
  const createMockToken = (expirationTime: number): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ exp: expirationTime, sub: 'user123' }))
    const signature = 'mock-signature'
    return `${header}.${payload}.${signature}`
  }

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      return Date.now() >= expirationTime
    } catch {
      return true
    }
  }

  describe('isTokenExpired', () => {
    it('debe retornar false para un token valido no expirado', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockToken(futureExp)

      expect(isTokenExpired(token)).toBe(false)
    })

    it('debe retornar true para un token expirado', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600
      const token = createMockToken(pastExp)

      expect(isTokenExpired(token)).toBe(true)
    })

    it('debe retornar true para un token invalido', () => {
      const invalidToken = 'invalid-token'

      expect(isTokenExpired(invalidToken)).toBe(true)
    })

    it('debe retornar true para un token con formato incorrecto', () => {
      const malformedToken = 'header.invalid-payload.signature'

      expect(isTokenExpired(malformedToken)).toBe(true)
    })

    it('debe retornar true para un token vacio', () => {
      expect(isTokenExpired('')).toBe(true)
    })
  })

  describe('Token JWT parsing', () => {
    it('debe poder parsear un payload JWT valido', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockToken(futureExp)
      const payload = JSON.parse(atob(token.split('.')[1]))

      expect(payload.exp).toBe(futureExp)
      expect(payload.sub).toBe('user123')
    })
  })
})
