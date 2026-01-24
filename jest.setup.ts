import '@testing-library/jest-dom'

// Mock para next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  },
}))

// Mock para next/image - version simple sin JSX
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ src, alt, ...props }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react')
    return React.createElement('img', { src, alt: alt || '', ...props })
  }),
}))

// Mock para window.matchMedia (necesario para algunos componentes UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock para ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock para IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Limpiar mocks despues de cada test
afterEach(() => {
  jest.clearAllMocks()
})
