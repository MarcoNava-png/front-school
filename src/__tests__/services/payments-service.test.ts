import apiClient from '@/services/api-client'
import { registrarPago, aplicarPago, obtenerPago } from '@/services/payments-service'

jest.mock('@/services/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('Payments Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registrarPago', () => {
    it('debe registrar un pago correctamente', async () => {
      const mockPagoId = 123
      mockedApiClient.post.mockResolvedValueOnce({ data: mockPagoId })

      const payload = {
        fechaPagoUtc: new Date().toISOString(),
        idMedioPago: 1,
        monto: 1500.0,
        moneda: 'MXN',
        referencia: 'REF-001',
        notas: 'Pago de colegiatura',
        estatus: 0,
      }

      const result = await registrarPago(payload)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/Pagos', payload)
      expect(result).toBe(mockPagoId)
    })

    it('debe manejar error al registrar pago', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network Error'))

      const payload = {
        fechaPagoUtc: new Date().toISOString(),
        idMedioPago: 1,
        monto: 1000,
        moneda: 'MXN',
        estatus: 0,
      }

      await expect(registrarPago(payload)).rejects.toThrow('Network Error')
    })
  })

  describe('aplicarPago', () => {
    it('debe aplicar un pago a recibos correctamente', async () => {
      const mockAplicacionIds = [1, 2, 3]
      mockedApiClient.post.mockResolvedValueOnce({ data: mockAplicacionIds })

      const payload = {
        idPago: 123,
        aplicaciones: [
          { idReciboDetalle: 1, monto: 500 },
          { idReciboDetalle: 2, monto: 500 },
        ],
      }

      const result = await aplicarPago(payload)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/Pagos/aplicar', payload)
      expect(result).toEqual(mockAplicacionIds)
    })

    it('debe manejar pago con una sola aplicacion', async () => {
      const mockAplicacionIds = [1]
      mockedApiClient.post.mockResolvedValueOnce({ data: mockAplicacionIds })

      const payload = {
        idPago: 456,
        aplicaciones: [{ idReciboDetalle: 10, monto: 1000 }],
      }

      const result = await aplicarPago(payload)

      expect(result).toHaveLength(1)
    })
  })

  describe('obtenerPago', () => {
    it('debe obtener los datos de un pago', async () => {
      const mockPago = {
        idPago: 123,
        fechaPagoUtc: '2024-01-15T10:30:00Z',
        idMedioPago: 1,
        monto: 1500.0,
        moneda: 'MXN',
        referencia: 'REF-001',
        notas: 'Pago de prueba',
        estatus: 0,
        idEstudiante: 456,
        matricula: '2024001',
        nombreEstudiante: 'Juan Perez',
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPago })

      const result = await obtenerPago(123)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/Pagos/123')
      expect(result).toEqual(mockPago)
      expect(result.idPago).toBe(123)
      expect(result.monto).toBe(1500.0)
    })

    it('debe manejar pago no encontrado', async () => {
      mockedApiClient.get.mockRejectedValueOnce({ response: { status: 404 } })

      await expect(obtenerPago(99999)).rejects.toEqual({ response: { status: 404 } })
    })
  })
})
