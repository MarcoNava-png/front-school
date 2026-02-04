import apiClient from '@/services/api-client'
import { generateReceipts, getReceiptById, buscarReciboPorFolio } from '@/services/receipts-service'

jest.mock('@/services/api-client')
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('Receipts Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateReceipts', () => {
    it('debe generar recibos correctamente', async () => {
      const mockRecibos = [
        {
          idRecibo: 1,
          folio: 'REC-2024-0001',
          subtotal: 5000,
          saldo: 5000,
          estatus: 'PENDIENTE',
        },
        {
          idRecibo: 2,
          folio: 'REC-2024-0002',
          subtotal: 3000,
          saldo: 3000,
          estatus: 'PENDIENTE',
        },
      ]
      mockedApiClient.post.mockResolvedValueOnce({ data: mockRecibos })

      const payload = {
        idEstudiante: 1,
        idPeriodoAcademico: 2024,
        conceptos: [
          { idConceptoPago: 1, cantidad: 1 },
          { idConceptoPago: 2, cantidad: 1 },
        ],
      }

      const result = await generateReceipts(payload as never)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/recibos/generar', payload)
      expect(result).toHaveLength(2)
      expect(result[0].folio).toBe('REC-2024-0001')
    })

    it('debe manejar error al generar recibos', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Error del servidor'))

      const payload = {
        idEstudiante: 1,
        idPeriodoAcademico: 2024,
        conceptos: [],
      }

      await expect(generateReceipts(payload as never)).rejects.toThrow('Error del servidor')
    })
  })

  describe('getReceiptById', () => {
    it('debe obtener un recibo por ID', async () => {
      const mockRecibo = {
        idRecibo: 123,
        folio: 'REC-2024-0123',
        fechaEmision: '2024-01-15',
        fechaVencimiento: '2024-02-15',
        subtotal: 5000,
        descuento: 500,
        recargos: 0,
        saldo: 4500,
        estatus: 'PENDIENTE',
        detalles: [
          { idReciboDetalle: 1, descripcion: 'Colegiatura Enero', monto: 5000 },
        ],
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockRecibo })

      const result = await getReceiptById(123)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/recibos/123')
      expect(result).not.toBeNull()
      expect(result?.folio).toBe('REC-2024-0123')
      expect(result?.saldo).toBe(4500)
    })

    it('debe retornar null si el recibo no existe', async () => {
      mockedApiClient.get.mockRejectedValueOnce({ response: { status: 404 } })

      const result = await getReceiptById(99999)

      expect(result).toBeNull()
    })

    it('debe manejar error de red y retornar null', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network Error'))

      const result = await getReceiptById(1)

      expect(result).toBeNull()
    })
  })

  describe('buscarReciboPorFolio', () => {
    it('debe encontrar recibo por folio', async () => {
      const mockRecibo = {
        idRecibo: 456,
        folio: 'REC-2024-0456',
        subtotal: 3500,
        saldo: 3500,
        estatus: 'PENDIENTE',
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockRecibo })

      const result = await buscarReciboPorFolio('REC-2024-0456')

      expect(mockedApiClient.get).toHaveBeenCalledWith('/recibos/folio/REC-2024-0456')
      expect(result?.folio).toBe('REC-2024-0456')
    })

    it('debe retornar null si el folio no existe', async () => {
      mockedApiClient.get.mockRejectedValueOnce({ response: { status: 404 } })

      const result = await buscarReciboPorFolio('FOLIO-INEXISTENTE')

      expect(result).toBeNull()
    })

    it('debe buscar con folio parcial', async () => {
      const mockRecibo = {
        idRecibo: 789,
        folio: 'REC-2024-0789',
        saldo: 1000,
      }
      mockedApiClient.get.mockResolvedValueOnce({ data: mockRecibo })

      const result = await buscarReciboPorFolio('REC-2024-0789')

      expect(result).not.toBeNull()
    })
  })
})
