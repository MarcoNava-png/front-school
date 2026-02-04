import { renderHook, act } from '@testing-library/react'

import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile Hook', () => {
  const MOBILE_BREAKPOINT = 768

  let originalInnerWidth: number
  let matchMediaListeners: Array<() => void> = []

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    matchMediaListeners = []

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: window.innerWidth < MOBILE_BREAKPOINT,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            matchMediaListeners.push(callback)
          }
        }),
        removeEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            matchMediaListeners = matchMediaListeners.filter((cb) => cb !== callback)
          }
        }),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    })
  })

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: width,
    })
  }

  it('debe retornar false cuando el ancho es mayor al breakpoint', () => {
    setWindowWidth(1024)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('debe retornar true cuando el ancho es menor al breakpoint', () => {
    setWindowWidth(375)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('debe retornar false cuando el ancho es exactamente el breakpoint', () => {
    setWindowWidth(768)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('debe retornar true cuando el ancho es justo debajo del breakpoint', () => {
    setWindowWidth(767)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('debe actualizar cuando cambia el tamano de la ventana', () => {
    setWindowWidth(1024)

    const { result, rerender } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      setWindowWidth(375)

      matchMediaListeners.forEach((listener) => listener())
    })

    rerender()
    expect(result.current).toBe(true)
  })

  it('debe limpiar el event listener al desmontar', () => {
    setWindowWidth(1024)

    const { unmount } = renderHook(() => useIsMobile())

    expect(matchMediaListeners.length).toBe(1)

    unmount()

    expect(matchMediaListeners.length).toBe(0)
  })
})
