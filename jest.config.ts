import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Ruta al proyecto Next.js
  dir: './',
})

const config: Config = {
  // Proveedor de cobertura
  coverageProvider: 'v8',

  // Ambiente de pruebas para componentes React
  testEnvironment: 'jsdom',

  // Archivos de configuracion que se ejecutan antes de cada test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Mapeo de alias para imports (debe coincidir con tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Carpetas a ignorar
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Patron para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Cobertura de codigo
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
  ],

  // Umbral minimo de cobertura (opcional)
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },
}

export default createJestConfig(config)
