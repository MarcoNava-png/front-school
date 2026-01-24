import { cn, getInitials, formatCurrency } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (classNames)', () => {
    it('debe combinar clases simples', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('debe manejar clases condicionales', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('active')
    })

    it('debe ignorar valores falsy', () => {
      const result = cn('base', false, null, undefined, '', 'valid')
      expect(result).toBe('base valid')
    })

    it('debe hacer merge de clases de Tailwind correctamente', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('debe manejar arrays de clases', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('debe manejar objetos condicionales', () => {
      const result = cn({
        'class-true': true,
        'class-false': false,
      })
      expect(result).toBe('class-true')
    })
  })

  describe('getInitials', () => {
    it('debe obtener iniciales de un nombre completo', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('debe obtener inicial de un solo nombre', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('debe manejar nombres con multiples palabras', () => {
      expect(getInitials('John Michael Doe')).toBe('JMD')
    })

    it('debe convertir a mayusculas', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('debe retornar ? para string vacio', () => {
      expect(getInitials('')).toBe('?')
    })

    it('debe retornar ? para string con solo espacios', () => {
      expect(getInitials('   ')).toBe('?')
    })

    it('debe manejar espacios extras entre palabras', () => {
      expect(getInitials('John    Doe')).toBe('JD')
    })

    it('debe manejar espacios al inicio y final', () => {
      expect(getInitials('  John Doe  ')).toBe('JD')
    })
  })

  describe('formatCurrency', () => {
    it('debe formatear un monto en USD por defecto', () => {
      const result = formatCurrency(1000)
      expect(result).toBe('$1,000.00')
    })

    it('debe formatear un monto en MXN', () => {
      const result = formatCurrency(1000, { currency: 'MXN', locale: 'es-MX' })
      expect(result).toContain('1,000')
    })

    it('debe manejar decimales', () => {
      const result = formatCurrency(1000.50)
      expect(result).toBe('$1,000.50')
    })

    it('debe manejar montos negativos', () => {
      const result = formatCurrency(-500)
      expect(result).toContain('-')
      expect(result).toContain('500')
    })

    it('debe formatear sin decimales cuando noDecimals es true', () => {
      const result = formatCurrency(1000.99, { noDecimals: true })
      expect(result).toBe('$1,001')
    })

    it('debe respetar minimumFractionDigits', () => {
      const result = formatCurrency(1000, { minimumFractionDigits: 2 })
      expect(result).toBe('$1,000.00')
    })

    it('debe respetar maximumFractionDigits', () => {
      const result = formatCurrency(1000.12345, { maximumFractionDigits: 2 })
      expect(result).toContain('1,000.12')
    })

    it('debe manejar el monto cero', () => {
      const result = formatCurrency(0)
      expect(result).toBe('$0.00')
    })

    it('debe manejar montos muy grandes', () => {
      const result = formatCurrency(1000000)
      expect(result).toBe('$1,000,000.00')
    })

    it('debe manejar montos muy pequenos', () => {
      const result = formatCurrency(0.01)
      expect(result).toBe('$0.01')
    })
  })
})
